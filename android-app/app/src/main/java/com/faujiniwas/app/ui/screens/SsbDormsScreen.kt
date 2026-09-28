package com.faujiniwas.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.navigation.GlassBackTopBar
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Teal

data class SsbDorm(
    val id: String,
    val name: String,
    val ssb: String,
    val city: String,
    val area: String,
    val price: Int,
    val type: String,
    val distance: String,
    val amenities: List<String>,
    val desc: String,
    val phone: String = "+919460075023",
)

private val SSB_DORM_LIST = listOf(
    SsbDorm("ssb1", "Pragati Guesthouse", "1 SSB / 19 SSB Allahabad", "Prayagraj", "Civil Lines", 400, "Dormitory", "1.2", listOf("AC", "Mess Meals", "Study Area", "Locker"), "Clean sanitized dorm, 5-min auto to Allahabad Selection Board gate."),
    SsbDorm("ssb2", "Station Rest House", "14 SSB Allahabad", "Prayagraj", "Naini Road", 650, "Single Room", "2.5", listOf("AC", "WiFi", "Attached Bath"), "Quiet private rooms close to Prayagraj Cantt railway station."),
    SsbDorm("ssb3", "Shivam Dormitory", "20 SSB / 21 SSB Bhopal", "Bhopal", "Habibganj", 350, "Dormitory", "3.0", listOf("Hot Water", "Mess", "Locker", "WiFi"), "Budget-friendly candidate lodge with quiet reading tables near Bhopal SSB."),
    SsbDorm("ssb4", "Palash Candidate Residency", "22 SSB Bhopal", "Bhopal", "MP Nagar", 900, "Single Room", "4.0", listOf("AC", "WiFi", "Geyser", "Desk"), "Mid-range hotel tailored for candidates wanting full comfort prior to screening test."),
    SsbDorm("ssb5", "Kapurthala Youth Transit Hostel", "3 SSB Kapurthala", "Kapurthala", "Bus Stand Road", 300, "Dormitory", "1.8", listOf("Fan Rooms", "Mess Meals", "Common Bath"), "Most popular budget stay among Kapurthala army candidates."),
    SsbDorm("ssb6", "Hotel Satluj Transit", "3 SSB Kapurthala", "Kapurthala", "GT Road", 700, "Single Room", "2.2", listOf("AC", "WiFi", "Geyser"), "Comfortable private rooms. Direct auto to 3 SSB gate in 10 minutes."),
    SsbDorm("ssb7", "SSB Candidate Lodge", "12 SSB / 24 SSB Bangalore", "Bengaluru", "Vijayanagar", 500, "Dormitory", "2.8", listOf("WiFi", "Mess Meals", "Locker"), "Walking distance to bus stops and 15 mins to Bangalore Selection Center."),
    SsbDorm("ssb8", "Manekshaw Nagar Transit Lodge", "12 SSB Bangalore", "Bengaluru", "Cantonment", 1200, "Single Room", "1.5", listOf("AC", "WiFi", "Geyser", "Desk"), "Premium quiet private rooms right beside Bangalore Cantonment."),
    SsbDorm("ssb9", "Landmark Air Force PG House", "17 SSB Allahabad (Air)", "Prayagraj", "Bamrauli", 450, "PG/Room", "1.0", listOf("Mess", "Attached Bath", "Desk"), "Closest budget PG to Air Force Selection Board gate at Bamrauli."),
    SsbDorm("ssb10", "Delhi Cantt Candidate Stay", "SSB Delhi", "New Delhi", "Delhi Cantt", 600, "Dormitory", "1.2", listOf("AC", "WiFi", "Attached Bath", "Safe Enclave"), "Safe defence accommodation near Delhi Cantt Base Hospital & transit stops."),
    SsbDorm("ssb11", "Doon IMA Candidate Haven", "Dehradun Board", "Dehradun", "Clement Town", 550, "Dormitory", "2.0", listOf("Hot Water", "WiFi", "Mess Meals"), "Quiet scenic accommodation for IMA and Selection Board candidates."),
)

private val CITIES = listOf("All", "Prayagraj", "Bhopal", "Bengaluru", "Kapurthala", "New Delhi", "Dehradun")

@Composable
fun SsbDormsScreen(
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    var selectedCity by remember { mutableStateOf("All") }

    val filtered = SSB_DORM_LIST.filter {
        if (selectedCity == "All") true else it.city.equals(selectedCity, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            GlassBackTopBar(
                title = "SSB Candidate Dorms",
                onBack = onBack,
                trailing = {
                    GlassPill(text = "${filtered.size} available", tint = Teal)
                },
            )
        }

        item {
            GlassCard {
                SectionTitle(
                    eyebrow = "Services Selection Board Transit",
                    title = "Candidate Dorms & Stays",
                    trailing = {
                        Icon(Icons.Filled.Hotel, contentDescription = null, tint = Gold500, modifier = Modifier.size(24.dp))
                    }
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Affordable, hygienic transit dormitories and single rooms within 1-3 km of major Indian Armed Forces SSB Selection Centers. Zero brokerage direct booking.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // City Filters
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(CITIES) { city ->
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (selectedCity == city) Gold500.copy(alpha = 0.22f)
                                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                            )
                            .clickable { selectedCity = city }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = city,
                            style = MaterialTheme.typography.labelLarge,
                            color = if (selectedCity == city) Gold500 else MaterialTheme.colorScheme.onSurface,
                            fontWeight = if (selectedCity == city) FontWeight.Bold else FontWeight.Normal,
                        )
                    }
                }
            }
        }

        items(filtered, key = { it.id }) { dorm ->
            DormCard(
                dorm = dorm,
                onCall = {
                    val digits = dorm.phone.filter { it.isDigit() }
                    try {
                        context.startActivity(
                            Intent(Intent.ACTION_DIAL, Uri.parse("tel:$digits")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                        )
                    } catch (_: Exception) {}
                },
            )
        }
    }
}

@Composable
private fun DormCard(
    dorm: SsbDorm,
    onCall: () -> Unit,
) {
    GlassCard(shape = RoundedCornerShape(24.dp), padding = 14.dp) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = dorm.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "🎯 ${dorm.ssb} · ${dorm.city}",
                    style = MaterialTheme.typography.labelMedium,
                    color = Gold500,
                    fontWeight = FontWeight.SemiBold,
                )
            }

            Text(
                text = "₹${dorm.price}/night",
                style = MaterialTheme.typography.titleLarge,
                color = Gold400,
                fontWeight = FontWeight.Black,
            )
        }

        Spacer(Modifier.height(8.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.Place, contentDescription = null, tint = Teal, modifier = Modifier.size(16.dp))
            Spacer(Modifier.size(4.dp))
            Text(
                text = "${dorm.area} · ${dorm.distance} km from SSB gate",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        Spacer(Modifier.height(8.dp))

        Text(
            text = dorm.desc,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(Modifier.height(10.dp))

        // Amenities chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(dorm.amenities) { am ->
                Box(
                    Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = am,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        GoldButton(
            text = "Call Reception & Reserve",
            icon = {
                Icon(Icons.Filled.Call, contentDescription = null, tint = Navy1000, modifier = Modifier.size(16.dp))
            },
            onClick = onCall,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
