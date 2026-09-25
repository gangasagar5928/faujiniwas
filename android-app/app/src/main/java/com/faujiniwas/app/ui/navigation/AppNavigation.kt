package com.faujiniwas.app.ui.navigation

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.theme.Gold500

/** Top-level glass app destinations (bottom-bar tabs). */
enum class Destination(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector,
) {
    Home("home", "Home", Icons.Filled.Home, Icons.Filled.Home),
    Listings("listings", "Listings", Icons.AutoMirrored.Filled.ListAlt, Icons.Filled.Apartment),
    Map("map", "Map", Icons.Filled.Map, Icons.Filled.Map),
    Stations("stations", "Stations", Icons.Filled.Place, Icons.Filled.Place),
    Settings("settings", "Settings", Icons.Filled.Settings, Icons.Filled.Settings),
}

val topLevelRoutes: Set<String> = Destination.entries.map { it.route }.toSet()

/** Floating frosted navigation bar — the app's Liquid-Glass dock. */
@Composable
fun GlassBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 18.dp, vertical = 10.dp),
    ) {
        GlassCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(28.dp),
            padding = 6.dp,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Destination.entries.forEach { dest ->
                    val selected = currentRoute == dest.route
                    BottomTab(
                        destination = dest,
                        selected = selected,
                        onClick = { onNavigate(dest.route) },
                    )
                }
            }
        }
    }
}

@Composable
private fun BottomTab(
    destination: Destination,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val pill = animateDpAsState(
        targetValue = if (selected) 8.dp else 4.dp,
        animationSpec = spring(dampingRatio = 0.6f),
        label = "tabPill",
    )
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(18.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick,
            )
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            Modifier
                .background(
                    if (selected) Gold500.copy(alpha = 0.20f)
                    else Color.Transparent,
                    RoundedCornerShape(pill.value),
                )
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) {
            Icon(
                imageVector = if (selected) destination.selectedIcon else destination.icon,
                contentDescription = destination.label,
                tint = if (selected) Gold500 else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Spacer(Modifier.height(3.dp))
        Text(
            text = destination.label,
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) Gold500 else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

/** Glass top bar for secondary screens (detail / calculators). */
@Composable
fun GlassBackTopBar(
    title: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) {
    GlassCard(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        padding = 6.dp,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 6.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            GlassBackButton(onBack)
            Spacer(Modifier.height(0.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 10.dp),
            )
            trailing?.invoke()
        }
    }
}

@Composable
fun GlassBackButton(onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val scale = com.faujiniwas.app.ui.glass.pressScale(interaction)
    Box(
        Modifier
            .height(44.dp)
            .padding(2.dp)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clip(RoundedCornerShape(50))
            .background(
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                RoundedCornerShape(50),
            )
            .clickable(
                indication = null,
                interactionSource = interaction,
                onClick = onClick,
            )
            .padding(horizontal = 12.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = Gold500,
        )
    }
}