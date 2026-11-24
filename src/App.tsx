import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { Header, NavTab } from './components/Header';
import { CompilerWorkspace } from './components/CompilerWorkspace';
import { LearnView } from './components/LearnView';
import { StubViews } from './components/StubViews';
import { Footer } from './components/Footer';
import {
  DEFAULT_CPP_CODE,
  FAQ_ITEMS,
  LEGAL_DOCS,
  LegalDocKey,
  SUPPORTED_STANDARDS,
  TOPIC_SNIPPETS,
} from './data/cppContent';
import { CppStandard, decodeSnippetFromHash } from './services/compiler';
import { ALL_LESSONS } from './data/learnContent';

const TOPIC_TO_LESSON: Record<string, string> = {
  variables: 'variables',
  loops: 'for-loop',
  functions: 'functions-basics',
  pointers: 'pointers-addresses',
  oop: 'classes-objects',
  stl: 'vector-sequence',
};

const DEFAULT_SEO_TITLE = 'Online C++ Compiler — Write, Compile & Run C++ Code | cpplab.tech';
const DEFAULT_SEO_DESC =
  'Free online C++ compiler powered by GCC 14. Write, compile, and run C++11, C++14, C++17, C++20, and C++23 code in your browser with stdin and memory checks.';

function parseLearnHash(): string | null {
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#/learn/')) {
      const id = decodeURIComponent(hash.slice('#/learn/'.length));
      if (ALL_LESSONS.some((l) => l.id === id)) return id;
    }
    if (hash === '#/learn') return 'introduction';
  } catch {
    // Ignore hash parse error
  }
  return null;
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cpplab_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [activeNav, setActiveNav] = useState<NavTab>(() =>
    parseLearnHash() ? 'learn' : 'compiler'
  );
  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => parseLearnHash() || 'introduction'
  );
  const [code, setCode] = useState<string>(() => {
    const shared = decodeSnippetFromHash();
    return shared ? shared.code : DEFAULT_CPP_CODE;
  });
  const [standard, setStandard] = useState<CppStandard>(() => {
    const shared = decodeSnippetFromHash();
    return shared ? shared.standard : 'c++20';
  });
  const [stdin, setStdin] = useState<string>('');
  const [loadedTopicName, setLoadedTopicName] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('cpplab_theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Sync browser back/forward on #/learn/<id> routes
  useEffect(() => {
    const handleHashChange = () => {
      const lessonFromHash = parseLearnHash();
      if (lessonFromHash) {
        setActiveLessonId(lessonFromHash);
        setActiveNav('learn');
      } else if (window.location.hash === '#/' || window.location.hash === '') {
        setActiveNav('compiler');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update SEO document title and meta description per active view/lesson
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (activeNav === 'learn') {
      const current = ALL_LESSONS.find((l) => l.id === activeLessonId) || ALL_LESSONS[0];
      document.title = `${current.title} — C++ Tutorial | cpplab.tech`;
      if (metaDesc) metaDesc.setAttribute('content', current.summary);
    } else if (activeNav === 'practice') {
      document.title = 'C++ Practice Challenges | cpplab.tech';
      if (metaDesc) metaDesc.setAttribute('content', DEFAULT_SEO_DESC);
    } else {
      document.title = DEFAULT_SEO_TITLE;
      if (metaDesc) metaDesc.setAttribute('content', DEFAULT_SEO_DESC);
    }
  }, [activeNav, activeLessonId]);

  const handleSelectNav = (tab: NavTab) => {
    setActiveNav(tab);
    if (tab === 'learn') {
      window.location.hash = `#/learn/${activeLessonId}`;
    } else if (tab === 'compiler' && window.location.hash.startsWith('#/learn')) {
      window.location.hash = '#/';
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    window.location.hash = `#/learn/${lessonId}`;
  };

  const handleLoadTopicInCompiler = (topicId: string) => {
    const snippet = TOPIC_SNIPPETS.find((t) => t.id === topicId);
    if (!snippet) return;
    setCode(snippet.code);
    setStandard(snippet.standard);
    setStdin(snippet.stdin);
    setLoadedTopicName(snippet.label);
    setActiveNav('compiler');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLearnTopic = (topicId: string) => {
    const lessonId = TOPIC_TO_LESSON[topicId] || 'variables';
    setActiveLessonId(lessonId);
    setActiveNav('learn');
    window.location.hash = `#/learn/${lessonId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCodeInCompiler = (nextCode: string) => {
    setCode(nextCode);
    setStandard('c++20');
    setStdin('');
    setLoadedTopicName('Learn Example');
    setActiveNav('compiler');
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAll = () => {
    setCode(DEFAULT_CPP_CODE);
    setStandard('c++20');
    setStdin('');
    setLoadedTopicName(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeNav}
        onSelectTab={handleSelectNav}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      <main className="flex-1 w-full">
        {activeNav === 'learn' ? (
          <LearnView
            activeLessonId={activeLessonId}
            onSelectLesson={handleSelectLesson}
            onOpenInCompiler={handleOpenCodeInCompiler}
          />
        ) : activeNav === 'practice' ? (
          <StubViews
            onBackToCompiler={() => handleSelectNav('compiler')}
            onLoadTopicExample={handleLoadTopicInCompiler}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Page Header */}
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Online C++ Compiler
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Write, compile, and run C++ code online.
              </p>
            </div>

            {/* Interactive Compiler Workspace */}
            <CompilerWorkspace
              code={code}
              onCodeChange={(next) => {
                setCode(next);
                if (loadedTopicName) setLoadedTopicName(null);
              }}
              standard={standard}
              onStandardChange={setStandard}
              stdin={stdin}
              onStdinChange={setStdin}
              loadedTopicName={loadedTopicName}
              onResetAll={handleResetAll}
            />

            {/* 728x90 Leaderboard Advertisement Slot (CLS-safe fixed min-height) */}
            <aside aria-label="Advertisement" className="w-full flex justify-center">
              <div className="w-full max-w-[728px] min-h-[90px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Advertisement · 728 × 90 Leaderboard
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Build, profile, and deploy native C++ workloads faster
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Developer tooling sponsorship slot — ready for Google AdSense or direct sponsors.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('docs')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sponsor Info
                </button>
              </div>
            </aside>

            {/* Start Learning C++ Quick-Jump Strip */}
            <section
              aria-labelledby="start-learning-heading"
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h2
                  id="start-learning-heading"
                  className="text-base font-semibold text-slate-900 dark:text-white mb-3"
                >
                  Start learning C++
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {TOPIC_SNIPPETS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleOpenLearnTopic(topic.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-[#0284c7] dark:hover:border-sky-500 hover:text-[#0284c7] dark:hover:text-sky-400 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('practice');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start md:self-center"
              >
                <span>Try practice tasks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>

            {/* SEO Editorial Section + Supported C++ Standards Table */}
            <section
              aria-labelledby="seo-compiler-heading"
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8"
            >
              <h2
                id="seo-compiler-heading"
                className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5"
              >
                Free Online C++ Compiler &amp; Runner
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Write, compile, and run C++ code directly in your browser without installing compilers, IDEs, or toolchains.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
                  <p>
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      cpplab.tech
                    </strong>{' '}
                    provides a fast, lightweight, and modern{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      online C++ compiler
                    </strong>{' '}
                    designed for students, interview candidates, and software engineers. Whether
                    you are learning fundamental control structures, testing Standard Template
                    Library (STL) algorithms, or experimenting with modern ISO C++ features, our
                    sandboxed environment executes your code instantly.
                  </p>
                  <p>
                    Equipped with GCC 14 backends, you can toggle between standards from ISO
                    C++11 up to ISO C++23. Standard input (stdin), compiler warning flags,
                    AddressSanitizer memory checks, and quick-share permalinks allow you to run
                    and debug algorithmic problems or share working examples with peers in seconds.
                  </p>
                </div>

                {/* Supported Standards Table */}
                <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                    Supported C++ Standards
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2 px-4 font-medium">Standard</th>
                        <th className="py-2 px-2 font-medium">Year</th>
                        <th className="py-2 px-4 font-medium">Highlights</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {SUPPORTED_STANDARDS.map((row) => (
                        <tr
                          key={row.value}
                          onClick={() => {
                            setStandard(row.value);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-4 font-mono font-semibold text-[#0284c7] dark:text-sky-400 whitespace-nowrap">
                            {row.standard}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {row.year}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {row.highlights}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section
              aria-labelledby="faq-heading"
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8"
            >
              <h2
                id="faq-heading"
                className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5"
              >
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Common questions about running and testing C++ online.
              </p>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {FAQ_ITEMS.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div key={item.id} className="bg-white dark:bg-[#111827]">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[75ch]">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer onOpenDoc={setActiveLegalDoc} />

      {/* Legal / Documentation Modal */}
      {activeLegalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
          onClick={() => setActiveLegalDoc(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="legal-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {LEGAL_DOCS[activeLegalDoc].title}
              </h2>
              <button
                type="button"
                onClick={() => setActiveLegalDoc(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {LEGAL_DOCS[activeLegalDoc].body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalDoc(null)}
                className="px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
