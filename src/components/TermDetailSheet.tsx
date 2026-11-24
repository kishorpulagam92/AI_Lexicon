import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Sparkles,
  X,
} from 'lucide-react';
import type { LexiconTerm } from '../types/lexicon';
import {
  copyTextToClipboard,
  formatTermForClipboard,
} from '../utils/lexiconUtils';

interface TermDetailSheetProps {
  term: LexiconTerm | null;
  onClose: () => void;
  onSelectRelatedTerm: (relatedName: string) => void;
  knownTermNames: Set<string>;
}

export function TermDetailSheet({
  term,
  onClose,
  onSelectRelatedTerm,
  knownTermNames,
}: TermDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [term?.id]);

  useEffect(() => {
    if (!term) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [term, onClose]);

  if (!term) return null;

  const isAi = term.source === 'ai-generated';

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(formatTermForClipboard(term));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#040814]/75 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[#1F3254] bg-[#0D172B] shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle affordance */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span
            aria-hidden="true"
            className="h-1.5 w-10 rounded-full bg-[#24385E]"
          />
        </div>

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1F3254] px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h2
              id="term-detail-title"
              className="font-display text-2xl font-bold leading-tight text-[#F1F5F9]"
            >
              {term.term}
            </h2>
            {term.fullForm && (
              <p className="mt-1 font-mono text-sm text-[#60A5FA]">
                {term.fullForm}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#94A3B8]">
              <span>{term.category}</span>
              <span aria-hidden="true" className="text-[#334155]">
                ·
              </span>
              <span>{term.difficulty}</span>
              <span aria-hidden="true" className="text-[#334155]">
                ·
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  isAi ? 'text-[#60A5FA]' : 'text-[#CBD5E1]'
                }`}
              >
                {isAi ? (
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {isAi ? 'AI-Generated (Gemini Flash)' : 'Built-in Offline Term'}
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close term details"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#1F3254] bg-[#101C34] text-[#94A3B8] transition-colors hover:bg-[#152442] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {term.statusNote && (
            <div className="flex items-start gap-3 rounded-xl border border-[#3B82F6]/40 bg-[#101C34] p-4 text-sm leading-relaxed text-[#E2E8F0]">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#60A5FA]"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-[#F1F5F9]">Clarification</p>
                <p className="mt-1 text-[#CBD5E1]">{term.statusNote}</p>
              </div>
            </div>
          )}

          <section>
            <h3 className="font-display text-sm font-semibold text-[#94A3B8]">
              Simple Definition
            </h3>
            <p className="mt-2 max-w-[68ch] text-base leading-relaxed text-[#F1F5F9]">
              {term.simpleDefinition}
            </p>
          </section>

          {term.technicalExplanation && (
            <section className="border-t border-[#1F3254] pt-5">
              <h3 className="font-display text-sm font-semibold text-[#94A3B8]">
                Technical Explanation
              </h3>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-[#CBD5E1]">
                {term.technicalExplanation}
              </p>
            </section>
          )}

          {term.realWorldExample && (
            <section className="border-t border-[#1F3254] pt-5">
              <h3 className="font-display text-sm font-semibold text-[#94A3B8]">
                Real-World Example
              </h3>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-[#CBD5E1]">
                {term.realWorldExample}
              </p>
            </section>
          )}

          {term.whyItMatters && (
            <section className="border-t border-[#1F3254] pt-5">
              <h3 className="font-display text-sm font-semibold text-[#94A3B8]">
                Why It Matters
              </h3>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-[#CBD5E1]">
                {term.whyItMatters}
              </p>
            </section>
          )}

          {term.relatedTerms.length > 0 && (
            <section className="border-t border-[#1F3254] pt-5">
              <h3 className="font-display text-sm font-semibold text-[#94A3B8]">
                Related Terminology
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">
                Select any term to open its offline entry or ask Gemini Flash to explain it.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {term.relatedTerms.map((related) => {
                  const isKnown = knownTermNames.has(related.toLowerCase());
                  return (
                    <button
                      key={related}
                      type="button"
                      onClick={() => onSelectRelatedTerm(related)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1F3254] bg-[#101C34] px-3.5 py-2 text-xs font-medium text-[#60A5FA] transition-colors duration-150 hover:border-[#3B82F6] hover:bg-[#152442] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
                    >
                      <span>{related}</span>
                      {!isKnown && (
                        <Sparkles
                          className="h-3 w-3 text-[#60A5FA]"
                          aria-label="Will explain with AI"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Footer with Primary Copy Action */}
        <div className="flex items-center justify-between gap-3 border-t border-[#1F3254] bg-[#0B1426] px-5 py-4 sm:px-7">
          <span className="text-xs text-[#64748B]">
            {isAi
              ? 'Stored in your current AI Session'
              : 'Available 100% offline'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Copied Explanation</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy Explanation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
