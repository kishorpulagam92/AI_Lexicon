# AI Lexicon (Native Android Project)

**Understand AI. One term at a time.**  
By **KishorPulagam**

A clean, beginner-friendly native Android application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **local offline JSON** (60 curated AI terms across 12 categories), and the **Firebase AI Logic SDK** (`com.google.firebase:firebase-ai`) for structured Gemini Flash explanations—with **zero hardcoded API keys**.

---

## Project Architecture

- `app/src/main/assets/ai_lexicon_terms.json` — 60 built-in AI terms working 100% offline.
- `model/LexiconTerm.kt` — Unified Kotlin `@Serializable` data model for built-in and AI-generated terms.
- `data/LocalLexiconRepository.kt` — Loads and alphabetically sorts the offline JSON lexicon.
- `data/GeminiLexiconService.kt` — Calls Gemini Flash via **Firebase AI Logic SDK** with a strict `Schema.obj` JSON response schema.
- `ui/LexiconViewModel.kt` — Holds search, category filters, offline terms, session AI history, loading indicators, and error recovery state.
- `ui/HomeScreen.kt` — Material 3 dark navy interface with search bar, "Explain with AI" button, horizontal category filters, term cards, detail bottom sheet, and clipboard copy.
- `ui/theme/Theme.kt` — Dark navy surface palette (`#081020`, `#101C34`) and blue accents (`#3B82F6`, `#60A5FA`).

---

## Running on the Android Emulator (Step-by-Step)

### 1. Open in Android Studio
1. Install **Android Studio Ladybug (2024.2.1) or newer** with Android SDK 35.
2. Select **File → Open** and choose the `AILexicon-Android` folder.
3. Let Gradle sync finish. *(Offline dictionary mode with all 60 built-in terms works immediately on the emulator even before Firebase setup!)*

### 2. Configure Firebase AI Logic SDK (No Hardcoded API Keys)
1. Open the [Firebase Console](https://console.firebase.google.com/) and create (or select) a project.
2. Click **Add app → Android** and enter package name:
   `com.kishorpulagam.ailexicon`
3. Download `google-services.json` and place it in:
   `AILexicon-Android/app/google-services.json`
4. In Firebase Console, open **Build → AI Logic** (Gemini Developer API) and click **Get Started** to enable the Gemini Developer API backend for your Firebase project.
5. *(Recommended for production)* Enable **Firebase App Check** (Play Integrity for release builds, Debug provider for emulators) so only your Android app can call Gemini through Firebase AI Logic.

### 3. Run on Android Emulator
1. Open **Device Manager** in Android Studio and launch a **Pixel 8 (API 34 or API 35)** emulator.
2. Click **Run ▶** (`app`).
3. Try searching built-in terms like `RAG`, `LoRA`, or `Retrieval-Augmented Generation` offline, then search an unlisted term such as `FlashAttention` or `MoE` and tap **Explain with AI**.
