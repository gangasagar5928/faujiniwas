package com.faujiniwas.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AddHome
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldText
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Teal

@Composable
fun SettingsScreen(
    darkOverride: Boolean,
    onToggleDark: (Boolean) -> Unit,
    feedConnected: Boolean,
    onNavigate: (String) -> Unit,
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 18.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        SectionTitle(
            eyebrow = "Profile & Shell",
            title = "Settings",
            trailing = {
                GlassPill(
                    text = if (feedConnected) "Live feed" else "Offline",
                    tint = if (feedConnected) Teal else Gold500,
                )
            },
        )

        // ── identity ──
        GlassCard {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size(52.dp)
                        .background(Gold500.copy(alpha = 0.18f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Filled.Badge,
                        contentDescription = null,
                        tint = Gold500,
                        modifier = Modifier.size(28.dp),
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Defence Network Member",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = "JCO · Officer · Family transit",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.weight(1f))
                GlassPill(text = "✔ Badge", tint = Teal)
            }
        }

        // ── Native Tools & Services ──
        SectionTitle(eyebrow = "Defence Services", title = "Native Tools & Utilities")
        GlassCard {
            SettingActionRow(
                icon = Icons.Filled.AddHome,
                title = "Post Property or Goods",
                caption = "List your cantonment home or marketplace item",
                onClick = { onNavigate("post") },
            )
            Spacer(Modifier.height(8.dp))
            SettingActionRow(
                icon = Icons.Filled.SmartToy,
                title = "Fauji Sahayak (AI Helper)",
                caption = "7th CPC HRA, transfer grant & cantonment guide",
                onClick = { onNavigate("ai_helper") },
            )
            Spacer(Modifier.height(8.dp))
            SettingActionRow(
                icon = Icons.Filled.Hotel,
                title = "SSB Transit Accommodation",
                caption = "Candidate transit stays near SSB selection boards",
                onClick = { onNavigate("ssb_dorms") },
            )
            Spacer(Modifier.height(8.dp))
            SettingActionRow(
                icon = Icons.Filled.Language,
                title = "Military Stations Directory",
                caption = "Browse enclaves and gates across 62+ cantonments",
                onClick = { onNavigate("stations") },
            )
        }

        // ── appearance ──
        GlassCard {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (darkOverride) Icons.Filled.DarkMode else Icons.Filled.LightMode,
                    contentDescription = null,
                    tint = Gold500,
                    modifier = Modifier.size(26.dp),
                )
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = if (darkOverride) "Midnight Navy Aurora (Dark)" else "Warm Stone Porcelain (Light)",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = if (darkOverride) "Deep liquid glass aurora theme" else "Daylight frosted stone theme",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Switch(
                    checked = darkOverride,
                    onCheckedChange = onToggleDark,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Gold500,
                        checkedTrackColor = Gold500.copy(alpha = 0.35f),
                    ),
                )
            }
        }

        // ── privacy ──
        GlassCard {
            SettingRow(
                icon = Icons.Filled.Lock,
                title = "Privacy by default",
                caption = "No unit numbers, no tactical data — ever. Reads only public Firestore.",
            )
            Spacer(Modifier.height(4.dp))
            SettingRow(
                icon = Icons.Filled.Info,
                title = "About this build",
                caption = "Native Kotlin + Jetpack Compose · v0.1.0",
            )
        }

        GoldText(
            text = "A home. A family. A fauji connection.",
            style = MaterialTheme.typography.headlineMedium,
            align = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text = "Built with ❤ for the Indian Armed Forces community 🇮🇳",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun SettingActionRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    caption: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = androidx.compose.material3.ripple(),
                onClick = onClick,
            )
            .padding(vertical = 8.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Gold500,
            modifier = Modifier.size(24.dp),
        )
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = caption,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Icon(
            Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = Gold500.copy(alpha = 0.7f),
            modifier = Modifier.size(18.dp),
        )
    }
}

@Composable
private fun SettingRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    caption: String,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Gold500,
            modifier = Modifier.size(22.dp),
        )
        Spacer(Modifier.width(12.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = caption,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}