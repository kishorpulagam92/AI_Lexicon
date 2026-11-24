package com.kishorpulagam.ailexicon.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Book
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.kishorpulagam.ailexicon.model.ALL_CATEGORIES
import com.kishorpulagam.ailexicon.model.LexiconTerm
import com.kishorpulagam.ailexicon.model.TermSource
import com.kishorpulagam.ailexicon.ui.theme.AccentBlue
import com.kishorpulagam.ailexicon.ui.theme.AccentBlueLight
import com.kishorpulagam.ailexicon.ui.theme.ErrorRed
import com.kishorpulagam.ailexicon.ui.theme.NavyBorder
import com.kishorpulagam.ailexicon.ui.theme.NavyCanvas
import com.kishorpulagam.ailexicon.ui.theme.NavySurface
import com.kishorpulagam.ailexicon.ui.theme.NavySurfaceHigh
import com.kishorpulagam.ailexicon.ui.theme.TextPrimary
import com.kishorpulagam.ailexicon.ui.theme.TextSecondary
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(viewModel: LexiconViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val clipboardManager = LocalClipboardManager.current
    val scope = rememberCoroutineScope()

    Scaffold(
        containerColor = NavyCanvas,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // App Title & Tagline
            Text(
                text = "AI Lexicon",
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Understand AI. One term at a time. · by KishorPulagam",
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar + Explain with AI Action
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::onSearchQueryChanged,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = {
                    Text(
                        text = "Search acronym or full form (e.g. RAG, LoRA)...",
                        color = TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Search,
                        contentDescription = "Search",
                        tint = TextSecondary
                    )
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(
                                imageVector = Icons.Outlined.Close,
                                contentDescription = "Clear search",
                                tint = TextSecondary
                            )
                        }
                    }
                },
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = NavySurface,
                    unfocusedContainerColor = NavySurface,
                    focusedBorderColor = AccentBlue,
                    unfocusedBorderColor = NavyBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = AccentBlueLight
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        if (uiState.visibleTerms.isEmpty() && uiState.searchQuery.isNotBlank()) {
                            viewModel.explainWithAi()
                        }
                    }
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = { viewModel.explainWithAi() },
                enabled = !uiState.isLoadingAi,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentBlue,
                    contentColor = Color.White
                )
            ) {
                if (uiState.isLoadingAi) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Asking Gemini Flash...", fontWeight = FontWeight.Medium)
                } else {
                    Icon(
                        imageVector = Icons.Outlined.AutoAwesome,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Explain with AI", fontWeight = FontWeight.SemiBold)
                }
            }

            // Inline Error Banner with Retry
            if (uiState.errorMessage != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = NavySurface,
                    border = BorderStroke(1.dp, ErrorRed.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ErrorOutline,
                            contentDescription = "Error",
                            tint = ErrorRed,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = uiState.errorMessage.orEmpty(),
                            style = MaterialTheme.typography.bodySmall,
                            color = TextPrimary,
                            modifier = Modifier.weight(1f)
                        )
                        if (uiState.lastFailedQuery != null) {
                            TextButton(onClick = { viewModel.explainWithAi(uiState.lastFailedQuery) }) {
                                Text("Retry", color = AccentBlueLight)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Horizontally Scrollable Category Filters
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(end = 8.dp)
            ) {
                items(ALL_CATEGORIES) { category ->
                    val selected = category == uiState.selectedCategory
                    Surface(
                        onClick = { viewModel.onCategorySelected(category) },
                        shape = RoundedCornerShape(12.dp),
                        color = if (selected) AccentBlue else NavySurface,
                        border = BorderStroke(
                            width = 1.dp,
                            color = if (selected) AccentBlue else NavyBorder
                        )
                    ) {
                        Text(
                            text = category,
                            style = MaterialTheme.typography.labelMedium,
                            color = if (selected) Color.White else TextSecondary,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            val visibleTerms = uiState.visibleTerms
            Text(
                text = "${visibleTerms.size} terms shown · ${uiState.builtInTerms.size} offline · ${uiState.sessionAiTerms.size} AI session",
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Terminology List or Empty State
            if (uiState.isLoadingLocal) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AccentBlue)
                }
            } else if (visibleTerms.isEmpty()) {
                EmptySearchCard(
                    query = uiState.searchQuery,
                    isLoadingAi = uiState.isLoadingAi,
                    onExplainWithAi = { viewModel.explainWithAi() },
                    onResetFilters = {
                        viewModel.onSearchQueryChanged("")
                        viewModel.onCategorySelected("All")
                    }
                )
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    items(visibleTerms, key = { it.id }) { term ->
                        TermCard(
                            term = term,
                            onClick = { viewModel.selectTerm(term) }
                        )
                    }
                }
            }
        }
    }

    // Term Details Modal Bottom Sheet
    val selected = uiState.selectedTerm
    if (selected != null) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = viewModel::dismissTermDetail,
            sheetState = sheetState,
            containerColor = NavySurface,
            contentColor = TextPrimary
        ) {
            TermDetailSheetContent(
                term = selected,
                onCopy = {
                    clipboardManager.setText(AnnotatedString(selected.toPlainTextSummary()))
                    scope.launch {
                        snackbarHostState.showSnackbar("Copied explanation for ${selected.term}")
                    }
                },
                onRelatedTermClick = { related ->
                    viewModel.openOrExplainRelatedTerm(related)
                }
            )
        }
    }
}

