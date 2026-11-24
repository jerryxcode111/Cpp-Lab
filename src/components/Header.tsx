import React from 'react';
import { Moon, Sun } from 'lucide-react';

export type NavTab = 'compiler' | 'learn' | 'practice';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
}) => {
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'compiler', label: 'Compiler' },
    { id: 'learn', label: 'Learn' },
    { id: 'practice', label: 'Practice' },
  ];

  return (
    <header className="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Left: Brand Wordmark + Single-line Navigation */}
        <div className="flex items-center gap-8 h-full">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('compiler');
            }}
            className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            cpplab<span className="text-[#0284c7] dark:text-sky-400">.tech</span>
          </a>

          <nav aria-label="Primary navigation" className="flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative h-full flex items-center text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0284c7] dark:bg-sky-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
