export type CppStandard = 'c++23' | 'c++20' | 'c++17' | 'c++14' | 'c++11';

export interface CompileRunResult {
  stdout: string;
  stderr: string;
  compileErrors: string;
  exitCode: number | null;
  execTimeMs: number | null;
  timedOut: boolean;
  compilerBackend: string;
  hasCompileError: boolean;
}

export interface MemoryCheckResult {
  status: 'idle' | 'clean' | 'issue' | 'compile-error' | 'unavailable';
  leaksDetected: boolean;
  ubDetected: boolean;
  summary: string;
  rawReport: string;
}

const ANSI_REGEX = /\x1B\[[0-9;]*[A-Za-z]/g;

export function stripAnsi(input: string): string {
  return input.replace(ANSI_REGEX, '');
}

interface GodboltLine {
  text: string;
}

interface GodboltResponse {
  code?: number;
  timedOut?: boolean;
  stdout?: GodboltLine[];
  stderr?: GodboltLine[];
  execTime?: number;
  didExecute?: boolean;
  buildResult?: {
    code?: number;
    timedOut?: boolean;
    stdout?: GodboltLine[];
    stderr?: GodboltLine[];
    execTime?: number;
  };
}

interface WandboxResponse {
  status?: string;
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
}

function joinGodboltLines(lines?: GodboltLine[]): string {
  if (!lines || !Array.isArray(lines)) return '';
  return stripAnsi(lines.map((l) => l.text).join('\n')).trimEnd();
}

export async function compileAndRunCpp(
  code: string,
  standard: CppStandard,
  stdin: string
): Promise<CompileRunResult> {
  // Primary: Compiler Explorer (Godbolt) GCC 14.2 with CORS
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://godbolt.org/api/compiler/g142/compile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: code,
        options: {
          userArguments: `-std=${standard} -O2 -Wall -Wextra`,
          compilerOptions: {
            executorRequest: true,
          },
          executeParameters: {
            args: [],
            stdin,
          },
          filters: {
            execute: true,
          },
        },
        lang: 'c++',
      }),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Godbolt HTTP ${response.status}`);
    }

    const data: GodboltResponse = await response.json();
    const buildCode = data.buildResult?.code ?? 0;
    const buildStderr = joinGodboltLines(data.buildResult?.stderr);
    const buildStdout = joinGodboltLines(data.buildResult?.stdout);
    const compileDiag = [buildStderr, buildStdout].filter(Boolean).join('\n');

    const hasCompileError = buildCode !== 0 || !data.didExecute;
    const stdout = joinGodboltLines(data.stdout);
    const stderr = joinGodboltLines(data.stderr);

    return {
      stdout,
      stderr,
      compileErrors: compileDiag,
      exitCode: hasCompileError ? buildCode : (data.code ?? 0),
      execTimeMs: typeof data.execTime === 'number' ? data.execTime : null,
      timedOut: Boolean(data.timedOut || data.buildResult?.timedOut),
      compilerBackend: 'GCC 14.2',
      hasCompileError,
    };
  } catch {
    // Fallback: Wandbox gcc-head
    const wandboxStdMap: Record<CppStandard, string> = {
      'c++23': 'c++2b',
      'c++20': 'c++20',
      'c++17': 'c++17',
      'c++14': 'c++14',
      'c++11': 'c++11',
    };

    const startTime = performance.now();
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: 'gcc-head',
        code,
        options: `${wandboxStdMap[standard]},warning`,
        stdin,
      }),
    });

    if (!response.ok) {
      throw new Error(`Compiler API unavailable (HTTP ${response.status}).`);
    }

    const data: WandboxResponse = await response.json();
    const elapsed = Math.round(performance.now() - startTime);
    const compilerMsg = stripAnsi(data.compiler_message || data.compiler_error || '').trimEnd();
    const exitCode = data.status !== undefined && data.status !== '' ? Number(data.status) : null;
    const programOutput = stripAnsi(data.program_output || '').trimEnd();
    const programError = stripAnsi(data.program_error || '').trimEnd();
    const hasCompileError = exitCode === null && Boolean(compilerMsg);

    return {
      stdout: programOutput,
      stderr: programError,
      compileErrors: compilerMsg,
      exitCode: Number.isNaN(exitCode) ? 1 : exitCode,
      execTimeMs: elapsed,
      timedOut: false,
      compilerBackend: 'GCC (Wandbox)',
      hasCompileError,
    };
  }
}

export async function runMemorySanitizer(
  code: string,
  standard: CppStandard,
  stdin: string
): Promise<MemoryCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://godbolt.org/api/compiler/g142/compile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: code,
        options: {
          userArguments: `-std=${standard} -fsanitize=address,undefined -g -O1`,
          compilerOptions: {
            executorRequest: true,
          },
          executeParameters: {
            args: [],
            stdin,
          },
          filters: {
            execute: true,
          },
        },
        lang: 'c++',
      }),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        status: 'unavailable',
        leaksDetected: false,
        ubDetected: false,
        summary: 'Sanitizer service returned an error.',
        rawReport: '',
      };
    }

    const data: GodboltResponse = await response.json();
    const buildCode = data.buildResult?.code ?? 0;
    if (buildCode !== 0 || !data.didExecute) {
      return {
        status: 'compile-error',
        leaksDetected: false,
        ubDetected: false,
        summary: 'Fix compilation errors to run AddressSanitizer & UBSan.',
        rawReport: joinGodboltLines(data.buildResult?.stderr),
      };
    }

    const stderrText = joinGodboltLines(data.stderr);
    const leaksDetected = /LeakSanitizer|AddressSanitizer|heap-use-after-free|heap-buffer-overflow|stack-buffer-overflow/i.test(
      stderrText
    );
    const ubDetected = /runtime error:|UndefinedBehaviorSanitizer/i.test(stderrText);

    if (leaksDetected || ubDetected || (data.code !== undefined && data.code !== 0 && stderrText.length > 0)) {
      const firstErrorLine =
        stderrText
          .split('\n')
          .find((line) => line.includes('ERROR:') || line.includes('runtime error:')) ||
        'Sanitizer detected a memory or undefined behavior issue.';

      return {
        status: 'issue',
        leaksDetected,
        ubDetected,
        summary: firstErrorLine.replace(/^==\d+==/, '').trim(),
        rawReport: stderrText,
      };
    }

    return {
      status: 'clean',
      leaksDetected: false,
      ubDetected: false,
      summary: 'No memory leaks or undefined behavior detected (ASan + UBSan clean).',
      rawReport: '',
    };
  } catch {
    return {
      status: 'unavailable',
      leaksDetected: false,
      ubDetected: false,
      summary: 'Sanitizer check could not reach compiler server.',
      rawReport: '',
    };
  }
}

export function encodeSnippetToHash(code: string, standard: CppStandard): string {
  const payload = JSON.stringify({ code, standard });
  const bytes = new TextEncoder().encode(payload);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `#share=${encodeURIComponent(btoa(binary))}`;
}

export function decodeSnippetFromHash(): { code: string; standard: CppStandard } | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#share=')) return null;
    const base64 = decodeURIComponent(hash.slice('#share='.length));
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as { code?: string; standard?: string };
    const validStandards: CppStandard[] = ['c++23', 'c++20', 'c++17', 'c++14', 'c++11'];
    if (typeof parsed.code === 'string' && parsed.standard && validStandards.includes(parsed.standard as CppStandard)) {
      return { code: parsed.code, standard: parsed.standard as CppStandard };
    }
    return null;
  } catch {
    return null;
  }
}
