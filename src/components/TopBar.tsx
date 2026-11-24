import { Download } from 'lucide-react';
import type { AppView } from '../types/lexicon';

interface TopBarProps {
  activeView: AppView;
  sessionCount: number;
  onSelectView: (view: AppView) => void;
}

export function TopBar({ activeView, sessionCount, onSelectView }: TopBarProps) {
  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'dictionary', label: 'Dictionary' },
    {
      id: 'session',
      label: sessionCount > 0 ? `AI Session (${sessionCount})` : 'AI Session',
    },
    { id: 'android', label: 'Android Project' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#1F3254] bg-[#081020]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('dictionary')}
          className="font-display shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-[#F1F5F9] transition-colors hover:text-[#60A5FA] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60A5FA]"
        >
          AI Lexicon
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-4 overflow-x-auto no-scrollbar sm:gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative shrink-0 whitespace-nowrap py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60A5FA] tabular-nums ${
                  isActive
                    ? 'text-[#F1F5F9]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[#3B82F6] sm:-bottom-[17px]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="hidden shrink-0 sm:flex">
          <a
            href="/api/android-project.zip"
            download="AI-Lexicon-Android.zip"
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download Android ZIP</span>
          </a>
        </div>
      </div>
    </header>
  );
}
