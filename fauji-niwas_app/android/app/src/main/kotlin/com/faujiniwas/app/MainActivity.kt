package com.faujiniwas.app

import android.os.Build
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Force high refresh rate (120Hz/90Hz) if supported by the device hardware
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
            } catch (e: Exception) {
                // Fallback
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
    }
}
