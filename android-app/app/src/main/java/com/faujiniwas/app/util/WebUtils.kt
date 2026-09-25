package com.faujiniwas.app.util

import android.content.Context
import android.content.Intent
import android.net.Uri

object WebUtils {
    const val BASE_URL = "https://faujiniwas.web.app"
    const val POST_PROPERTY_URL = "https://faujiniwas.web.app/app.html?action=post"
    const val AI_HELPER_URL = "https://faujiniwas.web.app/app.html?ai=true"
    const val SSB_DORMS_URL = "https://faujiniwas.web.app/app.html?view=dorms"
    const val MARKETPLACE_URL = "https://faujiniwas.web.app/app.html?view=market"
    const val RELOCATION_URL = "https://faujiniwas.web.app/app.html?view=relocation"

    fun listingUrl(listingId: String): String =
        if (listingId.startsWith("sample-")) BASE_URL
        else "$BASE_URL/app.html?listing=$listingId"

    fun stationUrl(city: String): String =
        "$BASE_URL/app.html?city=${Uri.encode(city)}"

    fun open(context: Context, url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            android.util.Log.e("WebUtils", "Failed to open $url: ${e.message}")
        }
    }

    fun shareListing(context: Context, title: String, listingId: String) {
        try {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, "Fauji Niwas: $title")
                putExtra(
                    Intent.EXTRA_TEXT,
                    "🇮🇳 Check out this defence accommodation on Fauji Niwas:\n$title\n${listingUrl(listingId)}"
                )
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(shareIntent, "Share Accommodation via").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        } catch (e: Exception) {
            android.util.Log.e("WebUtils", "Failed to share: ${e.message}")
        }
    }
}
