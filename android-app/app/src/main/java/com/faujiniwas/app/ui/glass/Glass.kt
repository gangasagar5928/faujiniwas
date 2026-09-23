package com.faujiniwas.app.ui.glass

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.theme.GlassBaseDark
import com.faujiniwas.app.ui.theme.GlassBaseLight
import com.faujiniwas.app.ui.theme.GlassMidDark
import com.faujiniwas.app.ui.theme.GlassMidLight
import com.faujiniwas.app.ui.theme.GlassTopDark
import com.faujiniwas.app.ui.theme.GlassTopLight
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Gold600
import com.faujiniwas.app.ui.theme.Gold700
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.WarmOrange
import com.faujiniwas.app.ui.theme.AmberWarm
import com.faujiniwas.app.ui.theme.Teal
import com.faujiniwas.app.ui.theme.TealAccent
import com.faujiniwas.app.ui.theme.Indigo
import com.faujiniwas.app.ui.theme.IndigoAccent
import com.faujiniwas.app.ui.theme.GoldWarm
import com.faujiniwas.app.ui.theme.RoseAccent
import com.faujiniwas.app.ui.theme.CardDark
import com.faujiniwas.app.ui.theme.CardLight
import com.faujiniwas.app.ui.theme.Olive600

private val GlassCorner = RoundedCornerShape(24.dp)

/** Theme-aware frosted-white chip colours (web `--lgm-1..3`). */
private fun glassColours(dark: Boolean): List<Color> =
    if (dark) listOf(GlassTopDark, GlassMidDark, GlassBaseDark)
    else listOf(GlassTopLight, GlassMidLight, GlassBaseLight)

@Composable
private fun useDark(): Boolean = MaterialTheme.colorScheme.background.luminance() < 0.5f

private fun glassBrush(dark: Boolean): Brush = Brush.linearGradient(
    colors = glassColours(dark),
    start = Offset(0f, 0f),
    end = Offset(2400f, 1600f), // ~165° diagonal
)

/** Soft outer glow for the glass layers — replaces harsh elevation. */
private fun Modifier.softShadow(shape: androidx.compose.ui.graphics.Shape): Modifier = this
    .shadow(
        elevation = 18.dp,
        shape = shape,
        ambientColor = Color.Black.copy(alpha = 0.45f),
        spotColor = Color.Black.copy(alpha = 0.35f),
    )

// ────────────────────────────────────────────────────────────────────────────
// Gloaming-Blend aurora: drifting colour clouds behind everything.
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun AuroraBackground(
    modifier: Modifier = Modifier,
    dark: Boolean = true,
    content: @Composable BoxScope.() -> Unit = {},
) {
    val transition = rememberInfiniteTransition(label = "aurora")
    @Composable
    fun drifter(seed: Float, spanMs: Int) = transition.animateFloat(
        initialValue = seed,
        targetValue = seed + 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(spanMs, easing = FastOutSlowInEasing),
        ),
        label = "auroraDrift",
    )

    val a1 by drifter(0.0f, 22000)
    val a2 by drifter(0.5f, 26000)
    val a3 by drifter(1.0f, 30000)
    val a4 by drifter(0.25f, 24000)

    val blob = if (dark) Color(0x54FFFFFF) else Color(0x0DFFFFFF)

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    if (dark)
                        listOf(com.faujiniwas.app.ui.theme.Navy1000, com.faujiniwas.app.ui.theme.Navy950)
                    else
                        listOf(Color(0xFFF7F5F0), Color(0xFFEFEAE1)),
                ),
            )
            .clipToBounds(),
    ) {
        // Aurora radial spots — mirrors `.aurora-bg` Gloaming Blend positions & colours.
        val c1 = if (dark) AmberWarm.copy(alpha = 0.44f) else AmberWarm.copy(alpha = 0.22f)
        val c2 = if (dark) TealAccent.copy(alpha = 0.40f) else TealAccent.copy(alpha = 0.20f)
        val c3 = if (dark) IndigoAccent.copy(alpha = 0.44f) else IndigoAccent.copy(alpha = 0.22f)
        val c4 = if (dark) GoldWarm.copy(alpha = 0.36f) else GoldWarm.copy(alpha = 0.18f)
        val c5 = if (dark) RoseAccent.copy(alpha = 0.18f) else RoseAccent.copy(alpha = 0.10f)

        Box(
            Modifier
                .fillMaxSize()
                .drawBehind {
                    val w = size.width
                    val h = size.height
                    fun spot(centre: Offset, radius: Float, colour: Color) {
                        drawCircle(
                            brush = Brush.radialGradient(
                                listOf(colour, Color.Transparent),
                                center = centre,
                                radius = radius,
                            ),
                            radius = radius,
                            center = centre,
                        )
                    }
                    spot(Offset(w * (0.08f + 0.06f * a1), h * (0.03f + 0.02f * a2)), w * 0.68f, c1)
                    spot(Offset(w * (0.94f - 0.05f * a2), h * (0.07f + 0.03f * a1)), w * 0.62f, c2)
                    spot(Offset(w * (0.86f - 0.04f * a3), h * (0.90f - 0.02f * a4)), w * 0.66f, c3)
                    spot(Offset(w * (0.10f + 0.05f * a4), h * (0.92f - 0.03f * a3)), w * 0.60f, c4)
                    spot(Offset(w * 0.50f, h * 0.48f), w * 0.46f, c5)
                },
        )

        // faint grain veil
        Box(
            Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = if (dark) 0.12f else 0.02f)),
        )

        content()
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Fluid press scale (glassmorphic spring response).
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun pressScale(interaction: MutableInteractionSource): Float {
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.965f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMediumLow,
        ),
        label = "glassPress",
    )
    return scale
}

