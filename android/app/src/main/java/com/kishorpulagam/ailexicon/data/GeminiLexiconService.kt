package com.kishorpulagam.ailexicon.data

import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import com.kishorpulagam.ailexicon.model.ALL_CATEGORIES
import com.kishorpulagam.ailexicon.model.AiTermResponseDto
import com.kishorpulagam.ailexicon.model.LexiconTerm
import com.kishorpulagam.ailexicon.model.TermSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.io.IOException

/**
 * Integrates Gemini Flash securely via the Firebase AI Logic SDK for Android.
 * No API keys are hardcoded or shipped inside the APK.
 */
class GeminiLexiconService {

    private val json = Json { ignoreUnknownKeys = true }

    private val validCategories = ALL_CATEGORIES.filterNot { it == "All" }

    private val termResponseSchema = Schema.obj(
        properties = mapOf(
            "term" to Schema.string("Canonical AI term or acronym."),
            "fullForm" to Schema.string("Full expanded form if applicable, otherwise empty string."),
            "category" to Schema.string("Best matching category from: ${validCategories.joinToString(", ")}"),
            "difficulty" to Schema.string("Exactly one of: Beginner, Intermediate, or Advanced."),
            "simpleDefinition" to Schema.string("Concise 1-2 sentence plain-English definition."),
            "technicalExplanation" to Schema.string("Technically accurate architectural or mechanistic explanation."),
            "realWorldExample" to Schema.string("Concrete applied engineering or product example."),
            "whyItMatters" to Schema.string("Why this concept matters to engineers, students, and architects."),
            "relatedTerms" to Schema.array(
                items = Schema.string(),
                description = "3 to 5 related established AI terms."
            ),
            "statusNote" to Schema.string(
                "Empty string if unambiguous. Explain ambiguity for multi-meaning terms, or clearly state if unrecognized."
            )
        )
    )

    private val systemPrompt = """
        You are AI Lexicon, a concise, technically accurate AI dictionary for students, developers, AI engineers, and architects.
        1. Keep explanations concise, technically accurate, and easy to understand.
        2. NEVER invent definitions for unknown or nonsensical terms. If a term is not established AI terminology, state that honestly in statusNote and simpleDefinition.
        3. If a term or acronym is ambiguous, explain the distinct meanings clearly in statusNote.
        4. Choose category strictly from: ${validCategories.joinToString(", ")}.
        5. Choose difficulty strictly from: Beginner, Intermediate, Advanced.
    """.trimIndent()

    suspend fun explainTerm(query: String): Result<LexiconTerm> = withContext(Dispatchers.IO) {
        val cleaned = query.trim()
        if (cleaned.isEmpty()) {
            return@withContext Result.failure(
                IllegalArgumentException("Enter an AI term or acronym before asking Gemini.")
            )
        }

        try {
            val model = Firebase.ai(backend = GenerativeBackend.googleAI())
                .generativeModel(
                    modelName = "gemini-2.5-flash",
                    generationConfig = generationConfig {
                        responseMimeType = "application/json"
                        responseSchema = termResponseSchema
                    },
                    systemInstruction = content { text(systemPrompt) }
                )

            val response = model.generateContent(
                "Explain the AI term or acronym concisely and accurately: \"$cleaned\""
            )

            val rawText = response.text?.trim()
                ?: return@withContext Result.failure(
                    IllegalStateException("Gemini returned an empty response. Please try again.")
                )

            val dto = json.decodeFromString<AiTermResponseDto>(rawText)
            val normalizedDifficulty = when (dto.difficulty) {
                "Beginner", "Intermediate", "Advanced" -> dto.difficulty
                else -> "Intermediate"
            }
            val normalizedCategory = if (dto.category in validCategories) {
                dto.category
            } else {
                "AI Fundamentals"
            }

            Result.success(
                LexiconTerm(
                    id = "ai-${cleaned.lowercase().replace(Regex("[^a-z0-9]+"), "-")}-${System.currentTimeMillis()}",
                    term = dto.term.ifBlank { cleaned },
                    fullForm = dto.fullForm.takeIf { it.isNotBlank() },
                    category = normalizedCategory,
                    difficulty = normalizedDifficulty,
                    simpleDefinition = dto.simpleDefinition,
                    technicalExplanation = dto.technicalExplanation,
                    realWorldExample = dto.realWorldExample,
                    whyItMatters = dto.whyItMatters,
                    relatedTerms = dto.relatedTerms.filter { it.isNotBlank() }.take(5),
                    source = TermSource.AI_GENERATED,
                    statusNote = dto.statusNote.takeIf { it.isNotBlank() }
                )
            )
        } catch (e: IOException) {
            Result.failure(
                IllegalStateException("Network unavailable. Check your emulator or device internet connection and retry.")
            )
        } catch (e: IllegalStateException) {
            val hint = if (e.message?.contains("FirebaseApp", ignoreCase = true) == true) {
                "Firebase is not configured yet. Add google-services.json in app/ and enable AI Logic in Firebase Console."
            } else {
                e.message ?: "Unable to fetch explanation from Gemini."
            }
            Result.failure(IllegalStateException(hint))
        } catch (e: Exception) {
            Result.failure(
                IllegalStateException(e.message ?: "Gemini request failed. Please try again.")
            )
        }
    }
}
