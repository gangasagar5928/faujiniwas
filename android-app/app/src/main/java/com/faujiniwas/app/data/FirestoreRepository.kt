package com.faujiniwas.app.data

import android.content.Context
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.File

/**
 * Streams listings from the same Firestore collections the web app reads
 * (`rentals` + `marketplace`), merged with the complete 1,425+ cantonment dataset
 * (`assets/listings.json`) and local user postings.
 */
class FirestoreRepository(private val context: Context) {
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
    private val repositoryScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val pitchListings = MutableStateFlow<List<Listing>>(emptyList())
    private val localPostings = MutableStateFlow<List<Listing>>(emptyList())

    init {
        loadOfflinePitchListings()
        loadLocalPostings()
    }

    private fun loadOfflinePitchListings() {
        repositoryScope.launch {
            try {
                val jsonString = context.assets.open("listings.json").bufferedReader().use { it.readText() }
                val jsonArray = JSONArray(jsonString)
                val list = ArrayList<Listing>(jsonArray.length())
                for (i in 0 until jsonArray.length()) {
                    val obj = jsonArray.optJSONObject(i) ?: continue
                    list.add(Listing.fromJson(obj))
                }
                Log.d("FirestoreRepository", "Loaded ${list.size} offline demo listings from assets")
                pitchListings.value = list
            } catch (e: Exception) {
                Log.e("FirestoreRepository", "Failed to load offline listings from assets", e)
                pitchListings.value = Listing.SAMPLE_LISTINGS
            }
        }
    }

    private fun loadLocalPostings() {
        repositoryScope.launch {
            try {
                val file = File(context.filesDir, "local_postings.json")
                if (file.exists()) {
                    val content = file.readText()
                    val jsonArray = JSONArray(content)
                    val list = ArrayList<Listing>(jsonArray.length())
                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.optJSONObject(i) ?: continue
                        list.add(Listing.fromJson(obj))
                    }
                    localPostings.value = list
                    Log.d("FirestoreRepository", "Loaded ${list.size} local postings from disk")
                }
            } catch (e: Exception) {
                Log.w("FirestoreRepository", "Failed to read local postings", e)
            }
        }
    }

    private fun saveLocalPostings(postings: List<Listing>) {
        repositoryScope.launch {
            try {
                val array = JSONArray()
                postings.forEach { array.put(org.json.JSONObject(Listing.toMap(it))) }
                val file = File(context.filesDir, "local_postings.json")
                file.writeText(array.toString(2))
            } catch (e: Exception) {
                Log.w("FirestoreRepository", "Failed to save local postings", e)
            }
        }
    }

    fun feed(limit: Long = 120): Flow<List<Listing>> {
        val rentals = queryFlow("rentals", limit)
        val marketplace = queryFlow("marketplace", limit)
        return combine(pitchListings, localPostings, rentals, marketplace) { pitch, local, r, m ->
            val online = r + m
            val onlineIds = online.map { it.id }.toSet()
            val localIds = local.map { it.id }.toSet()

            // Online Firestore items override pitch dataset; local items show first
            val cleanPitch = pitch.filter { it.id !in onlineIds && it.id !in localIds }
            val combined = (local + online + cleanPitch).sortedByDescending { it.createdAt }

            if (combined.isEmpty()) Listing.SAMPLE_LISTINGS else combined
        }
    }

    suspend fun postListing(listing: Listing): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val id = listing.id.ifBlank { "mob_${System.currentTimeMillis()}" }
            val coll = if (listing.collection == "marketplace") "marketplace" else "rentals"
            val itemToSave = listing.copy(
                id = id,
                collection = coll,
                createdAt = if (listing.createdAt > 0) listing.createdAt else System.currentTimeMillis(),
                verified = false,
            )

            // 1. Immediately store in local state and write to disk
            val current = localPostings.value
            val updated = listOf(itemToSave) + current.filter { it.id != id }
            localPostings.value = updated
            saveLocalPostings(updated)

            // 2. Synchronize to Firestore backend
            try {
                db.collection(coll).document(id).set(Listing.toMap(itemToSave)).await()
                Log.d("FirestoreRepository", "Successfully posted listing to Firestore $coll/$id")
            } catch (e: Exception) {
                Log.w("FirestoreRepository", "Firestore remote push failed (stored locally): ${e.message}")
            }

            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("FirestoreRepository", "Failed to post listing", e)
            Result.failure(e)
        }
    }

    private fun queryFlow(collection: String, limit: Long): Flow<List<Listing>> = callbackFlow {
        val registration = db.collection(collection)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(limit)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w("FirestoreRepository", "Feed error on $collection: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val docs = snapshot?.documents.orEmpty()
                    .mapNotNull { Listing.fromMap(it.id, collection, it.data.orEmpty()) }
                trySend(docs)
            }
        awaitClose { registration.remove() }
    }
}