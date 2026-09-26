package com.faujiniwas.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.AddHome
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.components.ListingCard
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.glass.GoldText
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.glass.StatCell
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Olive600
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Teal

@Composable
fun HomeScreen(
    listings: List<Listing>,
    onNavigate: (String) -> Unit,
    onOpenListing: (String) -> Unit,
) {
    val displayListings = listings.ifEmpty { Listing.SAMPLE_LISTINGS }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            start = 18.dp,
            end = 18.dp,
            top = 20.dp,
            bottom = 24.dp,
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item { HeroCard(onNavigate) }
        item { StatsStrip() }
        item {
            SectionTitle(
                eyebrow = "Quick Launch",
                title = "Explore",
            )
        }
        item { QuickGrid(onNavigate) }

        item {
            SectionTitle(
                eyebrow = if (listings.isEmpty()) "Featured Homes" else "The Community",
                title = "Recent Listings",
                trailing = {
                    Text(
                        text = "View all",
                        style = MaterialTheme.typography.labelLarge,
                        color = Gold500,
                        modifier = Modifier.clickableItem { onNavigate("listings") },
                    )
                },
            )
        }
        items(displayListings.take(6), key = { it.id }) { listing ->
            ListingCard(
                listing = listing,
                onClick = { onOpenListing(it.id) },
            )
        }
        item {
            Text(
                text = "Thanks for trusting the fauji network. Jai Hind 🇮🇳",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
            )
        }
    }
}

@Composable
private fun HeroCard(onNavigate: (String) -> Unit) {
    val visible = true
    AnimatedVisibility(
        visible = visible,
        enter = slideInVertically(
            initialOffsetY = { it / 2 },
            animationSpec = spring(dampingRatio = 0.75f, stiffness = Spring.StiffnessLow),
        ),
    ) {
        GlassCard {
            GlassPill(text = "🇮🇳 Welcome to Fauji Niwas — Zero-Brokerage Defence Housing")
            Spacer(Modifier.height(14.dp))
            GoldText(
                text = "FIND PERFECT HOME",
                style = MaterialTheme.typography.displayMedium,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Relocate Safely, Trust Implicitly.",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(10.dp))
            Text(
                text = "Verified zero-brokerage homes near every cantonment gate — from jawans to officers, SSB candidates to families in transit.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(18.dp))
            val context = LocalContext.current
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                GoldButton(
                    text = "Browse Listings",
                    icon = {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = Navy1000,
                            modifier = Modifier.size(18.dp),
                        )
                    },
                    onClick = { onNavigate("listings") },
                )
                GoldButton(
                    text = "Post Property +",
                    icon = {
                        Icon(
                            Icons.Filled.AddHome,
                            contentDescription = null,
                            tint = Navy1000,
                            modifier = Modifier.size(18.dp),
                        )
                    },
                    onClick = { onNavigate("post") },
                )
            }
            Spacer(Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
            ) {
                TrustDot("1,425+ listings")
                TrustDot("0% brokerage")
                TrustDot("62+ stations")
            }
        }
    }
}

@Composable
private fun TrustDot(text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .size(8.dp)
                .clickableBackgroundCircle(Gold500),
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun StatsStrip() {
    GlassCard(shape = androidx.compose.foundation.shape.RoundedCornerShape(26.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            StatCell("62+", "Military Stations", valueTint = Gold500)
            StatCell("0%", "Brokerage", valueTint = Teal)
            StatCell("1,425+", "Live Listings", valueTint = Gold500)
            StatCell("1.4M+", "Defence Families", valueTint = Teal)
        }
    }
}

@Composable
private fun QuickGrid(onNavigate: (String) -> Unit) {
    val actions = listOf(
        QuickAction("Rental Homes", "Housing feed", Icons.AutoMirrored.Filled.ListAlt, "listings"),
        QuickAction("Tactical Map", "Radar & base gates", Icons.Filled.Map, "map"),
        QuickAction("Marketplace", "Cantonment goods", Icons.Filled.ShoppingBag, "listings"),
        QuickAction("Stations", "62+ cantonments", Icons.Filled.Place, "stations"),
        QuickAction("HRA Estimator", "7th CPC allowance", Icons.Filled.Calculate, "hra"),
        QuickAction("Post Listing", "Homes & goods", Icons.Filled.AddHome, "post"),
        QuickAction("Fauji Sahayak", "Native AI guide", Icons.Filled.SmartToy, "ai_helper"),
        QuickAction("SSB Dorms", "Candidate transit", Icons.Filled.Hotel, "ssb_dorms"),
    )
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        actions.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                row.forEach { action ->
                    QuickActionTile(action, Modifier.weight(1f), onNavigate)
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

private data class QuickAction(
    val label: String,
    val caption: String,
    val icon: ImageVector,
    val route: String,
)

@Composable
private fun QuickActionTile(
    action: QuickAction,
    modifier: Modifier,
    onNavigate: (String) -> Unit,
) {
    GlassCard(
        modifier = modifier,
        onClick = { onNavigate(action.route) },
        shape = androidx.compose.foundation.shape.RoundedCornerShape(22.dp),
    ) {
        Icon(
            imageVector = action.icon,
            contentDescription = action.label,
            tint = if (action.route in listOf("ai_helper", "ssb_dorms", "post")) Gold500 else Teal,
            modifier = Modifier.size(26.dp),
        )
        Spacer(Modifier.height(10.dp))
        Text(
            text = action.label,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = action.caption,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

// small local helpers tuned for clickable Text / dots
@Composable
private fun Modifier.clickableItem(onClick: () -> Unit): Modifier {
    val interaction = remember { MutableInteractionSource() }
    return this.then(
        Modifier
            .clip(androidx.compose.foundation.shape.RoundedCornerShape(10.dp))
            .clickable(
                indication = androidx.compose.material3.ripple(color = Gold500),
                interactionSource = interaction,
                onClick = onClick,
            )
            .padding(horizontal = 10.dp, vertical = 6.dp),
    )
}

@Composable
private fun Modifier.clickableBackgroundCircle(color: androidx.compose.ui.graphics.Color): Modifier = this.then(
    Modifier.background(color, androidx.compose.foundation.shape.CircleShape),
)