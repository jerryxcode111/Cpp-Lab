import React from 'react';
import { ArrowLeft, Code2 } from 'lucide-react';

interface PracticeStubViewProps {
  onBackToCompiler: () => void;
  onLoadTopicExample: (topicId: string) => void;
}

export const StubViews: React.FC<PracticeStubViewProps> = ({
  onBackToCompiler,
  onLoadTopicExample,
}) => {
  const practiceChallenges = [
    { id: 'pointers', title: 'Swap Two Numbers Using Pointers', difficulty: 'Easy', tag: 'Pointers' },
    { id: 'pointers', title: 'Allocate and Free a Dynamic Array', difficulty: 'Medium', tag: 'Memory Check' },
    { id: 'stl', title: 'Sort and Deduplicate a Vector', difficulty: 'Easy', tag: 'STL' },
    { id: 'oop', title: 'Design an Encapsulated Bank Account', difficulty: 'Easy', tag: 'OOP' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-xs font-medium text-[#0284c7] dark:text-sky-400 mb-3">
          <Code2 className="w-4 h-4" />
          <span>Practice Tasks · Coming Next</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 text-balance">
          Split-Screen C++ Challenges &amp; Memory Sanitizer
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-2xl">
          Dedicated split-screen coding tasks with automated test suites and Valgrind / AddressSanitizer leak checks are next up. Select a starter exercise below to load it into the Online C++ Compiler right now.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {practiceChallenges.map((task, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onLoadTopicExample(task.id)}
              className="text-left p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:border-[#0284c7] dark:hover:border-sky-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{task.tag}</span>
                <span>{task.difficulty}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {task.title}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBackToCompiler}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Online C++ Compiler
        </button>
      </div>
    </section>
  );
};
