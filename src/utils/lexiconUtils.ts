import rawTerms from '../data/terms.json';
import type { DifficultyLevel, LexiconTerm } from '../types/lexicon';

interface RawTermEntry {
  id: string;
  term: string;
  fullForm: string | null;
  category: string;
  difficulty: string;
  simpleDefinition: string;
  technicalExplanation: string;
  realWorldExample: string;
  whyItMatters: string;
  relatedTerms: string[];
}

export const BUILT_IN_TERMS: LexiconTerm[] = (rawTerms as RawTermEntry[])
  .map((entry) => ({
    ...entry,
    difficulty: (entry.difficulty as DifficultyLevel) || 'Beginner',
    source: 'built-in' as const,
    statusNote: null,
  }))
  .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));

export function filterAndSortTerms(
  terms: LexiconTerm[],
  query: string,
  selectedCategory: string
): LexiconTerm[] {
  const normalizedQuery = query.trim().toLowerCase();

  return terms
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const termMatch = item.term.toLowerCase().includes(normalizedQuery);
      const fullFormMatch = item.fullForm
        ? item.fullForm.toLowerCase().includes(normalizedQuery)
        : false;
      const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
      const defMatch = item.simpleDefinition.toLowerCase().includes(normalizedQuery);

      return termMatch || fullFormMatch || categoryMatch || defMatch;
    })
    .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));
}

export function findMatchingTerm(terms: LexiconTerm[], targetName: string): LexiconTerm | undefined {
  const normalized = targetName.trim().toLowerCase();
  if (!normalized) return undefined;

  return terms.find(
    (item) =>
      item.term.toLowerCase() === normalized ||
      (item.fullForm && item.fullForm.toLowerCase() === normalized)
  );
}

export function formatTermForClipboard(term: LexiconTerm): string {
  const lines: string[] = [];
  lines.push(term.fullForm ? `${term.term} (${term.fullForm})` : term.term);
  lines.push(
    `${term.category} · ${term.difficulty} · ${
      term.source === 'ai-generated' ? 'AI-Generated' : 'Built-in'
    }`
  );

  if (term.statusNote) {
    lines.push('');
    lines.push(`Note: ${term.statusNote}`);
  }

  lines.push('');
  lines.push('Simple Definition');
  lines.push(term.simpleDefinition);

  if (term.technicalExplanation) {
    lines.push('');
    lines.push('Technical Explanation');
    lines.push(term.technicalExplanation);
  }

  if (term.realWorldExample) {
    lines.push('');
    lines.push('Real-World Example');
    lines.push(term.realWorldExample);
  }

  if (term.whyItMatters) {
    lines.push('');
    lines.push('Why It Matters');
    lines.push(term.whyItMatters);
  }

  if (term.relatedTerms.length > 0) {
    lines.push('');
    lines.push(`Related Terminology: ${term.relatedTerms.join(', ')}`);
  }

  lines.push('');
  lines.push('— AI Lexicon by KishorPulagam');

  return lines.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea copy fallback for iframe sandboxes
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
