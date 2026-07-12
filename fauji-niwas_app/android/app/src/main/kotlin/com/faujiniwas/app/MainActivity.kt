package com.faujiniwas.app

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge display for modern immersive feel
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        insetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        
        // Force high refresh rate (120Hz/90Hz) for buttery smooth scrolling
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val layoutParams = window.attributes
            try {
                val display = display
                val modes = display?.supportedModes
                var bestMode = display?.mode
                var maxRate = 60f
                if (modes != null) {
                    for (mode in modes) {
                        if (mode.refreshRate > maxRate) {
                            maxRate = mode.refreshRate
                            bestMode = mode
                        }
                    }
                }
                if (bestMode != null) {
                    layoutParams.preferredDisplayModeId = bestMode.modeId
                    window.attributes = layoutParams
                }
                
                // Additional smooth rendering hint (Android 12+ only)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    layoutParams.preferredRefreshRate = maxOf(
                        layoutParams.preferredRefreshRate ?: 60f,
                        maxRate
                    )
                }
            } catch (e: Exception) {
                // Fallback — will use device default
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val layoutParams = window.attributes
            try {
                @Suppress("DEPRECATION")
                val display = windowManager.defaultDisplay
                val modes = display?.supportedModes
                var bestMode = display?.mode
                var maxRate = 60f
                if (modes != null) {
                    for (mode in modes) {
                        if (mode.refreshRate > maxRate) {
                            maxRate = mode.refreshRate
                            bestMode = mode
                        }
                    }
                }
                if (bestMode != null) {
                    layoutParams.preferredDisplayModeId = bestMode.modeId
                    window.attributes = layoutParams
                }
            } catch (e: Exception) {
                // Fallback
            }
        }
        
        // Keep screen on for map browsing
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }
}
