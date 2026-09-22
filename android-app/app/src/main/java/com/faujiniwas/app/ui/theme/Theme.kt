package com.faujiniwas.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

// ── Custom glass schemes — gold on navy, olive as defence secondary ──
private val DarkGlassScheme = darkColorScheme(
    primary = Gold500,
    onPrimary = Navy1000,
    primaryContainer = Gold600,
    onPrimaryContainer = Navy900,
    secondary = Teal,
    onSecondary = Navy1000,
    secondaryContainer = Olive800,
    onSecondaryContainer = Amber100,
    tertiary = Indigo,
    background = Navy1000,
    onBackground = ColorTokens.onDark,
    surface = Navy950,
    onSurface = ColorTokens.onDark,
    surfaceVariant = Navy900,
    onSurfaceVariant = ColorTokens.onDarkMuted,
    surfaceContainer = Navy900,
    surfaceContainerHigh = Navy900,
    outline = ColorTokens.outlineDark,
    outlineVariant = ColorTokens.outlineDarkVariant,
    error = ColorTokens.error,
)

private val LightGlassScheme = lightColorScheme(
    primary = Gold700,
    onPrimary = ColorTokens.onLight,
    primaryContainer = Gold400,
    onPrimaryContainer = Navy1000,
    secondary = Olive600,
    onSecondary = ColorTokens.onLight,
    secondaryContainer = Stone200,
    onSecondaryContainer = InkOnLight,
    background = Stone100,
    onBackground = InkOnLight,
    surface = Stone100,
    onSurface = InkOnLight,
    surfaceVariant = Stone200,
    onSurfaceVariant = ColorTokens.onLightMuted,
    surfaceContainer = Stone200,
    surfaceContainerHigh = Stone200,
    outline = ColorTokens.outlineLight,
    outlineVariant = ColorTokens.outlineLightVariant,
    error = ColorTokens.error,
)

private object ColorTokens {
    val onDark = androidx.compose.ui.graphics.Color(0xFFF1F5F9)
    val onDarkMuted = androidx.compose.ui.graphics.Color(0xFFC7D2E0)
    val outlineDark = androidx.compose.ui.graphics.Color(0xFF3A4A62)
    val outlineDarkVariant = androidx.compose.ui.graphics.Color(0xFF2A3850)
    val onLight = androidx.compose.ui.graphics.Color(0xFF0B1220)
    val onLightMuted = androidx.compose.ui.graphics.Color(0xFF475569)
    val outlineLight = androidx.compose.ui.graphics.Color(0xFFD6CFC2)
    val outlineLightVariant = androidx.compose.ui.graphics.Color(0xFFE3DDD2)
    val error = androidx.compose.ui.graphics.Color(0xFFEF4444)
}

/**
 * Fauji Niwas theme — dynamic colour on Android 12+, else the Liquid-Glass
 * palette. `forceDarkOverride` lets the Settings screen switch shell themes.
 */
@Composable
fun FaujiNiwasTheme(
    forceDark: Boolean? = null,   // null = follow system, true/false = override
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val systemDark = isSystemInDarkTheme()
    val dark = forceDark ?: systemDark
    val context = LocalContext.current

    val scheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && forceDark == null ->
            if (systemDark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        dark -> DarkGlassScheme
        else -> LightGlassScheme
    }

    MaterialTheme(
        colorScheme = scheme,
        typography = FaujiNiwasTypography,
        content = content,
    )
}