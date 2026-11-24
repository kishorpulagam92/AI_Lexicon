package com.kishorpulagam.ailexicon.model

import kotlinx.serialization.Serializable

val ALL_CATEGORIES: List<String> = listOf(
    "All",
    "AI Fundamentals",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "LLM Engineering",
    "RAG",
    "Agentic AI",
    "Model Training",
    "Prompt Engineering",
    "MLOps and LLMOps",
    "Responsible AI",
    "AI Infrastructure"
)

enum class TermSource(val label: String) {
    BUILT_IN("Built-in"),
    AI_GENERATED("AI-Generated")
}

@Serializable
data class LocalTermDto(
    val id: String,
    val term: String,
    val fullForm: String? = null,
    val category: String,
    val difficulty: String,
    val simpleDefinition: String,
    val technicalExplanation: String,
    val realWorldExample: String,
    val whyItMatters: String,
    val relatedTerms: List<String> = emptyList()
)

@Serializable
data class AiTermResponseDto(
    val term: String,
    val fullForm: String = "",
    val category: String = "AI Fundamentals",
    val difficulty: String = "Intermediate",
    val simpleDefinition: String,
    val technicalExplanation: String,
    val realWorldExample: String,
    val whyItMatters: String,
    val relatedTerms: List<String> = emptyList(),
    val statusNote: String = ""
)

data class LexiconTerm(
    val id: String,
    val term: String,
    val fullForm: String?,
    val category: String,
    val difficulty: String,
    val simpleDefinition: String,
    val technicalExplanation: String,
    val realWorldExample: String,
    val whyItMatters: String,
    val relatedTerms: List<String>,
    val source: TermSource,
    val statusNote: String? = null
) {
    fun toPlainTextSummary(): String = buildString {
        append(term)
        if (!fullForm.isNullOrBlank()) {
            append(" ($fullForm)")
        }
        appendLine()
        appendLine("$category · $difficulty · ${source.label}")
        if (!statusNote.isNullOrBlank()) {
            appendLine()
            appendLine("Note: $statusNote")
        }
        appendLine()
        appendLine("Simple Definition")
        appendLine(simpleDefinition)
        appendLine()
        appendLine("Technical Explanation")
        appendLine(technicalExplanation)
        appendLine()
        appendLine("Real-World Example")
        appendLine(realWorldExample)
        appendLine()
        appendLine("Why It Matters")
        appendLine(whyItMatters)
        if (relatedTerms.isNotEmpty()) {
            appendLine()
            appendLine("Related Terminology: ${relatedTerms.joinToString(", ")}")
        }
        appendLine()
        append("— AI Lexicon by KishorPulagam")
    }
}
