package com.kishorpulagam.ailexicon.data

import android.content.Context
import com.kishorpulagam.ailexicon.model.LexiconTerm
import com.kishorpulagam.ailexicon.model.LocalTermDto
import com.kishorpulagam.ailexicon.model.TermSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

class LocalLexiconRepository(private val context: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun loadBuiltInTerms(): List<LexiconTerm> = withContext(Dispatchers.IO) {
        val rawJson = context.assets
            .open("ai_lexicon_terms.json")
            .bufferedReader()
            .use { it.readText() }

        val parsed = json.decodeFromString<List<LocalTermDto>>(rawJson)

        parsed
            .map { dto ->
                LexiconTerm(
                    id = dto.id,
                    term = dto.term,
                    fullForm = dto.fullForm?.takeIf { it.isNotBlank() },
                    category = dto.category,
                    difficulty = dto.difficulty,
                    simpleDefinition = dto.simpleDefinition,
                    technicalExplanation = dto.technicalExplanation,
                    realWorldExample = dto.realWorldExample,
                    whyItMatters = dto.whyItMatters,
                    relatedTerms = dto.relatedTerms,
                    source = TermSource.BUILT_IN
                )
            }
            .sortedBy { it.term.lowercase() }
    }
}
