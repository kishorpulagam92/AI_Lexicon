import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
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

const SYSTEM_INSTRUCTION = `You are AI Lexicon, a concise, technically accurate AI terminology reference created for students, software developers, AI engineers, and solution architects.

Strict rules:
1. Return structured JSON matching the exact schema provided.
2. Keep every field crisp, accurate, and practical—no fluff, no filler, no marketing hype.
3. NEVER invent or hallucinate definitions for unknown, nonsensical, or fabricated terms. If the user's query is not an established term in AI, machine learning, data science, or software/compute engineering relevant to AI:
   - Set "term" to the user's cleaned input.
   - Set "fullForm" to "".
   - Set "category" to "AI Fundamentals".
   - Set "difficulty" to "Beginner".
   - Set "statusNote" to a clear, honest explanation stating that this term is not recognized as established AI terminology and suggesting closest real AI concepts if any exist.
   - Set "simpleDefinition" to honestly state that no established AI definition exists for this term.
   - Set "technicalExplanation", "realWorldExample", and "whyItMatters" to brief, honest notes without fabricating fake mechanics.
4. If the query is an ambiguous acronym or term with multiple distinct meanings in AI or computing (for example: "RL", "CLIP", "RAG", "Agent", "Token", "BERT", "Prompt"), explicitly explain the ambiguity and distinct meanings in "statusNote", while focusing the main fields on the most prominent AI meaning.
5. If the term is well-defined and unambiguous, set "statusNote" to "".
6. "category" MUST be chosen from this exact list: ${CATEGORIES.join(', ')}.
7. "difficulty" MUST be exactly one of: "Beginner", "Intermediate", or "Advanced".
8. "relatedTerms" should contain 3 to 5 real, established AI terms.`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function collectAndroidFiles(rootDir: string): Array<{ relPath: string; content: string }> {
  const results: Array<{ relPath: string; content: string }> = [];
  if (!fs.existsSync(rootDir)) {
    return results;
  }

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(rootDir, fullPath).split(path.sep).join('/');
        const content = fs.readFileSync(fullPath, 'utf-8');
        results.push({ relPath, content });
      }
    }
  };

  walk(rootDir);

  // Always include the canonical 60-term offline JSON inside Android assets
  const termsJsonPath = path.join(__dirname, 'src', 'data', 'terms.json');
  const assetRelPath = 'app/src/main/assets/ai_lexicon_terms.json';
  if (fs.existsSync(termsJsonPath) && !results.some((f) => f.relPath === assetRelPath)) {
    results.push({
      relPath: assetRelPath,
      content: fs.readFileSync(termsJsonPath, 'utf-8'),
    });
  }

  results.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return results;
}

function detectFileLanguage(filePath: string): 'kotlin' | 'json' | 'xml' | 'gradle' | 'markdown' | 'properties' {
  if (filePath.endsWith('.gradle.kts')) return 'gradle';
  if (filePath.endsWith('.kt')) return 'kotlin';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.xml')) return 'xml';
  if (filePath.endsWith('.md')) return 'markdown';
  return 'properties';
}

