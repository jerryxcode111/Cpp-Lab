import React, { useState } from 'react';
import {
  AlertCircle,
  Ban,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Loader2,
  Play,
  RotateCcw,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import {
  CompileRunResult,
  CppStandard,
  MemoryCheckResult,
  compileAndRunCpp,
  encodeSnippetToHash,
  runMemorySanitizer,
} from '../services/compiler';
import { DEFAULT_CPP_CODE } from '../data/cppContent';

export type ConsoleTab = 'output' | 'input' | 'errors' | 'memory';

interface CompilerWorkspaceProps {
  code: string;
  onCodeChange: (next: string) => void;
  standard: CppStandard;
  onStandardChange: (next: CppStandard) => void;
  stdin: string;
  onStdinChange: (next: string) => void;
  loadedTopicName: string | null;
  onResetAll: () => void;
}

const INITIAL_OUTPUT: CompileRunResult = {
  stdout: 'Hello, World!\nVector sum: 15',
  stderr: '',
  compileErrors: '',
  exitCode: 0,
  execTimeMs: null,
  timedOut: false,
  compilerBackend: 'GCC 14.2',
  hasCompileError: false,
};

export const CompilerWorkspace: React.FC<CompilerWorkspaceProps> = ({
  code,
  onCodeChange,
  standard,
  onStandardChange,
  stdin,
  onStdinChange,
  loadedTopicName,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('output');
  const [isRunning, setIsRunning] = useState(false);
  const [isCheckingMemory, setIsCheckingMemory] = useState(false);
  const [runResult, setRunResult] = useState<CompileRunResult | null>(INITIAL_OUTPUT);
  const [memoryResult, setMemoryResult] = useState<MemoryCheckResult>({
    status: 'idle',
    leaksDetected: false,
    ubDetected: false,
    summary: '',
    rawReport: '',
  });
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);

  const lineCount = code.split('\n').length;

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsCheckingMemory(true);
    setNetworkError(null);

    const standardRunPromise = compileAndRunCpp(code, standard, stdin);
    const memoryCheckPromise = runMemorySanitizer(code, standard, stdin);

    try {
      const result = await standardRunPromise;
      setRunResult(result);
      if (result.hasCompileError) {
        setActiveTab('errors');
      } else if (activeTab === 'errors') {
        setActiveTab('output');
      }
    } catch (err) {
      setNetworkError(
        err instanceof Error
          ? err.message
          : 'Unable to reach compiler backend. Please try again.'
      );
      setActiveTab('output');
    } finally {
      setIsRunning(false);
    }

    try {
      const memRes = await memoryCheckPromise;
      setMemoryResult(memRes);
    } catch {
      setMemoryResult({
        status: 'unavailable',
        leaksDetected: false,
        ubDetected: false,
        summary: 'Sanitizer check could not complete.',
        rawReport: '',
      });
    } finally {
      setIsCheckingMemory(false);
    }
  };

  const handleRunMemoryOnly = async () => {
    if (isCheckingMemory) return;
    setIsCheckingMemory(true);
    try {
      const memRes = await runMemorySanitizer(code, standard, stdin);
      setMemoryResult(memRes);
    } finally {
      setIsCheckingMemory(false);
    }
  };

  const handleShare = async () => {
    const hash = encodeSnippetToHash(code, standard);
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    window.history.replaceState(null, '', hash);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    } catch {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    }
  };

  const handleReset = () => {
    onResetAll();
    setRunResult(INITIAL_OUTPUT);
    setMemoryResult({
      status: 'idle',
      leaksDetected: false,
      ubDetected: false,
      summary: '',
      rawReport: '',
    });
    setNetworkError(null);
    setActiveTab('output');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleClearConsole = () => {
    if (activeTab === 'input') {
      onStdinChange('');
      return;
    }
    if (activeTab === 'errors') {
      setRunResult((prev) =>
        prev ? { ...prev, compileErrors: '', stderr: '', hasCompileError: false } : null
      );
      return;
    }
    if (activeTab === 'memory') {
      setMemoryResult({
        status: 'idle',
        leaksDetected: false,
        ubDetected: false,
        summary: '',
        rawReport: '',
      });
      return;
    }
    setRunResult(null);
    setNetworkError(null);
  };

  const handleCopyConsole = async () => {
    let textToCopy = '';
    if (activeTab === 'output') {
      textToCopy = runResult?.stdout || '';
    } else if (activeTab === 'input') {
      textToCopy = stdin;
    } else if (activeTab === 'errors') {
      textToCopy = [runResult?.compileErrors, runResult?.stderr].filter(Boolean).join('\n');
    } else {
      textToCopy = memoryResult.rawReport || memoryResult.summary;
    }
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setOutputCopied(true);
      window.setTimeout(() => setOutputCopied(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const hasErrorsOrWarnings = Boolean(
    runResult && (runResult.hasCompileError || runResult.compileErrors || runResult.stderr)
  );

  return (
    <section aria-label="Online C++ Compiler Workspace" className="w-full">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-70 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run (Ctrl+Enter)</span>
              </>
            )}
          </button>

          {loadedTopicName && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Loaded: {loadedTopicName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={code === DEFAULT_CPP_CODE && stdin === ''}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Dark Split-Screen Compiler Frame */}
      <div className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-[#0b1120] overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Pane: Code Editor */}
          <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Editor Sub-header */}
            <div className="h-10 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e293b] text-slate-200 font-mono text-xs font-medium">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>main.cpp</span>
              </div>

              <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className="sr-only">Select C++ Standard</span>
                <select
                  value={standard}
                  onChange={(e) => onStandardChange(e.target.value as CppStandard)}
                  aria-label="C++ standard version"
                  className="bg-[#1e293b] text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="c++23">C++23</option>
                  <option value="c++20">C++20</option>
                  <option value="c++17">C++17</option>
                  <option value="c++14">C++14</option>
                  <option value="c++11">C++11</option>
                </select>
              </label>
            </div>

            {/* Editor Area */}
            <CodeEditor code={code} onChange={onCodeChange} onRun={handleRun} />
          </div>

          {/* Right Pane: Output / Input / Errors / Memory Check Console */}
          <div className="flex flex-col bg-[#0b1120]">
            {/* Console Sub-header Tabs */}
            <div className="h-10 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeTab === 'output'
                      ? 'bg-[#1e293b] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Output
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('input')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'input'
                      ? 'bg-[#1e293b] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Input</span>
                  {stdin.trim().length > 0 && (
                    <span className="text-[10px] font-mono text-sky-400">
                      (set)
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('errors')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'errors'
                      ? 'bg-[#1e293b] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Errors</span>
                  {hasErrorsOrWarnings && (
                    <span
                      className={`text-[10px] font-mono ${
                        runResult?.hasCompileError ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      !
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('memory')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'memory'
                      ? 'bg-[#1e293b] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Memory Check</span>
                  {memoryResult.status === 'issue' && (
                    <span className="text-[10px] font-mono text-rose-400">!</span>
                  )}
                  {memoryResult.status === 'clean' && (
                    <span className="text-[10px] font-mono text-emerald-400">✓</span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClearConsole}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-1.5 py-1"
                  title="Clear current tab"
                >
                  <Ban className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyConsole}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-1.5 py-1"
                  title="Copy console output"
                >
                  {outputCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="hidden sm:inline text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Console Body */}
            <div className="h-[340px] sm:h-[380px] p-4 overflow-auto editor-scroll font-mono text-[13px] leading-[22px]">
              {activeTab === 'output' && (
                <div className="h-full flex flex-col justify-between">
                  {isRunning ? (
                    <div className="text-slate-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>
                        Compiling and running with {`g++ -std=${standard}`}...
                      </span>
                    </div>
                  ) : networkError ? (
                    <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs">
                      <div className="font-semibold mb-1">Compiler Request Failed</div>
                      <div>{networkError}</div>
                    </div>
                  ) : !runResult ? (
                    <div className="text-slate-500">
                      Console cleared. Press Run (Ctrl+Enter) to execute main.cpp.
                    </div>
                  ) : runResult.hasCompileError ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs">
                        Compilation failed with exit code {runResult.exitCode ?? 1}.
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('errors')}
                        className="text-xs text-sky-400 hover:underline cursor-pointer"
                      >
                        Inspect compiler errors →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <pre className="text-slate-100 whitespace-pre-wrap break-words m-0">
                        {runResult.stdout || '(No standard output)'}
                      </pre>

                      {runResult.stderr && (
                        <pre className="text-amber-300/90 whitespace-pre-wrap break-words text-xs m-0 pt-2 border-t border-slate-800">
                          {runResult.stderr}
                        </pre>
                      )}

                      <div className="text-slate-500 text-xs pt-2 tabular-nums">
                        Program finished with exit code {runResult.exitCode ?? 0}
                        {runResult.execTimeMs !== null ? ` · ${runResult.execTimeMs} ms` : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'input' && (
                <div className="h-full flex flex-col">
                  <div className="text-xs text-slate-400 mb-2">
                    Standard Input (stdin) — passed to <code className="text-sky-400">std::cin</code> on Run:
                  </div>
                  <textarea
                    value={stdin}
                    onChange={(e) => onStdinChange(e.target.value)}
                    placeholder="Enter input values separated by spaces or new lines..."
                    aria-label="Standard input (stdin)"
                    className="flex-1 w-full bg-[#0f172a] border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none font-mono text-[13px] leading-[20px]"
                  />
                </div>
              )}

              {activeTab === 'errors' && (
                <div>
                  {!runResult || (!runResult.compileErrors && !runResult.stderr) ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>No compiler errors or warnings detected.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          {runResult.hasCompileError ? 'Compilation Errors' : 'Compiler Warnings / Stderr'}
                        </span>
                      </div>
                      <pre className="text-xs text-rose-200 bg-[#0f172a] border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words overflow-x-auto leading-5">
                        {[runResult.compileErrors, runResult.stderr].filter(Boolean).join('\n\n')}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-semibold">
                      AddressSanitizer &amp; UBSan Analysis
                    </span>
                    <button
                      type="button"
                      onClick={handleRunMemoryOnly}
                      disabled={isCheckingMemory}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingMemory ? 'Checking...' : 'Run Sanitizer'}
                    </button>
                  </div>

                  {isCheckingMemory ? (
                    <div className="text-slate-400 text-xs flex items-center gap-2 py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>Running -fsanitize=address,undefined...</span>
                    </div>
                  ) : memoryResult.status === 'idle' ? (
                    <div className="text-slate-400 text-xs leading-relaxed border border-slate-800 rounded-lg p-3 bg-[#0f172a]">
                      Click Run (or Run Sanitizer) to inspect heap allocations, memory leaks, and undefined behavior with GCC AddressSanitizer &amp; UBSan.
                    </div>
                  ) : memoryResult.status === 'clean' ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">ASan &amp; LeakSanitizer Clean</div>
                          <div className="text-emerald-200/80 mt-0.5">{memoryResult.summary}</div>
                        </div>
                      </div>
                    </div>
                  ) : memoryResult.status === 'issue' ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">
                            {memoryResult.leaksDetected
                              ? 'Memory / LeakSanitizer Issue Detected'
                              : 'Undefined Behavior Detected'}
                          </div>
                          <div className="text-rose-200/90 mt-0.5">{memoryResult.summary}</div>
                        </div>
                      </div>
                      {memoryResult.rawReport && (
                        <pre className="text-[11px] leading-5 text-slate-200 bg-[#05080f] border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words overflow-x-auto">
                          {memoryResult.rawReport}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a] text-amber-300 text-xs">
                      {memoryResult.summary}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-[#0f172a] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>g++ -std={standard} -O2 -Wall</span>
          <span className="tabular-nums">
            {runResult?.compilerBackend || 'GCC 14.2'} · {lineCount} lines
          </span>
        </div>
      </div>
    </section>
  );
};
