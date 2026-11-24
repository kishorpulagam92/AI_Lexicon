export const CATEGORIES = [
  'AI Fundamentals',
  'Machine Learning',
  'Deep Learning',
  'Generative AI',
  'LLM Engineering',
  'RAG',
  'Agentic AI',
  'Model Training',
  'Prompt Engineering',
  'MLOps and LLMOps',
  'Responsible AI',
  'AI Infrastructure',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type TermSource = 'built-in' | 'ai-generated';

export interface LexiconTerm {
  id: string;
  term: string;
  fullForm: string | null;
  category: Category | string;
  difficulty: DifficultyLevel;
  simpleDefinition: string;
  technicalExplanation: string;
  realWorldExample: string;
  whyItMatters: string;
  relatedTerms: string[];
  source: TermSource;
  statusNote?: string | null;
  generatedAt?: string;
}

export type AppView = 'dictionary' | 'session' | 'android';

export interface AndroidProjectFile {
  path: string;
  language: 'kotlin' | 'json' | 'xml' | 'gradle' | 'markdown' | 'properties';
  summary: string;
  content: string;
}
