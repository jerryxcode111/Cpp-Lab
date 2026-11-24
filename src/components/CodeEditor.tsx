import React, { useRef, useMemo } from 'react';
import { TOKEN_CLASSES, tokenizeCppLine } from '../utils/cppHighlight';

interface CodeEditorProps {
  code: string;
  onChange: (nextCode: string) => void;
  onRun: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onRun }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const tokenizedLines = useMemo(() => lines.map((line) => tokenizeCppLine(line)), [lines]);

  const handleScroll = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (preRef.current) {
      preRef.current.scrollTop = textarea.scrollTop;
      preRef.current.scrollLeft = textarea.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = textarea.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextValue = code.substring(0, start) + '    ' + code.substring(end);
      onChange(nextValue);

      window.requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  return (
    <div className="relative flex h-[340px] sm:h-[380px] bg-[#0b1120] overflow-hidden select-text">
      {/* Line Number Gutter */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-12 shrink-0 py-4 pr-3 text-right font-mono text-[13px] leading-[22px] text-slate-600 bg-[#0b1120] border-r border-slate-800/80 select-none overflow-hidden tabular-nums"
      >
        {lines.map((_, idx) => (
          <div key={idx}>{idx + 1}</div>
        ))}
      </div>

      {/* Synchronized Highlight + Editable Textarea */}
      <div className="relative flex-1 overflow-hidden">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 p-4 font-mono text-[13px] leading-[22px] whitespace-pre overflow-hidden"
        >
          {tokenizedLines.map((lineTokens, lineIdx) => (
            <div key={lineIdx} className="min-h-[22px]">
              {lineTokens.length === 0 ? (
                <span> </span>
              ) : (
                lineTokens.map((tok, tokIdx) => (
                  <span key={tokIdx} className={TOKEN_CLASSES[tok.type]}>
                    {tok.text}
                  </span>
                ))
              )}
            </div>
          ))}
        </pre>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="C++ source code editor"
          className="editor-scroll absolute inset-0 w-full h-full m-0 p-4 font-mono text-[13px] leading-[22px] bg-transparent text-transparent caret-white resize-none border-0 outline-none whitespace-pre overflow-auto selection:bg-sky-500/30"
        />
      </div>
    </div>
  );
};
