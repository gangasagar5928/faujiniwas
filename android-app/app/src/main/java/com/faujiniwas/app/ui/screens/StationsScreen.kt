package com.faujiniwas.app.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Teal

data class Station(
    val name: String,
    val city: String,
    val region: String,
    val gateKm: String,
    val notable: String,
)

/** Curated directory — the web app indexes 62+ cantonments; these anchor the top markets. */
val STATIONS: List<Station> = listOf(
    Station("Pune Cantonment", "Pune", "Maharashtra", "3.2", "Gate 3 · Kirkee · Southern Command"),
    Station("Delhi Cantonment", "New Delhi", "Delhi NCR", "5.0", "Palam · Naraina · Base Hospital"),
    Station("Secunderabad Cantonment", "Secunderabad", "Telangana", "4.1", "Trimulgherry · Bolarum"),
    Station("Bengaluru Cantonment", "Bengaluru", "Karnataka", "6.0", "Hebbal · Ulsoor · Infantry Road"),
    Station("Ambala Cantonment", "Ambala", "Haryana", "2.8", "Sector 5 · Civil Lines"),
    Station("Lucknow Cantonment", "Lucknow", "Uttar Pradesh", "3.5", "Central Command · Charbagh"),
    Station("Meerut Cantonment", "Meerut", "Uttar Pradesh", "4.0", "Partapur · City Cantt"),
    Station("Agra Cantonment", "Agra", "Uttar Pradesh", "3.0", "Taj Rd · Idgah"),
    Station("Jaipur Cantonment", "Jaipur", "Rajasthan", "5.5", "South West Command"),
    Station("Jodhpur Cantonment", "Jodhpur", "Rajasthan", "6.2", "Ratanada · Air Force"),
    Station("Bhopal Cantonment", "Bhopal", "Madhya Pradesh", "2.5", "Baif Road · T.T. Nagar"),
    Station("Chennai (St Thomas Mount)", "Chennai", "Tamil Nadu", "4.8", "Pallavaram · Guindy"),
    Station("Kolkata (Fort William)", "Kolkata", "West Bengal", "7.0", "Maidan · Alipore"),
    Station("Guwahati (Narengi)", "Guwahati", "Assam", "5.2", "Borsola · Basistha"),
    Station("Noida (GB Nagar)", "Noida", "Delhi NCR", "8.5", "Army Hq Affiliates · Metro line"),
    Station("Dehradun Cantonment", "Dehradun", "Uttarakhand", "3.6", "Clement Town · Doon Lines"),
)

@Composable
fun StationsScreen(
    onOpenStation: (Station) -> Unit,
) {
    var query by remember { mutableStateOf("") }
    val filtered = STATIONS.filter {
        query.isBlank() ||
            it.name.contains(query, ignoreCase = true) ||
            it.city.contains(query, ignoreCase = true) ||
            it.region.contains(query, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            SectionTitle(
                eyebrow = "Cantonment Directory",
                title = "Stations Near You",
                trailing = { GlassPill(text = "${STATIONS.size}+ indexed", tint = Gold500) },
            )
        }

        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search cantonment, city, region…") },
                leadingIcon = {
                    Icon(Icons.Filled.Search, contentDescription = null, tint = Gold500)
                },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                shape = RoundedCornerShape(20.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold500,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                    cursorColor = Gold500,
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f),
                ),
                modifier = Modifier.fillMaxWidth(),
            )
        }

        items(filtered) { station ->
            StationCard(
                station = station,
                modifier = Modifier.animateItem(),
                onClick = { onOpenStation(station) },
            )
        }

        if (filtered.isEmpty()) {
            item {
                GlassCard(shape = RoundedCornerShape(26.dp)) {
                    Text(
                        text = "No station matches “$query”.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun StationCard(
    station: Station,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    GlassCard(
        modifier = modifier.fillMaxWidth(),
        onClick = onClick,
        shape = RoundedCornerShape(24.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(46.dp)
                    .background(Gold500.copy(alpha = 0.16f), RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Filled.Place,
                    contentDescription = null,
                    tint = Gold500,
                    modifier = Modifier.size(24.dp),
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = station.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "${station.city} · ${station.region}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(6.dp))
                GlassPill(text = "${station.gateKm} km to main gate", tint = Teal)
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = station.notable,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}