package com.faujiniwas.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.faujiniwas.app.R
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.glass.GoldText
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Navy900
import com.faujiniwas.app.ui.theme.Navy950
import com.faujiniwas.app.ui.theme.Olive600
import com.faujiniwas.app.ui.theme.Teal

@Composable
fun LandingScreen(
    onEnterApp: () -> Unit,
    onNavigate: (String) -> Unit,
) {
    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(
                start = 18.dp,
                end = 18.dp,
                top = 24.dp,
                bottom = 100.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // ── Top Brand Bar ──
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.fauji_logo),
                            contentDescription = "Fauji Niwas Crest",
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .border(1.5.dp, Gold500.copy(alpha = 0.6f), CircleShape),
                        )
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "FAUJI",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = Gold500,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp,
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    text = "NIWAS",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = Color.White,
                                    fontWeight = FontWeight.Light,
                                    letterSpacing = 1.sp,
                                )
                            }
                            Text(
                                text = "DEFENCE HOUSING PORTAL",
                                style = MaterialTheme.typography.labelSmall,
                                color = Gold400.copy(alpha = 0.8f),
                                letterSpacing = 1.2.sp,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(Gold500.copy(alpha = 0.15f))
                            .border(1.dp, Gold500.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                            .clickable { onEnterApp() }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text(
                                text = "Enter App",
                                style = MaterialTheme.typography.labelMedium,
                                color = Gold400,
                                fontWeight = FontWeight.Bold,
                            )
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = Gold400,
                                modifier = Modifier.size(14.dp),
                            )
                        }
                    }
                }
            }

            // ── Hero Section ──
            item {
                LandingHeroCard(onEnterApp = onEnterApp, onNavigate = onNavigate)
            }

            // ── Key Trust Stats ──
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    StatPill(
                        value = "4,800+",
                        label = "Verified Homes",
                        modifier = Modifier.weight(1f),
                    )
                    StatPill(
                        value = "62+",
                        label = "Cantonments",
                        modifier = Modifier.weight(1f),
                    )
                    StatPill(
                        value = "₹0",
                        label = "Brokerage",
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            // ── Section Title: Why Fauji Niwas ──
            item {
                SectionTitle(
                    eyebrow = "Defence Exclusivity",
                    title = "Why Fauji Niwas?",
                )
            }

            // ── 6 Core Military Pillars ──
            item {
                PillarCard(
                    icon = Icons.Filled.VerifiedUser,
                    title = "100% Defence Community",
                    subtitle = "Strict verification gate. Connect directly with serving personnel, veterans, and military families. No commercial real estate brokers.",
                    tint = Gold500,
                )
            }

            item {
                PillarCard(
                    icon = Icons.Filled.Map,
                    title = "Cantonment & CSD Radius",
                    subtitle = "All properties mapped with exact commuting distance to garrison main gates, Military Hospitals (MH), and CSD canteen depots.",
                    tint = Teal,
                )
            }

            item {
                PillarCard(
                    icon = Icons.Filled.Description,
                    title = "Instant Military Vacate Clause",
                    subtitle = "Pre-loaded lease deed templates featuring the official Armed Forces sudden-transfer vacate clause with zero security deposit forfeiture.",
                    tint = Gold400,
                )
            }

            item {
                PillarCard(
                    icon = Icons.Filled.Hotel,
                    title = "SSB Transit Accommodation",
                    subtitle = "Verified budget stays and hostels near SSB selection boards (Allahabad, Bhopal, Bangalore, Kapurthala) for candidates and parents.",
                    tint = Olive600,
                )
            }

            item {
                PillarCard(
                    icon = Icons.Filled.Calculate,
                    title = "7th CPC HRA Calculator",
                    subtitle = "Instant allowance breakdown for Class X, Y, and Z military stations across all ranks from Sepoy to Lieutenant General.",
                    tint = Gold500,
                )
            }

            item {
                PillarCard(
                    icon = Icons.Filled.ShoppingBag,
                    title = "Fauji Relocation Marketplace",
                    subtitle = "Zero-commission furniture, vehicle, and appliance buy-and-sell platform designed for rapid garrison postings and unit transfers.",
                    tint = Teal,
                )
            }

            // ── Quick Tool Launchers ──
            item {
                SectionTitle(
                    eyebrow = "Tactical Utilities",
                    title = "Instant Tools",
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    ToolLaunchCard(
                        icon = Icons.Filled.Calculate,
                        title = "HRA Calculator",
                        subtitle = "7th CPC Rates",
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigate("hra") },
                    )
                    ToolLaunchCard(
                        icon = Icons.Filled.Hotel,
                        title = "SSB Hostels",
                        subtitle = "Selection Boards",
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigate("ssb_dorms") },
                    )
                    ToolLaunchCard(
                        icon = Icons.Filled.SmartToy,
                        title = "AI Helper",
                        subtitle = "Posting Queries",
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigate("ai_helper") },
                    )
                }
            }

            // ── Popular Cantonment Stations ──
            item {
                SectionTitle(
                    eyebrow = "Garrisons",
                    title = "Major Military Bases",
                )
            }

            item {
                GlassCard {
                    Text(
                        text = "Active Listings Across Key Hubs:",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        StationChip("Pune", onEnterApp)
                        StationChip("Delhi Cantt", onEnterApp)
                        StationChip("Ambala", onEnterApp)
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        StationChip("Secunderabad", onEnterApp)
                        StationChip("Lucknow", onEnterApp)
                        StationChip("Dehradun", onEnterApp)
                    }
                }
            }

            item {
                Spacer(Modifier.height(10.dp))
                Text(
                    text = "Built exclusively for the Indian Armed Forces. Jai Hind 🇮🇳",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }

        // ── Sticky Floating Enter App Dock ──
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 14.dp),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(26.dp))
                    .background(Color(0xF00D1527))
                    .border(1.dp, Gold500.copy(alpha = 0.35f), RoundedCornerShape(26.dp))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Ready to explore?",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Browse homes, dorms & marketplace",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    GoldButton(
                        text = "Go to App",
                        icon = {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = Navy1000,
                                modifier = Modifier.size(16.dp),
                            )
                        },
                        onClick = onEnterApp,
                    )
                }
            }
        }
    }
}

