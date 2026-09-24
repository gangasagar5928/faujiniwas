package com.faujiniwas.app

import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

/**
 * Public Firebase web configuration (same values as `fauji-niwas-app/.env`).
 *
 * Used to initialise [FirebaseApp] programmatically so the app needs no
 * `google-services.json` at build time. These values are read-only client
 * identifiers — not secrets. Firestore rules still gate every read/write.
 */
object FirebaseConfig {
    const val API_KEY = "AIzaSyAlVmqtNiwnZsb8XlmcOZ49ceZWyRzGeSw"
    const val PROJECT_ID = "rentmap-8075d"
    const val APP_ID = "1:4164892727:web:56d483aa6cd2b1dabe27b2"
    const val AUTH_DOMAIN = "rentmap-8075d.firebaseapp.com"
    const val STORAGE_BUCKET = "rentmap-8075d.firebasestorage.app"
    const val MESSAGING_SENDER_ID = "4164892727"

    val options: FirebaseOptions
        get() = FirebaseOptions.Builder()
            .setApiKey(API_KEY)
            .setProjectId(PROJECT_ID)
            .setApplicationId(APP_ID)
            .setDatabaseUrl("https://$PROJECT_ID.firebaseio.com")
            .setStorageBucket(STORAGE_BUCKET)
            .setGcmSenderId(MESSAGING_SENDER_ID)
            .build()
}