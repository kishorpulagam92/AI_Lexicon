package com.kishorpulagam.ailexicon

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.kishorpulagam.ailexicon.ui.HomeScreen
import com.kishorpulagam.ailexicon.ui.LexiconViewModel
import com.kishorpulagam.ailexicon.ui.theme.AiLexiconTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(android.graphics.Color.parseColor("#081020")),
            navigationBarStyle = SystemBarStyle.dark(android.graphics.Color.parseColor("#081020"))
        )
        setContent {
            AiLexiconTheme {
                val lexiconViewModel: LexiconViewModel = viewModel()
                HomeScreen(viewModel = lexiconViewModel)
            }
        }
    }
}
