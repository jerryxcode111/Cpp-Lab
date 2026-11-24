import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Loader2,
  Menu,
  Play,
  Search,
  X,
} from 'lucide-react';
import { ALL_LESSONS, LEARN_CURRICULUM, LearnLesson } from '../data/learnContent';
import { TOKEN_CLASSES, tokenizeCppLine } from '../utils/cppHighlight';
import { compileAndRunCpp } from '../services/compiler';

interface LearnViewProps {
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onOpenInCompiler: (code: string) => void;
}

function renderRuleText(text: string, codes?: string[]) {
  if (!codes || codes.length === 0) {
    return <span>{text}</span>;
  }

  const escaped = codes
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) =>
        codes.includes(part) ? (
          <code
            key={idx}
            className="mx-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-[12px] text-slate-800 dark:text-slate-200"
          >
            {part}
          </code>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

const SyntaxHighlightedBlock: React.FC<{ code: string }> = ({ code }) => {
  const lines = useMemo(() => code.split('\n'), [code]);
  return (
    <div className="flex font-mono text-[12.5px] leading-[21px] overflow-x-auto editor-scroll">
      <div
        aria-hidden="true"
        className="w-9 shrink-0 py-3.5 pr-3 text-right text-slate-600 select-none tabular-nums border-r border-slate-800/80"
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="py-3.5 px-4 m-0 flex-1 whitespace-pre">
        {lines.map((line, i) => {
          const tokens = tokenizeCppLine(line);
          return (
            <div key={i} className="min-h-[21px]">
              {tokens.length === 0 ? (
                <span> </span>
              ) : (
                tokens.map((tok, j) => (
                  <span key={j} className={TOKEN_CLASSES[tok.type]}>
                    {tok.text}
                  </span>
                ))
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
};

interface InteractiveExampleBoxProps {
  code: string;
  defaultOutput: string;
  running: boolean;
  liveOutput: string | null;
  liveExitCode: number;
  onRun: () => void;
  onOpenInCompiler: (code: string) => void;
}

const InteractiveExampleBox: React.FC<InteractiveExampleBoxProps> = ({
  code,
  defaultOutput,
  running,
  liveOutput,
  liveExitCode,
  onRun,
  onOpenInCompiler,
}) => {
  const displayedOutput = liveOutput !== null ? liveOutput : defaultOutput;

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-[#0b1120] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Left Code Pane */}
        <div className="md:col-span-7 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="h-9 px-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              MAIN.CPP
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRun}
                disabled={running}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onOpenInCompiler(code)}
                className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Open in Compiler
              </button>
            </div>
          </div>
          <SyntaxHighlightedBlock code={code} />
        </div>

        {/* Right Output Pane */}
        <div className="md:col-span-5 flex flex-col bg-[#0b1120]">
          <div className="h-9 px-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              OUTPUT (STDOUT)
            </span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                liveExitCode === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Exit: {liveExitCode}
            </span>
          </div>
          <div className="p-4 font-mono text-xs leading-5 text-slate-200 flex-1 overflow-auto editor-scroll">
            <div className="text-slate-500 mb-2">$ g++ main.cpp &amp;&amp; ./a.out</div>
            <pre className="whitespace-pre-wrap break-words text-slate-100 m-0">
              {displayedOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LearnView: React.FC<LearnViewProps> = ({
  activeLessonId,
  onSelectLesson,
  onOpenInCompiler,
}) => {
  const [topicFilter, setTopicFilter] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [copiedQuick, setCopiedQuick] = useState(false);

  const [liveRunning, setLiveRunning] = useState(false);
  const [liveOutput, setLiveOutput] = useState<string | null>(null);
  const [liveExitCode, setLiveExitCode] = useState<number>(0);

  const [moreRunning, setMoreRunning] = useState(false);
  const [moreOutput, setMoreOutput] = useState<string | null>(null);
  const [moreExitCode, setMoreExitCode] = useState<number>(0);

  const activeIndex = useMemo(() => {
    const idx = ALL_LESSONS.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [activeLessonId]);

  const lesson: LearnLesson = ALL_LESSONS[activeIndex];
  const prevLesson = activeIndex > 0 ? ALL_LESSONS[activeIndex - 1] : null;
  const nextLesson = activeIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[activeIndex + 1] : null;

  const handleChooseLesson = (id: string) => {
    setLiveOutput(null);
    setLiveExitCode(0);
    setMoreOutput(null);
    setMoreExitCode(0);
    setMobileMenuOpen(false);
    onSelectLesson(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCurriculum = useMemo(() => {
    const q = topicFilter.trim().toLowerCase();
    if (!q) return LEARN_CURRICULUM;
    return LEARN_CURRICULUM.map((cat) => {
      const catMatches = cat.title.toLowerCase().includes(q);
      const matchingLessons = cat.lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.shortTitle.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q)
      );
      if (catMatches) return cat;
      if (matchingLessons.length > 0) return { ...cat, lessons: matchingLessons };
      return null;
    }).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [topicFilter]);

  const handleCopyQuick = async () => {
    try {
      await navigator.clipboard.writeText(lesson.quickSnippet);
      setCopiedQuick(true);
      window.setTimeout(() => setCopiedQuick(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const runExample = async (
    code: string,
    setRunning: React.Dispatch<React.SetStateAction<boolean>>,
    setOutput: React.Dispatch<React.SetStateAction<string | null>>,
    setExitCode: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setRunning(true);
    try {
      const res = await compileAndRunCpp(code, 'c++20', '');
      if (res.hasCompileError) {
        setOutput(res.compileErrors || 'Compilation failed.');
        setExitCode(res.exitCode ?? 1);
      } else {
        setOutput(res.stdout || '(No output)');
        setExitCode(res.exitCode ?? 0);
      }
    } catch {
      setOutput('Unable to reach compiler backend. Click "Open in Compiler" to test.');
      setExitCode(1);
    } finally {
      setRunning(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-[#0284c7] text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>{mobileMenuOpen ? 'Close Menu' : 'C++ Tutorial Menu'}</span>
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {lesson.categoryTitle} › {lesson.shortTitle}
        </span>
      </div>

      {/* W3Schools-Inspired 3-Column Documentation Layout in cpplab UI */}
      <div className="grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)_176px] gap-8 items-start">
        {/* Left Sidebar: Flat, Always-Visible W3Schools-Style C++ Menu */}
        <aside
          aria-label="C++ Tutorial Menu"
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto bg-white dark:bg-[#111827] lg:bg-transparent lg:dark:bg-transparent rounded-xl lg:rounded-none border border-slate-200 dark:border-slate-800 lg:border-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-800 p-3 lg:p-0 lg:pr-4 space-y-4`}
        >
          {/* Quick Topic Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              placeholder="Filter C++ topics..."
              aria-label="Filter C++ topics"
              className="w-full h-9 pl-8 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] dark:focus:border-sky-500 transition-colors"
            />
            {topicFilter && (
              <button
                type="button"
                onClick={() => setTopicFilter('')}
                aria-label="Clear topic filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Flat Grouped Sections (All Sub-Topics Immediately Visible & Hoverable) */}
          <nav aria-label="C++ Tutorial Topics" className="space-y-5 pb-4">
            {filteredCurriculum.map((cat) => (
              <div key={cat.id}>
                <h2 className="px-2.5 mb-1.5 text-[12px] font-bold tracking-tight text-slate-900 dark:text-white">
                  C++ {cat.title}
                </h2>
                <ul className="space-y-0.5">
                  {cat.lessons.map((item) => {
                    const isActive = item.id === lesson.id;
                    return (
                      <li key={item.id}>
                        <a
                          href={`#/learn/${item.id}`}
                          aria-current={isActive ? 'page' : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            handleChooseLesson(item.id);
                          }}
                          className={`block w-full px-2.5 py-1.5 rounded-md text-[13px] leading-snug transition-colors ${
                            isActive
                              ? 'bg-[#0284c7] text-white font-semibold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/75 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                          }`}
                        >
                          {item.shortTitle}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {filteredCurriculum.length === 0 && (
              <div className="px-2 py-4 text-xs text-slate-500 dark:text-slate-400">
                No topics match "{topicFilter}".
              </div>
            )}
          </nav>
        </aside>

        {/* Center Article Area */}
        <article className="min-w-0 max-w-[70ch] w-full space-y-8">
          {/* Breadcrumb + Title + Top Previous / Next Buttons */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>C++ Tutorial</span>
              <span aria-hidden="true">›</span>
              <span>{lesson.categoryTitle}</span>
              <span aria-hidden="true">›</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {lesson.shortTitle}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 text-balance">
              {lesson.title}
            </h1>

            {/* Top W3Schools-style Previous / Next Row */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
              {prevLesson ? (
                <a
                  href={`#/learn/${prevLesson.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleChooseLesson(prevLesson.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-[#0284c7] hover:text-[#0284c7] dark:hover:text-sky-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </a>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <a
                  href={`#/learn/${nextLesson.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleChooseLesson(nextLesson.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors"
                >
                  <span>Next: {nextLesson.shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}
            </div>

            <p className="text-[15.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {lesson.summary}
            </p>
          </div>

          {/* Section 1: Step-by-Step Explanation */}
          <section id="how-it-works" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              How It Works (Step by Step)
            </h2>

            <div className="grid grid-cols-1 gap-2.5">
              {lesson.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-sky-100 dark:bg-sky-500/20 text-[#0284c7] dark:text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                      {st.label}:
                    </span>
                    {st.detail}
                  </div>
                </div>
              ))}
            </div>

            {lesson.quickTable && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden mt-3">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                      {lesson.quickTable.headers.map((header, idx) => (
                        <th key={idx} className="py-2.5 px-4 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {lesson.quickTable.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-4 ${
                              cIdx === 0
                                ? 'font-mono font-semibold text-[#0284c7] dark:text-sky-400 whitespace-nowrap'
                                : cIdx === row.length - 1
                                  ? 'text-slate-700 dark:text-slate-200 font-mono text-xs'
                                  : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 2: Syntax & Quick Snippet */}
          <section id="declaring" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Syntax &amp; Quick Reference
            </h2>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 font-mono text-xs sm:text-[13px] text-[#0284c7] dark:text-sky-400 overflow-x-auto">
              {lesson.syntaxPattern}
            </div>

            <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-[#0b1120] overflow-hidden">
              <div className="h-9 px-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  CPP
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenInCompiler(lesson.workingExampleCode)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyQuick}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {copiedQuick ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <SyntaxHighlightedBlock code={lesson.quickSnippet} />
            </div>
          </section>

          {/* In-Article Advertisement Banner */}
          <aside aria-label="In-article advertisement">
            <div className="min-h-[84px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Advertisement
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  In-article leaderboard slot · Ready for AdSense / developer sponsors
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                728 × 90
              </span>
            </div>
          </aside>

          {/* Section 3: Interactive Working Example 1 */}
          <section id="example" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Example 1: Complete Working Program
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Click <strong>Run</strong> to execute this program live with GCC 14, or open it in the online C++ compiler to experiment.
            </p>

            <InteractiveExampleBox
              code={lesson.workingExampleCode}
              defaultOutput={lesson.workingExampleDefaultOutput}
              running={liveRunning}
              liveOutput={liveOutput}
              liveExitCode={liveExitCode}
              onRun={() => {
                if (!liveRunning) {
                  void runExample(
                    lesson.workingExampleCode,
                    setLiveRunning,
                    setLiveOutput,
                    setLiveExitCode
                  );
                }
              }}
              onOpenInCompiler={onOpenInCompiler}
            />
          </section>

          {/* Section 4: Interactive Practical Example 2 */}
          <section id="more-example" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Example 2: {lesson.moreExample.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {lesson.moreExample.description}
            </p>

            <InteractiveExampleBox
              code={lesson.moreExample.code}
              defaultOutput={lesson.moreExample.output}
              running={moreRunning}
              liveOutput={moreOutput}
              liveExitCode={moreExitCode}
              onRun={() => {
                if (!moreRunning) {
                  void runExample(
                    lesson.moreExample.code,
                    setMoreRunning,
                    setMoreOutput,
                    setMoreExitCode
                  );
                }
              }}
              onOpenInCompiler={onOpenInCompiler}
            />
          </section>

          {/* Section 5: Rules & Guidelines */}
          <section id="rules" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {lesson.rulesHeading}
            </h2>
            <ul className="space-y-2.5 pl-5 list-disc marker:text-slate-400 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {lesson.rules.map((rule, idx) => (
                <li key={idx}>{renderRuleText(rule.text, rule.codes)}</li>
              ))}
            </ul>
          </section>

          {/* Section 6: Common Mistake Callout */}
          <section id="mistakes" className="scroll-mt-20">
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 p-4 sm:p-5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  {lesson.commonMistakeTitle}
                </h3>
                <p className="text-xs sm:text-sm text-rose-800/90 dark:text-rose-300/90 leading-relaxed">
                  {lesson.commonMistakeBody}
                </p>
              </div>
            </div>
          </section>

          {/* End-of-Topic Practice in Compiler CTA (no task counts) */}
          <section id="practice-cta" className="scroll-mt-20">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  Try {lesson.shortTitle} in the Compiler
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Open this example inside the split-screen online C++ compiler to edit and test your own variations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenInCompiler(lesson.workingExampleCode)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
              >
                <Code2 className="w-4 h-4" />
                <span>Practice this topic</span>
              </button>
            </div>
          </section>

          {/* Bottom Prev / Next Lesson Pagination */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            {prevLesson ? (
              <a
                href={`#/learn/${prevLesson.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleChooseLesson(prevLesson.id);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-[#0284c7] hover:text-[#0284c7] dark:hover:text-sky-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous: {prevLesson.shortTitle}</span>
              </a>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <a
                href={`#/learn/${nextLesson.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleChooseLesson(nextLesson.id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition-colors"
              >
                <span>Next: {nextLesson.shortTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div />
            )}
          </div>
        </article>

        {/* Right Sidebar: On This Page + Compact Sponsor Slot */}
        <aside
          aria-label="On this page"
          className="hidden xl:block sticky top-20 space-y-6 pl-4 border-l border-slate-200 dark:border-slate-800"
        >
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              On This Page
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('declaring')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  Syntax &amp; Quick Reference
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('example')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  Example 1: Working Program
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('more-example')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  Example 2: Practical Use
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('rules')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  {lesson.rulesHeading}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('mistakes')}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  Common Mistakes
                </button>
              </li>
            </ul>
          </div>

          {/* Right Rail Advertisement Slot */}
          <div className="min-h-[180px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Advertisement
            </span>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              160 × 600 / Box Ad
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