@Composable
private fun TermCard(
    term: LexiconTerm,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = NavySurface),
        border = BorderStroke(1.dp, NavyBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = term.term,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (term.source == TermSource.AI_GENERATED) {
                            Icons.Outlined.AutoAwesome
                        } else {
                            Icons.Outlined.Book
                        },
                        contentDescription = term.source.label,
                        tint = if (term.source == TermSource.AI_GENERATED) AccentBlueLight else TextSecondary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = term.source.label,
                        style = MaterialTheme.typography.labelMedium,
                        color = if (term.source == TermSource.AI_GENERATED) AccentBlueLight else TextSecondary
                    )
                }
            }

            if (!term.fullForm.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = term.fullForm,
                    style = MaterialTheme.typography.bodySmall,
                    color = AccentBlueLight
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "${term.category} · ${term.difficulty}",
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = term.simpleDefinition,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                color = TextPrimary.copy(alpha = 0.9f)
            )
        }
    }
}

@Composable
private fun EmptySearchCard(
    query: String,
    isLoadingAi: Boolean,
    onExplainWithAi: () -> Unit,
    onResetFilters: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = NavySurface),
        border = BorderStroke(1.dp, NavyBorder)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = if (query.isNotBlank()) "No offline match for \"$query\"" else "No terms in this category",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = if (query.isNotBlank()) {
                    "Request a concise, structured explanation from Gemini Flash via Firebase AI Logic."
                } else {
                    "Reset your filters to browse all 60 built-in AI terms offline."
                },
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (query.isNotBlank()) {
                    Button(
                        onClick = onExplainWithAi,
                        enabled = !isLoadingAi,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Text("Explain \"$query\"")
                    }
                }
                OutlinedButton(
                    onClick = onResetFilters,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, NavyBorder)
                ) {
                    Text("Reset Filters", color = TextPrimary)
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TermDetailSheetContent(
    term: LexiconTerm,
    onCopy: () -> Unit,
    onRelatedTermClick: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 32.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = term.term,
                    style = MaterialTheme.typography.headlineMedium
                )
                if (!term.fullForm.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = term.fullForm,
                        style = MaterialTheme.typography.bodyMedium,
                        color = AccentBlueLight
                    )
                }
            }
            OutlinedButton(
                onClick = onCopy,
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, NavyBorder)
            ) {
                Icon(
                    imageVector = Icons.Outlined.ContentCopy,
                    contentDescription = "Copy explanation",
                    modifier = Modifier.size(16.dp),
                    tint = TextPrimary
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Copy", color = TextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "${term.category} · ${term.difficulty} · ${term.source.label}",
            style = MaterialTheme.typography.bodySmall,
            color = if (term.source == TermSource.AI_GENERATED) AccentBlueLight else TextSecondary
        )

        if (!term.statusNote.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(14.dp))
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = NavySurfaceHigh,
                border = BorderStroke(1.dp, AccentBlue.copy(alpha = 0.45f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = term.statusNote,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextPrimary,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))
        HorizontalDivider(color = NavyBorder)
        Spacer(modifier = Modifier.height(16.dp))

        DetailSection(title = "Simple Definition", body = term.simpleDefinition)
        DetailSection(title = "Technical Explanation", body = term.technicalExplanation)
        DetailSection(title = "Real-World Example", body = term.realWorldExample)
        DetailSection(title = "Why It Matters", body = term.whyItMatters)

        if (term.relatedTerms.isNotEmpty()) {
            Text(
                text = "Related Terminology",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(10.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                term.relatedTerms.forEach { related ->
                    OutlinedButton(
                        onClick = { onRelatedTermClick(related) },
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, NavyBorder),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(related, color = AccentBlueLight, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailSection(title: String, body: String) {
    if (body.isBlank()) return
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        color = TextPrimary
    )
    Spacer(modifier = Modifier.height(6.dp))
    Text(
        text = body,
        style = MaterialTheme.typography.bodyMedium,
        color = TextPrimary.copy(alpha = 0.9f)
    )
    Spacer(modifier = Modifier.height(18.dp))
}
