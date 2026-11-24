import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import type { LexiconTerm } from '../types/lexicon';

interface TermCardProps {
  term: LexiconTerm;
  onSelect: (term: LexiconTerm) => void;
}

export function TermCard({ term, onSelect }: TermCardProps) {
  const isAi = term.source === 'ai-generated';

  return (
    <button
      type="button"
      onClick={() => onSelect(term)}
      className="group flex h-full w-full flex-col justify-between rounded-2xl border border-[#1F3254] bg-[#101C34] p-5 text-left transition-colors duration-150 hover:border-[#3B82F6]/60 hover:bg-[#152442] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-[#F1F5F9] group-hover:text-white">
              {term.term}
            </h3>
            {term.fullForm && (
              <p className="mt-0.5 truncate font-mono text-xs text-[#60A5FA]">
                {term.fullForm}
              </p>
            )}
          </div>
          <ChevronRight
            className="mt-1 h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#60A5FA]"
            aria-hidden="true"
          />
        </div>

        {/* Clean unboxed inline metadata — no static pill capsules */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8]">
          <span>{term.category}</span>
          <span aria-hidden="true" className="text-[#334155]">
            ·
          </span>
          <span>{term.difficulty}</span>
          <span aria-hidden="true" className="text-[#334155]">
            ·
          </span>
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              isAi ? 'text-[#60A5FA]' : 'text-[#94A3B8]'
            }`}
          >
            {isAi ? (
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isAi ? 'AI-Generated' : 'Built-in'}</span>
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#CBD5E1]">
          {term.simpleDefinition}
        </p>
      </div>
    </button>
  );
}
