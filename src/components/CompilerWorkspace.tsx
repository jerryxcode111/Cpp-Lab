import React, { useEffect, useRef, useState } from 'react';
import {
  Ban,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  Share2,
  X,
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import {
  CompileRunResult,
  CppStandard,
  ShareLinkResult,
  compileAndRunCpp,
  createShareLink,
} from '../services/compiler';
import { DEFAULT_CPP_CODE } from '../data/cppContent';

interface CompilerWorkspaceProps {
  code: string;
  onCodeChange: (next: string) => void;
  standard: CppStandard;
  stdin: string;
  onStdinChange: (next: string) => void;
  loadedTopicName: string | null;
  isLoadingShare?: boolean;
  shareLoadError?: string | null;
  onDismissShareError?: () => void;
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
  stdin,
  onStdinChange: _onStdinChange,
  loadedTopicName,
  isLoadingShare = false,
  shareLoadError = null,
  onDismissShareError,
  onResetAll,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<CompileRunResult | null>(INITIAL_OUTPUT);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareDialog, setShareDialog] = useState<ShareLinkResult | null>(null);
  const [shareCopyStatus, setShareCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [outputCopied, setOutputCopied] = useState(false);
  const lastShareCacheRef = useRef<{ signature: string; result: ShareLinkResult } | null>(null);
  const shareInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shareDialog) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareDialog(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [shareDialog]);

  const lineCount = code.split('\n').length;

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setNetworkError(null);

    try {
      const result = await compileAndRunCpp(code, standard, stdin);
      setRunResult(result);
    } catch (err) {
      setNetworkError(
        err instanceof Error
          ? err.message
          : 'Unable to reach compiler backend. Please try again.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const copyTextSafely = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to execCommand fallback
    }
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(temp);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    const signature = `${code}\0${standard}\0${stdin}`;
    setIsSharing(true);

    try {
      let result: ShareLinkResult;
      if (lastShareCacheRef.current?.signature === signature) {
        result = lastShareCacheRef.current.result;
      } else {
        result = await createShareLink(code, standard, stdin);
        lastShareCacheRef.current = { signature, result };
      }

      window.history.replaceState(null, '', result.relativePath);
      setShareDialog(result);

      const copied = await copyTextSafely(result.url);
      setShareCopyStatus(copied ? 'copied' : 'manual');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareDialog) return;
    const copied = await copyTextSafely(shareDialog.url);
    if (copied) {
      setShareCopyStatus('copied');
      window.setTimeout(() => {
        setShareCopyStatus((prev) => (prev === 'copied' ? 'idle' : prev));
      }, 2200);
    } else {
      setShareCopyStatus('manual');
      shareInputRef.current?.focus();
      shareInputRef.current?.select();
    }
  };

  const handleReset = () => {
    onResetAll();
    setRunResult(INITIAL_OUTPUT);
    setNetworkError(null);
    setShareDialog(null);
    if (window.location.hash || window.location.search.includes('s=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleClearConsole = () => {
    setRunResult(null);
    setNetworkError(null);
  };

  const handleCopyConsole = async () => {
    const textToCopy = runResult?.hasCompileError
      ? [runResult.compileErrors, runResult.stderr].filter(Boolean).join('\n')
      : runResult?.stdout || '';
    if (!textToCopy) return;
    const copied = await copyTextSafely(textToCopy);
    if (copied) {
      setOutputCopied(true);
      window.setTimeout(() => setOutputCopied(false), 1800);
    }
  };

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
            disabled={isSharing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                <span>Sharing…</span>
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

      {/* Shared Link Loading / Error Notice */}
      {isLoadingShare && (
        <div className="mb-3 px-3.5 py-2 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-200 text-xs flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Loading shared C++ snippet…</span>
        </div>
      )}

      {shareLoadError && (
        <div className="mb-3 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <span>{shareLoadError}</span>
          {onDismissShareError && (
            <button
              type="button"
              onClick={onDismissShareError}
              aria-label="Dismiss error"
              className="p-0.5 hover:opacity-80 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

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
            </div>

            {/* Editor Area */}
            <CodeEditor code={code} onChange={onCodeChange} onRun={handleRun} />
          </div>

          {/* Right Pane: Output Console */}
          <div className="flex flex-col bg-[#0b1120]">
            {/* Console Sub-header */}
            <div className="h-10 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between gap-2">
              <div className="px-2.5 py-1 rounded bg-[#1e293b] text-white text-xs font-medium">
                Output
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClearConsole}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-1.5 py-1"
                  title="Clear output"
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
                    {(runResult.compileErrors || runResult.stderr) && (
                      <pre className="text-xs text-rose-200 bg-[#0f172a] border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words overflow-x-auto leading-5 m-0">
                        {[runResult.compileErrors, runResult.stderr].filter(Boolean).join('\n\n')}
                      </pre>
                    )}
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

      {/* Shareable Link Modal */}
      {shareDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
          onClick={() => setShareDialog(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2
                id="share-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                Share C++ Snippet
              </h2>
              <button
                type="button"
                onClick={() => setShareDialog(null)}
                aria-label="Close share dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={shareInputRef}
                type="text"
                readOnly
                value={shareDialog.url}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Shareable link URL"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {shareCopyStatus === 'copied' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {shareCopyStatus === 'manual'
                  ? 'Select the link and press Ctrl+C / ⌘+C.'
                  : ''}
              </span>

              <a
                href={shareDialog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0284c7] dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
              >
                <span>Open in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
