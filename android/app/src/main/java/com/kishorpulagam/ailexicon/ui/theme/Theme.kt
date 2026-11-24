package com.kishorpulagam.ailexicon.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val NavyCanvas = Color(0xFF081020)
val NavySurface = Color(0xFF101C34)
val NavySurfaceHigh = Color(0xFF152442)
val NavyBorder = Color(0xFF1F3254)
val AccentBlue = Color(0xFF3B82F6)
val AccentBlueLight = Color(0xFF60A5FA)
val TextPrimary = Color(0xFFF1F5F9)
val TextSecondary = Color(0xFF94A3B8)
val ErrorRed = Color(0xFFF87171)

private val AiLexiconDarkScheme = darkColorScheme(
    primary = AccentBlue,
    onPrimary = Color.White,
    secondary = AccentBlueLight,
    onSecondary = NavyCanvas,
    background = NavyCanvas,
    onBackground = TextPrimary,
    surface = NavySurface,
    onSurface = TextPrimary,
    surfaceVariant = NavySurfaceHigh,
    onSurfaceVariant = TextSecondary,
    outline = NavyBorder,
    error = ErrorRed
)

private val AiLexiconTypography = Typography(
    headlineMedium = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 26.sp,
        lineHeight = 32.sp,
        color = TextPrimary
    ),
    titleLarge = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 26.sp,
        color = TextPrimary
    ),
    titleMedium = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        color = TextPrimary
    ),
    bodyMedium = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        lineHeight = 22.sp,
        color = TextPrimary
    ),
    bodySmall = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp,
        color = TextSecondary
    ),
    labelMedium = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.2.sp
    )
)

@Composable
fun AiLexiconTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AiLexiconDarkScheme,
        typography = AiLexiconTypography,
        content = content
    )
}
