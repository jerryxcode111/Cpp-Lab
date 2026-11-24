import React from 'react';
import { LegalDocKey } from '../data/cppContent';

interface FooterProps {
  onOpenDoc: (doc: LegalDocKey) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDoc }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onOpenDoc('docs')}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Docs
          </button>
          <button
            type="button"
            onClick={() => onOpenDoc('privacy')}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => onOpenDoc('terms')}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Terms
          </button>
        </div>

        <div>© 2026 cpplab.tech. All rights reserved.</div>
      </div>
    </footer>
  );
};