const FILE_SUMMARIES: Record<string, string> = {
  'README.md': 'Step-by-step Android Studio, Firebase AI Logic SDK, and emulator setup guide',
  'settings.gradle.kts': 'Gradle project settings and repository configuration',
  'build.gradle.kts': 'Root Gradle build plugins for Kotlin, Jetpack Compose, and Firebase',
  'gradle.properties': 'JVM, AndroidX, and Kotlin compiler properties',
  'app/build.gradle.kts': 'App dependencies: Material 3, Jetpack Compose, Firebase AI Logic SDK, Serialization',
  'app/src/main/AndroidManifest.xml': 'Android manifest declaring internet permission and MainActivity',
  'app/src/main/res/values/strings.xml': 'Application name and tagline string resources',
  'app/src/main/res/values/themes.xml': 'Dark navy window theme preventing white launch flash',
  'app/src/main/assets/ai_lexicon_terms.json': 'Bundled offline 60-term AI terminology dataset across all 12 categories',
  'app/src/main/java/com/kishorpulagam/ailexicon/MainActivity.kt': 'Single-activity Compose entry point with edge-to-edge dark navy chrome',
  'app/src/main/java/com/kishorpulagam/ailexicon/model/LexiconTerm.kt': 'Kotlin data models for terms, 12 categories, difficulty levels, and source tags',
  'app/src/main/java/com/kishorpulagam/ailexicon/data/LocalLexiconRepository.kt': 'Offline repository parsing the bundled 60-term JSON from Android assets',
  'app/src/main/java/com/kishorpulagam/ailexicon/data/GeminiLexiconService.kt': 'Firebase AI Logic SDK integration with Schema.obj structured JSON output',
  'app/src/main/java/com/kishorpulagam/ailexicon/ui/theme/Theme.kt': 'Material 3 dark navy palette, blue accents, and typography scale',
  'app/src/main/java/com/kishorpulagam/ailexicon/ui/LexiconViewModel.kt': 'StateFlow ViewModel managing search, category filters, session AI history, and errors',
  'app/src/main/java/com/kishorpulagam/ailexicon/ui/HomeScreen.kt': 'Jetpack Compose UI: header, search + Explain with AI, category strip, cards, detail sheet, copy',
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/explain', async (req, res) => {
    const rawTerm = typeof req.body?.term === 'string' ? req.body.term.trim() : '';

    if (!rawTerm) {
      res.status(400).json({ error: 'Please enter an AI term or acronym to explain.' });
      return;
    }

    if (rawTerm.length > 120) {
      res.status(400).json({ error: 'Term is too long. Please keep queries under 120 characters.' });
      return;
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Explain the following AI term or acronym concisely and accurately: "${rawTerm}"`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              term: {
                type: Type.STRING,
                description: 'Canonical AI term or acronym.',
              },
              fullForm: {
                type: Type.STRING,
                description: 'Full expanded form if the term is an acronym or abbreviation; otherwise empty string.',
              },
              category: {
                type: Type.STRING,
                description: `Best matching category from: ${CATEGORIES.join(', ')}`,
              },
              difficulty: {
                type: Type.STRING,
                description: 'Exactly one of: Beginner, Intermediate, or Advanced.',
              },
              simpleDefinition: {
                type: Type.STRING,
                description: 'Clear 1-2 sentence plain-English definition.',
              },
              technicalExplanation: {
                type: Type.STRING,
                description: 'Concise, technically accurate architectural or mechanistic explanation.',
              },
              realWorldExample: {
                type: Type.STRING,
                description: 'Concrete real-world software, product, or engineering example.',
              },
              whyItMatters: {
                type: Type.STRING,
                description: 'Why this concept matters to developers, AI engineers, or architects.',
              },
              relatedTerms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 5 related established AI terms.',
              },
              statusNote: {
                type: Type.STRING,
                description:
                  'Empty string for unambiguous known terms. For ambiguous terms, explain the distinct meanings. For unknown/fabricated terms, state clearly that it is not established AI terminology.',
              },
            },
            required: [
              'term',
              'fullForm',
              'category',
              'difficulty',
              'simpleDefinition',
              'technicalExplanation',
              'realWorldExample',
              'whyItMatters',
              'relatedTerms',
              'statusNote',
            ],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawJson) as {
        term?: string;
        fullForm?: string;
        category?: string;
        difficulty?: string;
        simpleDefinition?: string;
        technicalExplanation?: string;
        realWorldExample?: string;
        whyItMatters?: string;
        relatedTerms?: string[];
        statusNote?: string;
      };

      const validDifficulty =
        parsed.difficulty === 'Beginner' ||
        parsed.difficulty === 'Intermediate' ||
        parsed.difficulty === 'Advanced'
          ? parsed.difficulty
          : 'Intermediate';

      const validCategory = (CATEGORIES as readonly string[]).includes(parsed.category ?? '')
        ? parsed.category!
        : 'AI Fundamentals';

      const normalizedTerm = (parsed.term || rawTerm).trim();
      const slug = normalizedTerm
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      res.json({
        id: `ai-${slug || 'term'}-${Date.now()}`,
        term: normalizedTerm,
        fullForm: parsed.fullForm && parsed.fullForm.trim().length > 0 ? parsed.fullForm.trim() : null,
        category: validCategory,
        difficulty: validDifficulty,
        simpleDefinition: parsed.simpleDefinition?.trim() || 'No definition returned.',
        technicalExplanation: parsed.technicalExplanation?.trim() || '',
        realWorldExample: parsed.realWorldExample?.trim() || '',
        whyItMatters: parsed.whyItMatters?.trim() || '',
        relatedTerms: Array.isArray(parsed.relatedTerms)
          ? parsed.relatedTerms.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
          : [],
        source: 'ai-generated',
        statusNote: parsed.statusNote && parsed.statusNote.trim().length > 0 ? parsed.statusNote.trim() : null,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected Gemini API error';
      console.error('[AI Lexicon /api/explain error]:', message);

      if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED') || message.includes('403')) {
        res.status(403).json({
          error: 'Gemini API authentication failed. Please verify your API key in Settings > Secrets.',
        });
        return;
      }

      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        res.status(429).json({
          error: 'Gemini API rate limit reached. Please wait a moment and try again.',
        });
        return;
      }

      res.status(502).json({
        error: 'Could not reach Gemini right now. Check your connection and try again.',
      });
    }
  });

  app.get('/api/android-files', (_req, res) => {
    try {
      const androidDir = path.join(__dirname, 'android');
      const files = collectAndroidFiles(androidDir).map((file) => ({
        path: file.relPath,
        language: detectFileLanguage(file.relPath),
        summary: FILE_SUMMARIES[file.relPath] ?? 'Android project source file',
        content: file.content,
      }));
      res.json({ files });
    } catch (err) {
      console.error('[AI Lexicon /api/android-files error]:', err);
      res.status(500).json({ error: 'Unable to load Android project files.' });
    }
  });

  app.get('/api/android-project.zip', async (_req, res) => {
    try {
      const androidDir = path.join(__dirname, 'android');
      const files = collectAndroidFiles(androidDir);
      const zip = new JSZip();
      const folder = zip.folder('AILexicon-Android');
      if (folder) {
        for (const file of files) {
          folder.file(file.relPath, file.content);
        }
      }
      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="AI-Lexicon-Android.zip"');
      res.send(buffer);
    } catch (err) {
      console.error('[AI Lexicon /api/android-project.zip error]:', err);
      res.status(500).json({ error: 'Could not package Android project ZIP.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Lexicon server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
