package com.faujiniwas.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Teal

private val ImageShape = RoundedCornerShape(20.dp)

@Composable
fun ListingCard(
    listing: Listing,
    modifier: Modifier = Modifier,
    onClick: (Listing) -> Unit,
) {
    GlassCard(
        modifier = modifier.fillMaxWidth(),
        onClick = { onClick(listing) },
        shape = RoundedCornerShape(28.dp),
        padding = 6.dp,
    ) {
        // ── image ──
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(16 / 9f)
                .clip(ImageShape)
                .background(Color(0xFF101A2E)),
        ) {
            AsyncImage(
                model = listing.images.firstOrNull() ?: fallbackImage,
                contentDescription = listing.displayName,
                modifier = Modifier.matchParentSize(),
                contentScale = ContentScale.Crop,
            )
            // bottom fade
            Box(
                Modifier
                    .matchParentSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, Color(0x66080C14)),
                        ),
                    ),
            )
            // verified + price overlay
            Row(
                Modifier
                    .align(Alignment.TopStart)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                if (listing.isMarketplace) {
                    GlassPill(text = "Marketplace", tint = Teal)
                }
                if (listing.verified) {
                    GlassPill(
                        text = "Verified",
                        tint = Teal,
                        icon = {
                            Icon(
                                Icons.Filled.Verified,
                                contentDescription = null,
                                tint = Teal,
                                modifier = Modifier.size(14.dp),
                            )
                        },
                    )
                } else if (!listing.isMarketplace) {
                    GlassPill(text = "Defence Network", tint = Gold500)
                }
            }
            Row(
                Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                Text(
                    text = listing.displayPrice,
                    style = MaterialTheme.typography.headlineMedium,
                    color = Gold400,
                    fontWeight = FontWeight.Black,
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        // ── body ──
        Column(Modifier.padding(horizontal = 10.dp)) {
            Text(
                text = listing.displayName,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(4.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    text = listing.location,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.weight(1f),
                )
                if (listing.distance.isNotBlank()) {
                    Text(
                        text = if (listing.isMarketplace) "${listing.distance} km from base" else "${listing.distance} km to gate",
                        style = MaterialTheme.typography.labelMedium,
                        color = Gold500,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (listing.isMarketplace) {
                    keyField(listing.category.ifBlank { listing.type.ifBlank { "Defence Transfer" } })
                    if (listing.condition.isNotBlank()) keyField(listing.condition)
                    if (listing.negotiable) keyField("Negotiable") else keyField("Fixed")
                } else {
                    keyField(listing.type.ifBlank { if (listing.bhk > 0) "${listing.bhk} BHK" else "Flat" })
                    if (listing.furnishing.isNotBlank()) keyField(listing.furnishing)
                    if (listing.sqft > 0) keyField("${listing.sqft} sqft")
                }
            }
        }
    }
}

@Composable
private fun keyField(text: String) {
    Box(
        Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.55f))
            .padding(horizontal = 10.dp, vertical = 5.dp),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

/** Unsplash fallback so unfurnished cards still get a warm visual. */
internal val fallbackImage: String
    get() = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80"