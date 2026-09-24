package com.faujiniwas.app

import android.app.Application
import com.faujiniwas.app.data.FirestoreRepository
import com.google.firebase.FirebaseApp

/** Application entry: initialises Firebase programmatically + hosts app singletons. */
class FaujiNiwasApp : Application() {
    lateinit var repository: FirestoreRepository
        private set

    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this, FirebaseConfig.options)
        repository = FirestoreRepository(this)
    }
}