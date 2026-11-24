import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { AndroidProjectView } from './components/AndroidProjectView';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { TermCard } from './components/TermCard';
import { TermDetailSheet } from './components/TermDetailSheet';
import { TopBar } from './components/TopBar';
import { CATEGORIES } from './types/lexicon';
import type { AppView, LexiconTerm } from './types/lexicon';
import {
  BUILT_IN_TERMS,
  filterAndSortTerms,
  findMatchingTerm,
} from './utils/lexiconUtils';

const SUGGESTED_AI_TERMS = [
  'FlashAttention',
  'MoE',
  'Speculative Decoding',
  'DPO',
  'vLLM',
];

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sessionAiTerms, setSessionAiTerms] = useState<LexiconTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<LexiconTerm | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainingQuery, setExplainingQuery] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const allTerms = useMemo(
    () => [...BUILT_IN_TERMS, ...sessionAiTerms],
    [sessionAiTerms]
  );

  const knownTermNames = useMemo(() => {
    const set = new Set<string>();
    for (const item of allTerms) {
      set.add(item.term.toLowerCase());
      if (item.fullForm) {
        set.add(item.fullForm.toLowerCase());
      }
    }
    return set;
  }, [allTerms]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allTerms.length };
    for (const cat of CATEGORIES) {
      counts[cat] = 0;
    }
    for (const item of allTerms) {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      } else {
        counts[item.category] = 1;
      }
    }
    return counts;
  }, [allTerms]);

  const filteredTerms = useMemo(
    () => filterAndSortTerms(allTerms, searchQuery, selectedCategory),
    [allTerms, searchQuery, selectedCategory]
  );

  const handleExplainWithAi = async (explicitTerm?: string) => {
    const query = (explicitTerm ?? searchQuery).trim();
    if (!query) {
      setErrorMessage('Enter an AI term or acronym first, then select Explain with AI.');
      setLastFailedQuery(null);
      return;
    }

    // Reuse existing session AI entry if already generated in this session
    const cachedAi = findMatchingTerm(sessionAiTerms, query);
    if (cachedAi) {
      setErrorMessage(null);
      setLastFailedQuery(null);
      setSelectedTerm(cachedAi);
      return;
    }

    setIsExplaining(true);
    setExplainingQuery(query);
    setErrorMessage(null);
    setLastFailedQuery(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: query }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (LexiconTerm & { error?: string })
        | { error?: string }
        | null;

      if (!response.ok || !payload || !('term' in payload)) {
        throw new Error(
          payload?.error || 'Could not generate an explanation right now. Please try again.'
        );
      }

      const newTerm: LexiconTerm = {
        ...payload,
        source: 'ai-generated',
      };

      setSessionAiTerms((prev) => [
        newTerm,
        ...prev.filter(
          (item) => item.term.toLowerCase() !== newTerm.term.toLowerCase()
        ),
      ]);
      setSelectedTerm(newTerm);
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? 'Network connection failed. Check your internet connection and try again.'
          : err instanceof Error
            ? err.message
            : 'Unable to reach Gemini right now. Please try again.';
      setErrorMessage(msg);
      setLastFailedQuery(query);
    } finally {
      setIsExplaining(false);
      setExplainingQuery(null);
    }
  };

  const handleSelectRelatedTerm = (relatedName: string) => {
    const existing = findMatchingTerm(allTerms, relatedName);
    if (existing) {
      setSelectedTerm(existing);
      return;
    }
    setSelectedTerm(null);
    setSearchQuery(relatedName);
    setActiveView('dictionary');
    void handleExplainWithAi(relatedName);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setErrorMessage(null);
    setLastFailedQuery(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#081020] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12)_0%,_rgba(8,16,32,0)_55%)] text-[#F1F5F9]">
      <TopBar
        activeView={activeView}
        sessionCount={sessionAiTerms.length}
        onSelectView={(view) => {
          setActiveView(view);
          setErrorMessage(null);
        }}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {activeView === 'dictionary' && (
          <div className="space-y-7">
            {/* Hero Title, Tagline, and Search + Explain with AI */}
            <section className="space-y-6">
              <div className="max-w-3xl">
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
                  AI Lexicon
                </h1>
                <p className="mt-2 text-base text-[#CBD5E1] sm:text-lg">
                  Understand AI. One term at a time.
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  by KishorPulagam · {BUILT_IN_TERMS.length} built-in offline terms across 12 categories
                </p>
              </div>

              {/* Search Bar + Primary Explain with AI Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (filteredTerms.length === 0 || searchQuery.trim().length > 0) {
                    void handleExplainWithAi();
                  }
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Search acronym or full form (e.g. RAG, LoRA, Retrieval-Augmented Generation)..."
                    aria-label="Search AI terminology"
                    className="min-h-[48px] w-full rounded-2xl border border-[#1F3254] bg-[#101C34] py-3 pr-11 pl-12 text-sm text-[#F1F5F9] placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none sm:text-[15px]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setErrorMessage(null);
                      }}
                      aria-label="Clear search query"
                      className="absolute top-1/2 right-2 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-[#152442] hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isExplaining}
                  className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Explaining...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>Explain with AI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Inline Error Banner with Retry */}
              {errorMessage && (
                <div
                  role="alert"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/40 bg-[#101C34] px-4 py-3.5 text-sm text-[#F1F5F9]"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                      aria-hidden="true"
                    />
                    <span>{errorMessage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lastFailedQuery && (
                      <button
                        type="button"
                        onClick={() => void handleExplainWithAi(lastFailedQuery)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#152442] px-3 py-1.5 text-xs font-semibold text-[#60A5FA] transition-colors hover:bg-[#1E335C] hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Try Again</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setLastFailedQuery(null);
                      }}
                      aria-label="Dismiss error"
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#94A3B8] hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading Indicator Card during Gemini Request */}
              {isExplaining && explainingQuery && (
                <div
                  aria-live="polite"
                  className="flex items-center gap-4 rounded-2xl border border-[#3B82F6]/40 bg-[#101C34] p-5"
                >
                  <Loader2
                    className="h-5 w-5 shrink-0 animate-spin text-[#60A5FA]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-[#F1F5F9]">
                      Asking Gemini Flash about &ldquo;{explainingQuery}&rdquo;
                    </p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      Generating a concise structured definition, technical breakdown, real-world example, and related terms.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Horizontally Scrollable Category Filters */}
            <section className="space-y-3">
              <CategoryFilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryCounts={categoryCounts}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#94A3B8] tabular-nums">
                <p>
                  Showing <span className="font-semibold text-[#F1F5F9]">{filteredTerms.length}</span>{' '}
                  {filteredTerms.length === 1 ? 'term' : 'terms'} alphabetically
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                  {sessionAiTerms.length > 0
                    ? ` · ${sessionAiTerms.length} AI-generated in this session`
                    : ''}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="font-medium text-[#60A5FA] transition-colors hover:text-white"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </section>

            {/* Alphabetical Terminology Cards or Empty State */}
            {filteredTerms.length > 0 ? (
              <section
                aria-label="Terminology list"
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredTerms.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    onSelect={setSelectedTerm}
                  />
                ))}
              </section>
            ) : (
              <section className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-8 text-center">
                <h2 className="font-display text-xl font-semibold text-[#F1F5F9]">
                  {searchQuery.trim()
                    ? `No built-in match for "${searchQuery.trim()}"`
                    : `No terms found in ${selectedCategory}`}
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#94A3B8]">
                  {searchQuery.trim()
                    ? 'This term is not in the 60-term offline dictionary yet. Ask Gemini Flash for a structured, technically accurate explanation.'
                    : 'Clear your active filters to explore all 60 built-in AI terms.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      disabled={isExplaining}
                      onClick={() => void handleExplainWithAi()}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-70"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>Explain &ldquo;{searchQuery.trim()}&rdquo; with AI</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-[#1F3254] bg-[#0B1426] px-5 py-2.5 text-sm font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6] hover:text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === 'session' && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#1F3254] pb-6 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  AI Session History
                </h1>
                <p className="mt-2 text-sm text-[#94A3B8]">
                  Every term explained by Gemini Flash during this session is stored here and
                  clearly labeled as AI-Generated.
                </p>
              </div>
              {sessionAiTerms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSessionAiTerms([])}
                  className="inline-flex min-h-[40px] shrink-0 items-center self-start rounded-xl border border-[#1F3254] bg-[#101C34] px-4 py-2 text-xs font-medium text-[#94A3B8] transition-colors hover:border-[#3B82F6] hover:text-white sm:self-auto"
                >
                  Clear Session History
                </button>
              )}
            </div>

            {sessionAiTerms.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessionAiTerms.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    onSelect={setSelectedTerm}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-8 text-center">
                <h2 className="font-display text-lg font-semibold text-[#F1F5F9]">
                  No AI-generated terms yet in this session
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#94A3B8]">
                  Try asking Gemini Flash to explain an advanced or emerging AI term that isn&apos;t
                  in the 60-term built-in dictionary:
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_AI_TERMS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isExplaining}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setActiveView('dictionary');
                        void handleExplainWithAi(suggestion);
                      }}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#1F3254] bg-[#0B1426] px-4 py-2 text-xs font-medium text-[#60A5FA] transition-colors hover:border-[#3B82F6] hover:bg-[#152442] hover:text-white disabled:opacity-60"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'android' && <AndroidProjectView />}
      </main>

      <footer className="border-t border-[#1F3254] py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-[#64748B] sm:flex-row sm:px-6 lg:px-8">
          <p>AI Lexicon by KishorPulagam · Understand AI. One term at a time.</p>
          <p>60 built-in offline terms · Structured explanations powered by Gemini Flash</p>
        </div>
      </footer>

      <TermDetailSheet
        term={selectedTerm}
        onClose={() => setSelectedTerm(null)}
        onSelectRelatedTerm={handleSelectRelatedTerm}
        knownTermNames={knownTermNames}
      />
    </div>
  );
}