// ────────────────────────────────────────────────────────────────────────────
// GlassCard — the frosted panel used everywhere.
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    shape: androidx.compose.ui.graphics.Shape = GlassCorner,
    padding: Dp = 18.dp,
    content: @Composable ColumnScope.() -> Unit,
) {
    val dark = useDark()
    val interaction = remember { MutableInteractionSource() }
    val scale = pressScale(interaction)
    val tappable = onClick != null

    Box(
        modifier = modifier
            .softShadow(shape)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clip(shape)
            .background(if (dark) CardDark else CardLight)
            .background(glassBrush(dark))
            .then(
                if (tappable) Modifier.clickable(
                    indication = androidx.compose.material3.ripple(),
                    interactionSource = interaction,
                ) { onClick!!() }
                else Modifier,
            )
            .border(
                BorderStroke(
                    1.dp,
                    Brush.verticalGradient(
                        colors = if (dark) listOf(
                            Color.White.copy(alpha = 0.25f),
                            Color.White.copy(alpha = 0.06f),
                        ) else listOf(
                            Color.Black.copy(alpha = 0.08f),
                            Color.Black.copy(alpha = 0.02f),
                        ),
                    ),
                ),
                shape,
            ),
    ) {
        // top catch-light — the signature Liquid-Glass highlight
        Box(
            Modifier
                .fillMaxWidth()
                .height(68.dp)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.White.copy(alpha = if (dark) 0.08f else 0.45f), Color.Transparent),
                    ),
                ),
        )
        Column(
            modifier = Modifier.fillMaxWidth().padding(padding),
            content = content,
        )
    }
}

// ────────────────────────────────────────────────────────────────────────────
// GlassPill — small frosted chip (verified / station / tag).
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun GlassPill(
    text: String,
    modifier: Modifier = Modifier,
    tint: Color = Gold500,
    icon: (@Composable () -> Unit)? = null,
) {
    val dark = useDark()
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(tint.copy(alpha = if (dark) 0.22f else 0.16f))
            .border(
                1.dp,
                tint.copy(alpha = 0.45f),
                RoundedCornerShape(50),
            )
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        icon?.invoke()
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = tint,
            fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
        )
    }
}

// ────────────────────────────────────────────────────────────────────────────
// GoldButton — gradient gold CTA (web `.btn-glass-gold`).
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun GoldButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: (@Composable () -> Unit)? = null,
) {
    val interaction = remember { MutableInteractionSource() }
    val scale = pressScale(interaction)
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(Brush.linearGradient(listOf(Gold600, Gold500)))
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clickable(
                indication = androidx.compose.material3.ripple(color = Navy1000.copy(alpha = 0.25f)),
                interactionSource = interaction,
                onClick = onClick,
            )
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        icon?.invoke()
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            color = Navy1000,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
        )
    }
}

// ────────────────────────────────────────────────────────────────────────────
// GoldText — gradient gold headline (web `.gradient-text-gold`).
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun GoldText(
    text: String,
    modifier: Modifier = Modifier,
    style: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.headlineLarge,
    align: TextAlign = TextAlign.Start,
) {
    val brush = Brush.linearGradient(
        colors = if (useDark())
            listOf(Gold400, Gold600, Gold700)
        else
            listOf(Gold700, Gold600, Gold500),
    )
    Text(
        text = text,
        modifier = modifier,
        style = style.copy(brush = brush),
        textAlign = align,
    )
}

// ────────────────────────────────────────────────────────────────────────────
// SectionTitle — small eyebrow + heading.
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun SectionTitle(
    eyebrow: String,
    title: String,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) {
    Column(modifier.fillMaxWidth()) {
        GlassPill(text = eyebrow, tint = if (useDark()) Gold500 else Olive600)
        Spacer(Modifier.height(10.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.weight(1f),
            )
            trailing?.invoke()
        }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// StatCell — one metric in the stats strip.
// ────────────────────────────────────────────────────────────────────────────
@Composable
fun StatCell(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
    valueTint: Color = Gold500,
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            color = valueTint,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Black,
        )
        Spacer(Modifier.height(2.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}