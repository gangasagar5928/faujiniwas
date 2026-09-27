package com.faujiniwas.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddHome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.components.ListingCard
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Teal

private enum class FeedFilter(val label: String) {
    All("All"),
    Rentals("Rentals"),
    Marketplace("Marketplace"),
    Verified("Verified"),
}

private val QUICK_CITIES = listOf("All", "Pune", "New Delhi", "Ambala", "Secunderabad", "Bengaluru", "Dehradun", "Lucknow", "Chandigarh", "Meerut")

@Composable
fun ListingsScreen(
    listings: List<Listing>,
    onOpenListing: (String) -> Unit,
    onPostListing: () -> Unit,
) {
    var filter by remember { mutableStateOf(FeedFilter.All) }
    var selectedCity by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    val source = listings.ifEmpty { Listing.SAMPLE_LISTINGS }
    val filtered = source.filter { item ->
        val matchesCategory = when (filter) {
            FeedFilter.All -> true
            FeedFilter.Rentals -> !item.isMarketplace && !item.collection.equals("marketplace", ignoreCase = true)
            FeedFilter.Marketplace -> item.isMarketplace || item.collection.equals("marketplace", ignoreCase = true)
            FeedFilter.Verified -> item.verified
        }
        val matchesCity = if (selectedCity == "All") true else item.city.equals(selectedCity, ignoreCase = true)
        val matchesQuery = if (searchQuery.isBlank()) true else {
            item.displayName.contains(searchQuery, ignoreCase = true) ||
            item.city.contains(searchQuery, ignoreCase = true) ||
            item.area.contains(searchQuery, ignoreCase = true) ||
            item.type.contains(searchQuery, ignoreCase = true) ||
            item.category.contains(searchQuery, ignoreCase = true)
        }
        matchesCategory && matchesCity && matchesQuery
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            SectionTitle(
                eyebrow = if (filter == FeedFilter.Marketplace) "Cantonment Goods & Gear" else "Defence Housing Network",
                title = if (filter == FeedFilter.Marketplace) "Defence Marketplace" else "All Cantonment Homes",
                trailing = {
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(Gold500)
                            .clickable { onPostListing() }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Filled.AddHome, contentDescription = null, tint = com.faujiniwas.app.ui.theme.Navy1000, modifier = Modifier.size(16.dp))
                            Text(
                                text = "Post",
                                style = MaterialTheme.typography.labelMedium,
                                color = com.faujiniwas.app.ui.theme.Navy1000,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                            )
                        }
                    }
                },
            )
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by cantonment, area, city, type…") },
                leadingIcon = {
                    Icon(Icons.Filled.Search, contentDescription = null, tint = Gold500)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Filled.Close, contentDescription = "Clear", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(18.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold500,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                    cursorColor = Gold500,
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.40f),
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f),
                ),
                modifier = Modifier.fillMaxWidth(),
            )
        }

        // City Filters
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(QUICK_CITIES) { c ->
                    FilterChip(
                        label = c,
                        selected = selectedCity == c,
                        onClick = { selectedCity = c },
                    )
                }
            }
        }

        // Category Chips & Count
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FeedFilter.entries.forEach { f ->
                        FilterChip(
                            label = f.label,
                            selected = filter == f,
                            onClick = { filter = f },
                        )
                    }
                }
                GlassPill(
                    text = "${filtered.size} found",
                    tint = if (filter == FeedFilter.Verified) Teal else Gold500,
                )
            }
        }

        if (filtered.isEmpty()) {
            item {
                GlassCard(shape = RoundedCornerShape(26.dp)) {
                    Text(
                        text = "No listings found matching your search.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Try searching a different cantonment or clear filters.",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        } else {
            items(filtered, key = { it.id }) { listing ->
                ListingCard(
                    listing = listing,
                    modifier = Modifier.animateItem(),
                    onClick = { onOpenListing(it.id) },
                )
            }
        }
    }
}

@Composable
private fun FilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val scale = com.faujiniwas.app.ui.glass.pressScale(interaction)
    Box(
        Modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clip(RoundedCornerShape(50))
            .background(
                if (selected) Gold500.copy(alpha = 0.22f)
                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
            )
            .clickable(
                indication = null,
                interactionSource = interaction,
                onClick = onClick,
            )
            .padding(horizontal = 14.dp, vertical = 8.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) Gold500 else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}