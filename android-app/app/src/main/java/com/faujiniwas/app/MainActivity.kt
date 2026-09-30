package com.faujiniwas.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.luminance
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.faujiniwas.app.ui.glass.AuroraBackground
import com.faujiniwas.app.ui.navigation.FaujiNiwasAppRoot
import com.faujiniwas.app.ui.theme.FaujiNiwasTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val app = application as FaujiNiwasApp
            val prefs = remember { getSharedPreferences("fn_settings", MODE_PRIVATE) }
            // Default to true (Signature Midnight Navy Aurora theme)
            var isDarkTheme by remember { mutableStateOf(prefs.getBoolean("is_dark_theme", true)) }

            // Live Firestore feed (rentals + marketplace) — mirrors the web app.
            val listings by app.repository.feed().collectAsStateWithLifecycle(
                initialValue = emptyList(),
            )

            FaujiNiwasTheme(
                forceDark = isDarkTheme,
                dynamicColor = false,
            ) {
                AuroraBackground(dark = isDarkTheme) {
                    FaujiNiwasAppRoot(
                        repository = app.repository,
                        listings = listings,
                        feedConnected = listings.isNotEmpty(),
                        darkOverride = isDarkTheme,
                        onToggleDark = { flag ->
                            isDarkTheme = flag
                            prefs.edit().putBoolean("is_dark_theme", flag).apply()
                        },
                    )
                }
            }
        }
    }
}