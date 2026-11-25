import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Code2,
  Info,
  Lightbulb,
  Menu,
  Search,
  X,
} from 'lucide-react';
import {
  ALL_LESSONS,
  LEARN_CURRICULUM,
  LearnArticleNote,
  LearnLesson,
  LearnTable,
} from '../data/learnContent';
import { TOKEN_CLASSES, tokenizeCppLine } from '../utils/cppHighlight';

interface LearnViewProps {
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onOpenInCompiler: (code: string) => void;
}

function renderRichText(text: string): React.ReactNode {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {tokens.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={idx}
              className="mx-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[13px] text-rose-700 dark:text-sky-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}

function renderRuleText(text: string, codes?: string[]) {
  if (!codes || codes.length === 0) {
    return renderRichText(text);
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
            className="mx-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[13px] text-rose-700 dark:text-sky-300"
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

const DocTable: React.FC<{ table: LearnTable }> = ({ table }) => (
  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-x-auto">
    <table className="w-full text-left border-collapse text-[13.5px]">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          {table.headers.map((header, idx) => (
            <th key={idx} className="py-2.5 px-4 font-semibold whitespace-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {table.rows.map((row, rIdx) => (
          <tr
            key={rIdx}
            className="odd:bg-white even:bg-slate-50/50 dark:odd:bg-[#111827] dark:even:bg-slate-900/30"
          >
            {row.map((cell, cIdx) => (
              <td
                key={cIdx}
                className={`py-2.5 px-4 ${
                  cIdx === 0
                    ? 'font-mono font-semibold text-[#0284c7] dark:text-sky-400 whitespace-nowrap'
                    : cIdx === row.length - 1
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {renderRichText(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CalloutNote: React.FC<{ note: LearnArticleNote }> = ({ note }) => {
  const styles =
    note.variant === 'warning'
      ? 'border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200'
      : note.variant === 'tip'
        ? 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
        : 'border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/20 text-slate-800 dark:text-sky-100';

  const Icon =
    note.variant === 'warning' ? AlertCircle : note.variant === 'tip' ? Lightbulb : Info;

  return (
    <div className={`border-l-4 rounded-r-lg px-4 py-3.5 text-[14.5px] leading-relaxed ${styles}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 shrink-0 mt-1 opacity-85" />
        <div className="space-y-1">
          {note.title && <div className="font-semibold text-[14.5px]">{note.title}</div>}
          <div>{renderRichText(note.text)}</div>
        </div>
      </div>
    </div>
  );
};

interface ExampleBlockProps {
  code: string;
  output?: string;
}

const ExampleBlock: React.FC<ExampleBlockProps> = ({ code, output }) => {
  const showOutputPane = output !== undefined;

  return (
    <div className="rounded-lg border border-slate-300 dark:border-slate-800 bg-[#0b1120] overflow-hidden">
      <div className={`grid grid-cols-1 ${showOutputPane ? 'md:grid-cols-12' : ''}`}>
        {/* Left Code Pane */}
        <div
          className={
            showOutputPane
              ? 'md:col-span-7 border-b md:border-b-0 md:border-r border-slate-800'
              : ''
          }
        >
          <div className="h-9 px-3 bg-[#0f172a] border-b border-slate-800 flex items-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Example (C++)
            </span>
          </div>
          <SyntaxHighlightedBlock code={code} />
        </div>

        {/* Right Output Pane */}
        {showOutputPane && (
          <div className="md:col-span-5 flex flex-col bg-[#0b1120]">
            <div className="h-9 px-3 bg-[#0f172a] border-b border-slate-800 flex items-center">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Output
              </span>
            </div>
            <div className="p-4 font-mono text-xs leading-5 text-slate-200 flex-1 overflow-auto editor-scroll">
              <pre className="whitespace-pre-wrap break-words text-slate-100 m-0">
                {output}
              </pre>
            </div>
          </div>
        )}
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

  const activeIndex = useMemo(() => {
    const idx = ALL_LESSONS.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [activeLessonId]);

  const lesson: LearnLesson = ALL_LESSONS[activeIndex];
  const prevLesson = activeIndex > 0 ? ALL_LESSONS[activeIndex - 1] : null;
  const nextLesson = activeIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[activeIndex + 1] : null;

  const handleChooseLesson = (id: string) => {
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const outlineItems = useMemo(() => {
    if (lesson.sections && lesson.sections.length > 0) {
      return lesson.sections.map((s) => ({ id: s.id, label: s.heading }));
    }
    return [
      { id: 'overview', label: 'Key Concepts' },
      { id: 'example', label: 'Example' },
      { id: 'more-example', label: lesson.moreExample.title },
      { id: 'rules', label: lesson.rulesHeading },
    ];
  }, [lesson]);

  const introParagraphs =
    lesson.introParagraphs && lesson.introParagraphs.length > 0
      ? lesson.introParagraphs
      : [lesson.summary];

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

      {/* 3-Column Documentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)_190px] gap-8 items-start">
        {/* Left Sidebar: Flat, Always-Visible Topic Navigation */}
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
          {/* Header + Top Previous / Next Buttons */}
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

            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
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

            {/* Flowing Intro Paragraphs */}
            <div className="space-y-3.5 text-[15.5px] text-slate-700 dark:text-slate-300 leading-7">
              {introParagraphs.map((para, idx) => (
                <p key={idx}>{renderRichText(para)}</p>
              ))}
            </div>
          </div>

          {lesson.sections && lesson.sections.length > 0 ? (
            /* Rich Multi-Section Editorial Layout */
            <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-8">
              {lesson.sections.map((section, sIdx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-20 space-y-4 ${sIdx > 0 ? 'pt-8' : ''}`}
                >
                  <h2 className="text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
                    {section.heading}
                  </h2>

                  <div className="space-y-3 text-[15.5px] text-slate-700 dark:text-slate-300 leading-7">
                    {section.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>{renderRichText(para)}</p>
                    ))}
                  </div>

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-2 pl-5 list-disc marker:text-[#0284c7] text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{renderRichText(b)}</li>
                      ))}
                    </ul>
                  )}

                  {section.table && <DocTable table={section.table} />}

                  {section.example && (
                    <div className="space-y-3 pt-1">
                      {section.example.title && (
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {section.example.title}
                        </h3>
                      )}
                      <ExampleBlock code={section.example.code} output={section.example.output} />
                      {section.example.explained && section.example.explained.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Example explained
                          </div>
                          <ul className="space-y-1.5 pl-5 list-disc marker:text-slate-400 text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            {section.example.explained.map((line, eIdx) => (
                              <li key={eIdx}>{renderRichText(line)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {section.note && <CalloutNote note={section.note} />}
                </section>
              ))}
            </div>
          ) : (
            /* Clean Editorial Layout for Additional Curriculum Lessons */
            <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-8">
              <section id="overview" className="scroll-mt-20 space-y-4">
                <h2 className="text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
                  Key Concepts
                </h2>
                <ul className="space-y-2.5 pl-5 list-disc marker:text-[#0284c7] text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.steps.map((st, idx) => (
                    <li key={idx}>
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        {st.label}:
                      </strong>{' '}
                      {renderRichText(st.detail)}
                    </li>
                  ))}
                </ul>

                {lesson.quickTable && <DocTable table={lesson.quickTable} />}

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 font-mono text-[13px] text-[#0284c7] dark:text-sky-400 overflow-x-auto">
                  {lesson.syntaxPattern}
                </div>
              </section>

              <section id="example" className="scroll-mt-20 pt-8 space-y-3">
                <h2 className="text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
                  Example
                </h2>
                <ExampleBlock
                  code={lesson.workingExampleCode}
                  output={lesson.workingExampleDefaultOutput}
                />
              </section>

              <section id="more-example" className="scroll-mt-20 pt-8 space-y-3">
                <h2 className="text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
                  {lesson.moreExample.title}
                </h2>
                <p className="text-[15.5px] text-slate-700 dark:text-slate-300 leading-7">
                  {renderRichText(lesson.moreExample.description)}
                </p>
                <ExampleBlock code={lesson.moreExample.code} output={lesson.moreExample.output} />
              </section>

              <section id="rules" className="scroll-mt-20 pt-8 space-y-4">
                <h2 className="text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
                  {lesson.rulesHeading}
                </h2>
                <ul className="space-y-2.5 pl-5 list-disc marker:text-slate-400 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.rules.map((rule, idx) => (
                    <li key={idx}>{renderRuleText(rule.text, rule.codes)}</li>
                  ))}
                </ul>

                <CalloutNote
                  note={{
                    variant: 'warning',
                    title: lesson.commonMistakeTitle,
                    text: lesson.commonMistakeBody,
                  }}
                />
              </section>
            </div>
          )}

          {/* Practice in Compiler CTA */}
          <section id="practice-cta" className="scroll-mt-20 pt-2">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  Try {lesson.shortTitle} in the Compiler
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Open this example inside the online C++ compiler to edit and test your own changes.
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

        {/* Right Sidebar: Clean On-This-Page Outline */}
        <aside
          aria-label="On this page"
          className="hidden xl:block sticky top-20 space-y-3 pl-4 border-l border-slate-200 dark:border-slate-800"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            On This Page
          </div>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            {outlineItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-[#0284c7] dark:hover:text-sky-300 transition-colors text-left cursor-pointer"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
