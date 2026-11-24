import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  Loader2,
  Smartphone,
} from 'lucide-react';
import type { AndroidProjectFile } from '../types/lexicon';
import { copyTextToClipboard } from '../utils/lexiconUtils';

export function AndroidProjectView() {
  const [files, setFiles] = useState<AndroidProjectFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/android-files');
        if (!res.ok) {
          throw new Error('Could not load Android project files.');
        }
        const data = (await res.json()) as { files: AndroidProjectFile[] };
        if (!active) return;
        setFiles(data.files);
        const defaultFile =
          data.files.find((f) => f.path === 'README.md') ?? data.files[0];
        if (defaultFile) {
          setSelectedPath(defaultFile.path);
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Unable to load Android project.'
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadFiles();
    return () => {
      active = false;
    };
  }, []);

  const selectedFile = files.find((f) => f.path === selectedPath) ?? null;

  const handleCopyFile = async () => {
    if (!selectedFile) return;
    const ok = await copyTextToClipboard(selectedFile.content);
    if (ok) {
      setCopiedPath(selectedFile.path);
      window.setTimeout(() => setCopiedPath(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro + Emulator Quickstart */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#1F3254] pb-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#60A5FA]">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            <span>Kotlin · Jetpack Compose · Material 3 · Firebase AI Logic SDK</span>
          </div>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
            Native Android Studio Project
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
            The complete, beginner-friendly Android project for AI Lexicon by KishorPulagam—bundled
            with the same 60-term offline JSON dataset and configured with the official Firebase AI
            Logic SDK (<code className="font-mono text-sm text-[#CBD5E1]">com.google.firebase:firebase-ai</code>)
            so no API keys are ever hardcoded in your APK.
          </p>
        </div>

        <a
          href="/api/android-project.zip"
          download="AI-Lexicon-Android.zip"
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Download Android ZIP</span>
        </a>
      </div>

      {/* 3-Step Emulator Setup Strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-5">
          <p className="font-mono text-xs font-medium text-[#60A5FA]">Step 1</p>
          <h2 className="font-display mt-1 text-base font-semibold text-[#F1F5F9]">
            Unzip & Open in Android Studio
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
            Extract <code className="font-mono text-xs text-[#CBD5E1]">AI-Lexicon-Android.zip</code>{' '}
            and open the folder in Android Studio Ladybug (2024.2.1+). All 60 built-in terms run
            offline immediately on any API 26–35 emulator.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-5">
          <p className="font-mono text-xs font-medium text-[#60A5FA]">Step 2</p>
          <h2 className="font-display mt-1 text-base font-semibold text-[#F1F5F9]">
            Connect Firebase AI Logic
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
            Register package <code className="font-mono text-xs text-[#CBD5E1]">com.kishorpulagam.ailexicon</code>{' '}
            in Firebase Console, drop <code className="font-mono text-xs text-[#CBD5E1]">google-services.json</code>{' '}
            into <code className="font-mono text-xs text-[#CBD5E1]">app/</code>, and enable Build → AI Logic.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-5">
          <p className="font-mono text-xs font-medium text-[#60A5FA]">Step 3</p>
          <h2 className="font-display mt-1 text-base font-semibold text-[#F1F5F9]">
            Run on Pixel Emulator
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
            Launch a Pixel 8 (API 34 or 35) emulator and click Run. Search built-in terms offline or
            tap Explain with AI to test structured Gemini Flash output live.
          </p>
        </div>
      </div>

      {/* Interactive Source Code Explorer */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1F3254] bg-[#101C34] py-16 text-sm text-[#94A3B8]">
          <Loader2 className="h-5 w-5 animate-spin text-[#3B82F6]" aria-hidden="true" />
          <span>Loading Android Kotlin project files...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-[#101C34] p-6 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* File list */}
          <div className="rounded-2xl border border-[#1F3254] bg-[#101C34] p-3 lg:col-span-4">
            <p className="px-3 py-2 text-xs font-semibold text-[#94A3B8]">
              Project Files ({files.length})
            </p>
            <div className="mt-1 space-y-1">
              {files.map((file) => {
                const isSelected = file.path === selectedPath;
                const shortName = file.path.split('/').pop() ?? file.path;
                const parentDir = file.path.includes('/')
                  ? file.path.slice(0, file.path.lastIndexOf('/'))
                  : 'root';

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`flex min-h-[44px] w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] ${
                      isSelected
                        ? 'bg-[#152442] text-white'
                        : 'text-[#CBD5E1] hover:bg-[#152442]/60'
                    }`}
                  >
                    <FileCode2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isSelected ? 'text-[#60A5FA]' : 'text-[#64748B]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium">
                        {shortName}
                      </p>
                      <p className="truncate text-[11px] text-[#64748B]">
                        {parentDir}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1F3254] bg-[#0B1426] lg:col-span-8">
            {selectedFile && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F3254] bg-[#101C34] px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-[#F1F5F9]">
                      {selectedFile.path}
                    </p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      {selectedFile.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyFile}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#1F3254] bg-[#0B1426] px-3.5 py-2 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
                  >
                    {copiedPath === selectedFile.path ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#60A5FA]" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-[620px] overflow-auto p-5">
                  <pre className="font-mono text-xs leading-6 text-[#E2E8F0]">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