@Composable
private fun LandingHeroCard(
    onEnterApp: () -> Unit,
    onNavigate: (String) -> Unit,
) {
    AnimatedVisibility(
        visible = true,
        enter = slideInVertically(
            initialOffsetY = { it / 3 },
            animationSpec = spring(dampingRatio = 0.75f, stiffness = Spring.StiffnessLow),
        ),
    ) {
        GlassCard {
            GlassPill(
                text = "🇮🇳 Zero-Brokerage Defence Housing",
                tint = Gold500,
                icon = {
                    Icon(
                        Icons.Filled.Shield,
                        contentDescription = null,
                        tint = Gold500,
                        modifier = Modifier.size(14.dp),
                    )
                },
            )
            Spacer(Modifier.height(14.dp))
            GoldText(
                text = "RELOCATE SAFELY",
                style = MaterialTheme.typography.displayMedium,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Zero Brokerage. Implicit Trust.",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(10.dp))
            Text(
                text = "India's premier defence housing and garrison relocation portal. Mapped verified homes near every cantonment gate — jawans to officers, veterans to families in transit.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 22.sp,
            )
            Spacer(Modifier.height(20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                GoldButton(
                    text = "Launch Portal",
                    icon = {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = Navy1000,
                            modifier = Modifier.size(18.dp),
                        )
                    },
                    onClick = onEnterApp,
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color.White.copy(alpha = 0.08f))
                        .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(18.dp))
                        .clickable { onNavigate("stations") }
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                ) {
                    Text(
                        text = "Stations",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

@Composable
private fun StatPill(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xF0101827))
            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
            .padding(vertical = 12.dp, horizontal = 8.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                color = Gold400,
                fontWeight = FontWeight.Black,
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun PillarCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    tint: Color,
) {
    GlassCard(padding = 16.dp) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(tint.copy(alpha = 0.15f))
                    .border(1.dp, tint.copy(alpha = 0.35f), CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(20.dp),
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 20.sp,
                )
            }
        }
    }
}

@Composable
private fun ToolLaunchCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xF0101827))
            .border(1.dp, Gold500.copy(alpha = 0.25f), RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
    ) {
        Column(horizontalAlignment = Alignment.Start) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Gold500,
                modifier = Modifier.size(24.dp),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.labelMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun StationChip(
    name: String,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White.copy(alpha = 0.06f))
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(text = "📍", fontSize = 10.sp)
            Text(
                text = name,
                style = MaterialTheme.typography.labelMedium,
                color = Gold400,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}
