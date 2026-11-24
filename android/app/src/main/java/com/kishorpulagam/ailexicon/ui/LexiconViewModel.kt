package com.kishorpulagam.ailexicon.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.kishorpulagam.ailexicon.data.GeminiLexiconService
import com.kishorpulagam.ailexicon.data.LocalLexiconRepository
import com.kishorpulagam.ailexicon.model.LexiconTerm
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class LexiconUiState(
    val builtInTerms: List<LexiconTerm> = emptyList(),
    val sessionAiTerms: List<LexiconTerm> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val selectedTerm: LexiconTerm? = null,
    val isLoadingLocal: Boolean = true,
    val isLoadingAi: Boolean = false,
    val errorMessage: String? = null,
    val lastFailedQuery: String? = null
) {
    val visibleTerms: List<LexiconTerm>
        get() {
            val combined = (builtInTerms + sessionAiTerms)
                .sortedBy { it.term.lowercase() }

            val query = searchQuery.trim().lowercase()

            return combined.filter { item ->
                val matchesCategory = selectedCategory == "All" ||
                    item.category.equals(selectedCategory, ignoreCase = true)

                val matchesQuery = query.isEmpty() ||
                    item.term.lowercase().contains(query) ||
                    (item.fullForm?.lowercase()?.contains(query) == true) ||
                    item.simpleDefinition.lowercase().contains(query)

                matchesCategory && matchesQuery
            }
        }
}

class LexiconViewModel(application: Application) : AndroidViewModel(application) {

    private val localRepository = LocalLexiconRepository(application.applicationContext)
    private val geminiService = GeminiLexiconService()

    private val _uiState = MutableStateFlow(LexiconUiState())
    val uiState: StateFlow<LexiconUiState> = _uiState.asStateFlow()

    init {
        loadOfflineDictionary()
    }

    private fun loadOfflineDictionary() {
        viewModelScope.launch {
            try {
                val terms = localRepository.loadBuiltInTerms()
                _uiState.update {
                    it.copy(
                        builtInTerms = terms,
                        isLoadingLocal = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoadingLocal = false,
                        errorMessage = "Could not load offline dictionary: ${e.message}"
                    )
                }
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update {
            it.copy(
                searchQuery = query,
                errorMessage = null
            )
        }
    }

    fun onCategorySelected(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun selectTerm(term: LexiconTerm) {
        _uiState.update { it.copy(selectedTerm = term) }
    }

    fun dismissTermDetail() {
        _uiState.update { it.copy(selectedTerm = null) }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null, lastFailedQuery = null) }
    }

    fun openOrExplainRelatedTerm(relatedTermName: String) {
        val state = _uiState.value
        val existing = (state.builtInTerms + state.sessionAiTerms).firstOrNull { candidate ->
            candidate.term.equals(relatedTermName, ignoreCase = true) ||
                candidate.fullForm?.equals(relatedTermName, ignoreCase = true) == true
        }
        if (existing != null) {
            selectTerm(existing)
        } else {
            _uiState.update { it.copy(searchQuery = relatedTermName, selectedTerm = null) }
            explainWithAi(relatedTermName)
        }
    }

    fun explainWithAi(explicitQuery: String? = null) {
        val query = (explicitQuery ?: _uiState.value.searchQuery).trim()
        if (query.isEmpty()) {
            _uiState.update {
                it.copy(
                    errorMessage = "Enter an AI term or acronym first, then tap Explain with AI.",
                    lastFailedQuery = null
                )
            }
            return
        }

        // Reuse session AI entry if already generated in this session
        val cachedSessionTerm = _uiState.value.sessionAiTerms.firstOrNull {
            it.term.equals(query, ignoreCase = true) ||
                it.fullForm?.equals(query, ignoreCase = true) == true
        }
        if (cachedSessionTerm != null) {
            _uiState.update { it.copy(selectedTerm = cachedSessionTerm, errorMessage = null) }
            return
        }

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isLoadingAi = true,
                    errorMessage = null,
                    lastFailedQuery = null
                )
            }

            val result = geminiService.explainTerm(query)
            result.onSuccess { generatedTerm ->
                _uiState.update { state ->
                    val updatedSession = listOf(generatedTerm) +
                        state.sessionAiTerms.filterNot { it.term.equals(generatedTerm.term, ignoreCase = true) }
                    state.copy(
                        sessionAiTerms = updatedSession,
                        selectedTerm = generatedTerm,
                        isLoadingAi = false,
                        errorMessage = null
                    )
                }
            }.onFailure { err ->
                _uiState.update {
                    it.copy(
                        isLoadingAi = false,
                        errorMessage = err.message ?: "Unable to fetch explanation from Gemini.",
                        lastFailedQuery = query
                    )
                }
            }
        }
    }
}
