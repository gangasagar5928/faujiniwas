package com.faujiniwas.app.data

/**
 * Normalised listing shared by the `rentals` + `marketplace` Firestore collections.
 * Defaults mirror the web app's `pitch_data.js` / `useListings.js` normalisation
 * (lat=22.5, lng=82.0, price=0, distance=""), so malformed docs never crash the UI.
 */
data class Listing(
    val id: String = "",
    val collection: String = "rentals",
    val name: String = "",
    val title: String = "",
    val city: String = "",
    val area: String = "",
    val type: String = "BHK",
    val price: Double = 0.0,
    val bhk: Int = 0,
    val furnishing: String = "",
    val ownerType: String = "",
    val term: String = "",
    val sqft: Int = 0,
    val available: String = "",
    val distance: String = "",
    val verified: Boolean = false,
    val lat: Double = 22.5,
    val lng: Double = 82.0,
    val createdAt: Long = 0L,
    val images: List<String> = emptyList(),
    val contact: String = "",
    val description: String = "",
    val category: String = "",
    val condition: String = "",
    val negotiable: Boolean = true,
) {
    val isMarketplace: Boolean
        get() = collection.equals("marketplace", ignoreCase = true) || collection.equals("market", ignoreCase = true)

    val displayName: String
        get() = name.ifBlank { title.ifBlank { if (isMarketplace) "Defence Marketplace Item" else "Fauji Housing" } }

    val location: String
        get() = buildList {
            if (area.isNotBlank()) add(area)
            if (city.isNotBlank()) add(city)
        }.joinToString(" · ").ifBlank { "Cantonment Area" }

    val displayPrice: String
        get() = when {
            price <= 0 -> if (isMarketplace) "Price on request" else "Rent on request"
            isMarketplace -> "₹%,.0f".format(price)
            else -> "₹%,.0f/mo".format(price)
        }

    companion object {
        fun fromMap(id: String, collection: String, m: Map<String, Any>): Listing {
            fun num(key: String): Double = (m[key] as? Number)?.toDouble() ?: 0.0
            fun str(key: String): String = m[key]?.toString() ?: ""
            fun strings(key: String): List<String> =
                (m[key] as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList()

            val images = strings("mediaUrls").ifEmpty { strings("images") }
            val lat = num("lat")
            val lng = num("lng")

            return Listing(
                id = id,
                collection = collection,
                name = str("name"),
                title = str("title"),
                city = str("city"),
                area = str("area"),
                type = str("type"),
                price = num("price"),
                bhk = (m["bhk"] as? Number)?.toInt() ?: 0,
                furnishing = str("furnishing"),
                ownerType = str("ownerType"),
                term = str("term"),
                sqft = str("sqft").toIntOrNull() ?: 0,
                available = str("available"),
                distance = str("distance"),
                verified = (m["verified"] as? Boolean) ?: false,
                lat = lat.takeIf { it != 0.0 } ?: 22.5,
                lng = lng.takeIf { it != 0.0 } ?: 82.0,
                createdAt = (m["createdAt"] as? Number)?.toLong() ?: 0L,
                images = images,
                contact = str("contact").ifBlank { str("phone") },
                description = str("description"),
                category = str("category"),
                condition = str("condition"),
                negotiable = (m["negotiable"] as? Boolean) ?: true,
            )
        }

        fun fromJson(json: org.json.JSONObject): Listing {
            val id = json.optString("id", "")
            val collRaw = json.optString("_collection", "rentals")
            val coll = if (collRaw == "market") "marketplace" else collRaw
            val name = json.optString("name", "")
            val title = json.optString("title", "")
            val city = json.optString("city", "")
            val area = json.optString("area", "")
            val type = json.optString("type", "Flat")
            val price = json.optDouble("price", 0.0)
            val bhk = json.optInt("bhk", 0)
            val furnishing = json.optString("furnishing", "")
            val ownerType = json.optString("ownerType", "")
            val term = json.optString("term", "")
            val sqft = json.optInt("sqft", json.optString("sqft", "0").toIntOrNull() ?: 0)
            val available = json.optString("available", "")
            val distance = json.optString("distance", "")
            val verified = json.optBoolean("verified", false)
            val lat = json.optDouble("lat", 22.5)
            val lng = json.optDouble("lng", 82.0)
            val createdAt = json.optLong("createdAt", 0L)

            val mediaArray = json.optJSONArray("mediaUrls") ?: json.optJSONArray("images")
            val images = mutableListOf<String>()
            if (mediaArray != null) {
                for (i in 0 until mediaArray.length()) {
                    val url = mediaArray.optString(i)
                    if (url.isNotBlank()) images.add(url)
                }
            }
            val contact = json.optString("phone", json.optString("contact", ""))
            val description = json.optString("description", "")
            val category = json.optString("category", "")
            val condition = json.optString("condition", "")
            val negotiable = json.optBoolean("negotiable", true)

            return Listing(
                id = id,
                collection = coll,
                name = name,
                title = title,
                city = city,
                area = area,
                type = type,
                price = price,
                bhk = bhk,
                furnishing = furnishing,
                ownerType = ownerType,
                term = term,
                sqft = sqft,
                available = available,
                distance = distance,
                verified = verified,
                lat = if (lat != 0.0) lat else 22.5,
                lng = if (lng != 0.0) lng else 82.0,
                createdAt = createdAt,
                images = images,
                contact = contact,
                description = description,
                category = category,
                condition = condition,
                negotiable = negotiable,
            )
        }

        fun toMap(l: Listing): Map<String, Any> = mapOf(
            "id" to l.id,
            "_collection" to l.collection,
            "name" to l.name,
            "title" to l.title,
            "city" to l.city,
            "area" to l.area,
            "type" to l.type,
            "price" to l.price,
            "bhk" to l.bhk,
            "furnishing" to l.furnishing,
            "ownerType" to l.ownerType,
            "term" to l.term,
            "sqft" to l.sqft,
            "available" to l.available,
            "distance" to l.distance,
            "verified" to l.verified,
            "lat" to l.lat,
            "lng" to l.lng,
            "createdAt" to l.createdAt,
            "mediaUrls" to l.images,
            "phone" to l.contact,
            "description" to l.description,
            "category" to l.category,
            "condition" to l.condition,
            "negotiable" to l.negotiable,
        )

        val SAMPLE_LISTINGS: List<Listing> = listOf(
            Listing(
                id = "sample-1",
                collection = "rentals",
                name = "Spacious 2BHK Near Gate 3",
                city = "Delhi Cantt",
                area = "Gate 3 · Sadar Bazar",
                type = "2BHK",
                price = 14000.0,
                bhk = 2,
                furnishing = "Semi-Furnished",
                distance = "1.2 km from Cantonment Gate",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80"),
                description = "Walking distance to Army Public School & Base Hospital. Safe gated defence enclave with dedicated 4-wheeler parking.",
            ),
            Listing(
                id = "sample-2",
                collection = "rentals",
                name = "Cozy 1BHK Officers Lane",
                city = "Pune Cantt",
                area = "Kirkee · Command Hospital",
                type = "1BHK",
                price = 9500.0,
                bhk = 1,
                furnishing = "Fully Furnished",
                distance = "0.8 km from Gate 1",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80"),
                description = "Ideal for single officers or young couples on transit posting. Includes AC, refrigerator, inverter, and high-speed fibre WiFi.",
            ),
            Listing(
                id = "sample-3",
                collection = "rentals",
                name = "3BHK Family Flat AFDCC Road",
                city = "Ambala Cantt",
                area = "Sector 5 · Air Force Base",
                type = "3BHK",
                price = 22000.0,
                bhk = 3,
                furnishing = "Semi-Furnished",
                distance = "1.5 km to CSD & Station HQ",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=900&q=80"),
                description = "Quiet cantonment surroundings. 24x7 security, water supply, modular kitchen, and private terrace.",
            ),
            Listing(
                id = "sample-4",
                collection = "rentals",
                name = "PG / Transit Room for SSB Candidates",
                city = "Chandigarh",
                area = "Sector 34 · Near Selection Board",
                type = "PG/Room",
                price = 6000.0,
                bhk = 1,
                furnishing = "Fully Furnished",
                distance = "0.5 km to 12 SSB Board",
                verified = false,
                images = listOf("https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80"),
                description = "Hygienic stay tailored for defence aspirants attending SSB interview. Hot water, meals included, quiet study zone.",
            ),
            Listing(
                id = "sample-5",
                collection = "rentals",
                name = "2BHK Transit Flat Central Command",
                city = "Lucknow Cantt",
                area = "Charbagh · Dilkusha",
                type = "2BHK",
                price = 16500.0,
                bhk = 2,
                furnishing = "Semi-Furnished",
                distance = "2.0 km from HQ",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80"),
                description = "Prime cantonment location. Well connected to Command Hospital, Cantt railway station, and Army Sports Club.",
            ),
            Listing(
                id = "sample-6",
                collection = "marketplace",
                name = "Solid Teak Wood Dining Table (6-Seater)",
                title = "Solid Teak Wood Dining Table (6-Seater)",
                city = "Pune Cantt",
                area = "Kirkee · Officers Mess Road",
                type = "Furniture",
                price = 14500.0,
                bhk = 0,
                furnishing = "",
                ownerType = "defence",
                distance = "Inside Kirkee Cantt",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=80"),
                description = "CPWD/MES quarters teak dining set with 6 upholstered high-back chairs. Impeccable condition. Posting transfer handover.",
                category = "Furniture",
                condition = "Like New",
                negotiable = true,
            ),
            Listing(
                id = "sample-7",
                collection = "marketplace",
                name = "Royal Enfield Classic 350 Gunmetal Grey",
                title = "Royal Enfield Classic 350 Gunmetal Grey",
                city = "Ambala Cantt",
                area = "Air Force Station Gate 2",
                type = "Vehicles",
                price = 125000.0,
                bhk = 0,
                furnishing = "",
                ownerType = "defence",
                distance = "0.5 km from Station HQ",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&q=80"),
                description = "2021 model, single IAF officer driven, comprehensive insurance valid till 2026. Complete service record from Ambala authorized service centre.",
                category = "Vehicles",
                condition = "Like New",
                negotiable = false,
            ),
            Listing(
                id = "sample-8",
                collection = "marketplace",
                name = "LG 260L Double Door Smart Inverter Fridge",
                title = "LG 260L Double Door Smart Inverter Fridge",
                city = "Delhi Cantt",
                area = "Shankar Vihar · Army Enclave",
                type = "Appliances",
                price = 11500.0,
                bhk = 0,
                furnishing = "",
                ownerType = "defence",
                distance = "Inside Shankar Vihar Cantt",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=900&q=80"),
                description = "Bought through CSD canteen 2 years ago, 5-star power rating, frost free with smart connect inverter. Urgent sell due to Northeast posting.",
                category = "Appliances",
                condition = "Gently Used",
                negotiable = true,
            ),
            Listing(
                id = "sample-9",
                collection = "marketplace",
                name = "Heavy Gauge Steel Transit Trunks & Field Boxes",
                title = "Heavy Gauge Steel Transit Trunks & Field Boxes",
                city = "Secunderabad Cantt",
                area = "Bolarum · AOC Centre",
                type = "Uniform & Gear",
                price = 4800.0,
                bhk = 0,
                furnishing = "",
                ownerType = "defence",
                distance = "Inside AOC Centre",
                verified = true,
                images = listOf("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80"),
                description = "Set of 2 heavy-duty military transit steel trunks with dual brass padlocks and rainproof seal. Essential for long train journeys and postings.",
                category = "Uniform & Gear",
                condition = "Good Condition",
                negotiable = false,
            ),
        )
    }
}