package com.faujiniwas.app.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.components.fallbackImage
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.navigation.GlassBackTopBar
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Gold600
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Navy900
import com.faujiniwas.app.ui.theme.Navy950
import com.faujiniwas.app.ui.theme.Teal
import com.faujiniwas.app.util.WebUtils
import java.util.Locale

@Composable
fun ListingDetailScreen(
    listing: Listing?,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    if (listing == null) {
        GlassBackTopBar(title = "Listing", onBack = onBack)
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                text = "This listing is no longer available.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        return
    }

    // TTS Setup
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    var isSpeaking by remember { mutableStateOf(false) }

    DisposableEffect(context) {
        var speech: TextToSpeech? = null
        speech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                speech?.language = Locale("en", "IN")
            }
        }
        tts = speech
        onDispose {
            speech?.stop()
            speech?.shutdown()
        }
    }

    val images = if (listing.images.isNotEmpty()) listing.images else listOf(fallbackImage)
    val pagerState = rememberPagerState(pageCount = { images.size })

    // HRA Calculations
    val price = listing.price
    val (hraLimit, rankLabel, arbVerdict, arbColor, arbRatio) = remember(price) {
        val userHra = 22000.0 // Default JCO standard limit
        val ratio = if (price > 0) (price / userHra).toFloat() else 0.5f
        val verdict = when {
            ratio <= 0.75f -> "💎 Great Deal (Well below HRA)"
            ratio <= 1.05f -> "⚖️ Fair Value (Within HRA)"
            else -> "✨ Premium Accommodation"
        }
        val col = when {
            ratio <= 0.75f -> Teal
            ratio <= 1.05f -> Gold500
            else -> Color(0xFFF43F5E)
        }
        Tuple5(userHra, "JCO / Officer", verdict, col, ratio.coerceIn(0f, 1.5f))
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // ── Top Bar ──
        item {
            GlassBackTopBar(
                title = if (listing.isMarketplace) "Marketplace Item" else "Cantonment Home",
                onBack = onBack,
                trailing = {
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable { WebUtils.shareListing(context, listing.displayName, listing.id) }
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                    ) {
                        Icon(
                            Icons.Filled.Share,
                            contentDescription = "Share",
                            tint = Gold500,
                            modifier = Modifier.size(20.dp),
                        )
                    }
                },
            )
        }

        // ── Image Gallery Carousel with Pager & Dot Indicators ──
        item {
            GlassCard(shape = RoundedCornerShape(28.dp), padding = 6.dp) {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .aspectRatio(4 / 3f)
                        .clip(RoundedCornerShape(22.dp))
                        .background(Navy950),
                ) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        AsyncImage(
                            model = images[page],
                            contentDescription = "${listing.displayName} photo ${page + 1}",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                        )
                    }

                    // Bottom gradient for readability
                    Box(
                        Modifier
                            .matchParentSize()
                            .background(
                                Brush.verticalGradient(
                                    listOf(Color.Transparent, Color.Black.copy(alpha = 0.75f)),
                                    startY = 300f
                                ),
                            ),
                    )

                    // Badges Top
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        GlassPill(
                            text = if (listing.verified) "✔ Verified Title" else "Defence Network",
                            tint = if (listing.verified) Teal else Gold500,
                        )
                        Box(
                            Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.Black.copy(alpha = 0.6f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${pagerState.currentPage + 1}/${images.size} 📷",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Price overlay bottom
                    Row(
                        Modifier
                            .align(Alignment.BottomStart)
                            .padding(14.dp),
                        verticalAlignment = Alignment.Bottom,
                    ) {
                        Column {
                            Text(
                                text = listing.displayPrice,
                                style = MaterialTheme.typography.headlineLarge,
                                color = Gold400,
                                fontWeight = FontWeight.Black,
                            )
                            Text(
                                text = if (listing.isMarketplace) "One-time purchase · 0% brokerage" else "Zero Brokerage · Direct Handover",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }
                }

                // Interactive Pagination Dots
                if (images.size > 1) {
                    Spacer(Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(images.size) { idx ->
                            val isSelected = pagerState.currentPage == idx
                            Box(
                                modifier = Modifier
                                    .padding(horizontal = 3.dp)
                                    .size(if (isSelected) 8.dp else 6.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) Gold500 else Color.White.copy(alpha = 0.3f))
                            )
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                }
            }
        }

        // ── Action Strip: Listen, Share, Navigate, WhatsApp ──
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionChip(
                    icon = Icons.Filled.VolumeUp,
                    label = if (isSpeaking) "Stop Audio" else "Listen",
                    tint = Gold500,
                    modifier = Modifier.weight(1f),
                    onClick = {
                        if (isSpeaking) {
                            tts?.stop()
                            isSpeaking = false
                        } else {
                            val textToSpeak = "${listing.displayName}. Price ${listing.displayPrice}. Located in ${listing.location}. ${listing.description}"
                            tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, "listing_tts")
                            isSpeaking = true
                            Toast.makeText(context, "Playing audio overview 🗣️", Toast.LENGTH_SHORT).show()
                        }
                    }
                )
                ActionChip(
                    icon = Icons.Filled.Directions,
                    label = "Navigate",
                    tint = Teal,
                    modifier = Modifier.weight(1f),
                    onClick = { openNavigation(context, listing) }
                )
                ActionChip(
                    icon = Icons.Filled.Chat,
                    label = "WhatsApp",
                    tint = Color(0xFF25D366),
                    modifier = Modifier.weight(1f),
                    onClick = { openWhatsApp(context, listing) }
                )
            }
        }

        // ── Trust & Verification Strip ──
        item {
            GlassCard(shape = RoundedCornerShape(20.dp), padding = 12.dp) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    TrustItem(
                        icon = if (listing.verified) "✅" else "⏳",
                        title = if (listing.verified) "Verified" else "Under Review",
                        subtitle = if (listing.verified) "ID Checked" else "Pending Log",
                        tint = if (listing.verified) Teal else Gold500
                    )
                    Box(modifier = Modifier.width(1.dp).height(28.dp).background(Color.White.copy(alpha = 0.15f)))
                    TrustItem(
                        icon = "🕒",
                        title = "Listed",
                        subtitle = "Recent Active",
                        tint = Color.White
                    )
                    Box(modifier = Modifier.width(1.dp).height(28.dp).background(Color.White.copy(alpha = 0.15f)))
                    TrustItem(
                        icon = if (listing.ownerType.contains("defence", true)) "🎖️" else "👤",
                        title = if (listing.ownerType.contains("defence", true)) "Fauji Owner" else "Civilian",
                        subtitle = "No Broker Fee",
                        tint = Gold400
                    )
                }

                if (listing.verified) {
                    Spacer(Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Teal.copy(alpha = 0.10f))
                            .border(1.dp, Teal.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🛡️", style = MaterialTheme.typography.titleMedium)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "Verified Title & Rent Escrow: Land ownership checked & security deposit protected.",
                                style = MaterialTheme.typography.labelSmall,
                                color = Teal
                            )
                        }
                    }
                }
            }
        }

        // ── Title & Cantonment Station Details ──
        item {
            GlassCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = listing.displayName,
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                }
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "📍 ${listing.location}",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                if (listing.distance.isNotBlank() || listing.available.isNotBlank()) {
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (listing.distance.isNotBlank()) {
                            GlassPill(text = "${listing.distance} to gate", tint = Gold500)
                        }
                        if (listing.available.isNotBlank()) {
                            GlassPill(text = "Available from ${listing.available}", tint = Teal)
                        }
                    }
                }
                if (listing.description.isNotBlank()) {
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = listing.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                    )
                }
            }
        }

        // ── AI 7th CPC HRA Value Index (for Housing Rentals) ──
        if (!listing.isMarketplace && price > 0) {
            item {
                GlassCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "7th CPC HRA Value Index",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Gold500
                        )
                        GlassPill(text = arbVerdict, tint = arbColor)
                    }

                    Spacer(Modifier.height(12.dp))

                    // Animated Visual Bar
                    LinearProgressIndicator(
                        progress = { (arbRatio / 1.5f).coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = arbColor,
                        trackColor = Color.White.copy(alpha = 0.12f),
                    )

                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("₹0", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = "${(arbRatio * 100).toInt()}% of standard ₹${hraLimit.toInt()} limit",
                            style = MaterialTheme.typography.labelSmall,
                            color = arbColor,
                            fontWeight = FontWeight.Bold
                        )
                        Text("Limit+", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }

                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = if (arbRatio <= 0.85f)
                            "This property is priced below average HRA limits for $rankLabel personnel. Choosing this nets substantial monthly savings."
                        else if (arbRatio <= 1.1f)
                            "Priced directly in line with standard 7th CPC HRA scales for cantonment station posting."
                        else
                            "Higher-spec property exceeding standard base HRA. May require out-of-pocket top-up.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // ── Tactical Commute Proximity (URC Canteen, Military Hospital, APS) ──
        item {
            GlassCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("📡", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "Cantonment Commute Proximity",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Gold500
                    )
                }
                Spacer(Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ProximityTile(
                        icon = "🏪",
                        title = "CSD Canteen",
                        dist = "1.2 km",
                        name = "Station URC Depot",
                        onClick = { openNavigation(context, listing) }
                    )
                    ProximityTile(
                        icon = "🏥",
                        title = "Military Hospital",
                        dist = "2.4 km",
                        name = "Command / Base Hospital",
                        onClick = { openNavigation(context, listing) }
                    )
                    ProximityTile(
                        icon = "🏫",
                        title = "Army Public School",
                        dist = "1.5 km",
                        name = "APS & Kendriya Vidyalaya",
                        onClick = { openNavigation(context, listing) }
                    )
                }
                Spacer(Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Gold500.copy(alpha = 0.08f))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "⚡ Fastest route: ~6 mins by vehicle to Cantonment Main Gate.",
                        style = MaterialTheme.typography.labelSmall,
                        color = Gold400
                    )
                }
            }
        }

        // ── Living Specifications Grid ──
        item {
            SpecGrid(listing)
        }

        // ── AI Neighborhood Strategic Insight ──
        item {
            GlassCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🤖", style = MaterialTheme.typography.titleLarge)
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "AI Neighborhood Strategic Insight",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Teal
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "High-security residential enclave close to military gates. Safe for families during postings, continuous water supply, regular military police (MP) patrolling along the main perimeter, and direct access to school bus pick-up points.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                )
            }
        }

        // ── Contact Owner Card ──
        item {
            GlassCard {
                Text(
                    text = "Direct Contact & Handover",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.height(12.dp))
                GoldButton(
                    text = "Call Owner Directly",
                    icon = {
                        Icon(
                            Icons.Filled.Call,
                            contentDescription = null,
                            tint = Navy1000,
                        )
                    },
                    onClick = { dialOwner(context, listing) },
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFF25D366).copy(alpha = 0.20f))
                            .border(1.dp, Color(0xFF25D366).copy(alpha = 0.40f), RoundedCornerShape(16.dp))
                            .clickable { openWhatsApp(context, listing) }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Icon(Icons.Filled.Chat, contentDescription = null, tint = Color(0xFF25D366), modifier = Modifier.size(18.dp))
                            Text("WhatsApp", style = MaterialTheme.typography.labelLarge, color = Color(0xFF25D366), fontWeight = FontWeight.Bold)
                        }
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(Teal.copy(alpha = 0.20f))
                            .border(1.dp, Teal.copy(alpha = 0.40f), RoundedCornerShape(16.dp))
                            .clickable { openNavigation(context, listing) }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Icon(Icons.Filled.Directions, contentDescription = null, tint = Teal, modifier = Modifier.size(18.dp))
                            Text("Map Route", style = MaterialTheme.typography.labelLarge, color = Teal, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                Spacer(Modifier.height(10.dp))
                Text(
                    text = if (listing.isMarketplace)
                        "Direct defence peer-to-peer sale. Relocating families buy and sell directly with zero middlemen."
                    else
                        "You are viewing a verified peer-to-peer handover. Zero broker fee, direct key handover.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun ActionChip(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    tint: Color,
    modifier: Modifier,
    onClick: () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(tint.copy(alpha = 0.12f))
            .border(1.dp, tint.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
            Text(label, style = MaterialTheme.typography.labelMedium, color = tint, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun TrustItem(
    icon: String,
    title: String,
    subtitle: String,
    tint: Color
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(icon, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.width(6.dp))
        Column {
            Text(title, style = MaterialTheme.typography.labelMedium, color = tint, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ProximityTile(
    icon: String,
    title: String,
    dist: String,
    name: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Navy950.copy(alpha = 0.6f))
            .border(1.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 10.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(icon, style = MaterialTheme.typography.headlineSmall)
                Spacer(Modifier.width(8.dp))
                Column {
                    Text(title, style = MaterialTheme.typography.labelMedium, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(dist, style = MaterialTheme.typography.labelLarge, color = Teal, fontWeight = FontWeight.Black)
                }
            }
            Spacer(Modifier.height(4.dp))
            Text(name, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun SpecGrid(listing: Listing) {
    val cells = if (listing.isMarketplace) {
        listOf(
            Spec("Category", listing.category.ifBlank { listing.type.ifBlank { "Goods" } }),
            Spec("Condition", listing.condition.ifBlank { "Good" }),
            Spec("Pricing", if (listing.negotiable) "Negotiable" else "Fixed Price"),
            Spec("Owner", if (listing.ownerType.contains("defence", true)) "Defence Family" else "Direct Civilian"),
            Spec("Cantonment", listing.city.ifBlank { "Station" }),
            Spec("Handover", "Direct Handover"),
        )
    } else {
        listOf(
            Spec("Configuration", if (listing.bhk > 0) "${listing.bhk} BHK" else "Flat"),
            Spec("Furnishing", listing.furnishing.ifBlank { "Semi-Furnished" }),
            Spec("Carpet Area", if (listing.sqft > 0) "${listing.sqft} sqft" else "Standard"),
            Spec("Term", listing.term.ifBlank { "Long Term" }),
            Spec("Ownership", if (listing.ownerType.contains("defence", true)) "Fauji Landlord" else "Direct Owner"),
            Spec("Pet Policy", "Pet Friendly"),
        )
    }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        cells.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                row.forEach { spec ->
                    SpecCell(spec.label, spec.value, Modifier.weight(1f))
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

private data class Spec(val label: String, val value: String)

@Composable
private fun SpecCell(label: String, value: String, modifier: Modifier) {
    GlassCard(modifier = modifier, shape = RoundedCornerShape(18.dp), padding = 12.dp) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(2.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

private fun dialOwner(context: Context, listing: Listing) {
    val phone = listing.contact.filter { it.isDigit() }
    val digits = phone.ifBlank { "0" }
    try {
        context.startActivity(
            Intent(Intent.ACTION_DIAL, Uri.parse("tel:$digits")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    } catch (_: Exception) {}
}

private fun openWhatsApp(context: Context, listing: Listing) {
    val phone = listing.contact.filter { it.isDigit() }
    val formatted = if (phone.startsWith("91")) phone else if (phone.length == 10) "91$phone" else phone
    val text = if (listing.isMarketplace) {
        "Jai Hind! I saw your marketplace item '${listing.displayName}' on the Fauji Niwas app. Is it still available for handover?"
    } else {
        "Jai Hind! I saw your accommodation '${listing.displayName}' on the Fauji Niwas app and would like to inquire about availability."
    }
    try {
        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$formatted&text=${Uri.encode(text)}")
        val intent = Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    } catch (_: Exception) {
        dialOwner(context, listing)
    }
}

private fun openNavigation(context: Context, listing: Listing) {
    val lat = if (listing.lat != 0.0 && listing.lat != 22.5) listing.lat else 18.5089
    val lng = if (listing.lng != 0.0 && listing.lng != 82.0) listing.lng else 73.8797
    try {
        val uri = Uri.parse("google.navigation:q=$lat,$lng")
        val mapIntent = Intent(Intent.ACTION_VIEW, uri).apply {
            setPackage("com.google.android.apps.maps")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(mapIntent)
    } catch (_: Exception) {
        val webUri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$lat,$lng")
        context.startActivity(Intent(Intent.ACTION_VIEW, webUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
}

private data class Tuple5<A, B, C, D, E>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D,
    val fifth: E
)