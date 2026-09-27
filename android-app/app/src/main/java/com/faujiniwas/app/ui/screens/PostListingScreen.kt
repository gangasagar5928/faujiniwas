package com.faujiniwas.app.ui.screens

import android.widget.Toast
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddHome
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.data.FirestoreRepository
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.navigation.GlassBackTopBar
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Teal
import kotlinx.coroutines.launch

private val TOP_CITIES = listOf(
    "Pune", "New Delhi", "Ambala", "Secunderabad", "Bengaluru",
    "Dehradun", "Lucknow", "Chandigarh", "Meerut", "Jaipur", "Jodhpur", "Kolkata"
)

private val PROPERTY_TYPES = listOf("Flat", "Independent House", "Villa", "PG/Room")
private val BHK_OPTIONS = listOf("1", "2", "3", "4+")
private val FURNISHING_OPTIONS = listOf("Semi", "Fully", "Unfurnished")
private val OWNER_TYPES = listOf("defence", "civilian")

private val MARKET_CATEGORIES = listOf("Furniture", "Electronics", "Vehicles", "Appliances", "Uniform & Gear", "Household")
private val MARKET_CONDITIONS = listOf("Like New", "Gently Used", "Good Condition", "Fair")

@Composable
fun PostListingScreen(
    repository: FirestoreRepository,
    onBack: () -> Unit,
    onListingPosted: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var collection by remember { mutableStateOf("rentals") } // rentals or marketplace
    var name by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var area by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("Flat") }
    var selectedBhk by remember { mutableStateOf("2") }
    var selectedFurnishing by remember { mutableStateOf("Semi") }
    var marketCategory by remember { mutableStateOf("Furniture") }
    var marketCondition by remember { mutableStateOf("Like New") }
    var isNegotiable by remember { mutableStateOf(true) }
    var ownerType by remember { mutableStateOf("defence") }
    var phone by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    var isSubmitting by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            GlassBackTopBar(
                title = if (collection == "marketplace") "Post Marketplace Item" else "Post Rental Property",
                onBack = onBack,
            )
        }

        item {
            GlassCard {
                SectionTitle(
                    eyebrow = if (collection == "marketplace") "Defence Transfer Sale" else "Defence Housing Network",
                    title = if (collection == "marketplace") "Sell Household & Goods" else "List Your Property",
                    trailing = {
                        GlassPill(text = "Zero Brokerage", tint = Teal)
                    },
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = if (collection == "marketplace")
                        "Handover household goods, electronics, furniture, or vehicles directly to incoming defence families during station transfer."
                    else
                        "Broadcast your cantonment accommodation directly to serving officers, veterans, and verified defence families across India.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // Section: Category
        item {
            GlassCard {
                Text(
                    text = "Listing Type",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Gold500,
                )
                Spacer(Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    ChoiceChip(
                        label = "🏡 Rental Housing",
                        selected = collection == "rentals",
                        onClick = { collection = "rentals" },
                        modifier = Modifier.weight(1f),
                    )
                    ChoiceChip(
                        label = "📦 Marketplace",
                        selected = collection == "marketplace",
                        onClick = { collection = "marketplace" },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }

        // Section: Details
        item {
            GlassCard {
                Text(
                    text = if (collection == "marketplace") "Item Details" else "Property Information",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Gold500,
                )
                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = if (collection == "marketplace") "Item Title / Product Name *" else "Listing Title / Name *",
                    placeholder = if (collection == "marketplace") "e.g. Solid Teak Wood Dining Table 6-Seater" else "e.g. Spacious 2BHK Near Cantonment Gate 3",
                    leadingIcon = Icons.Filled.Apartment,
                )

                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = "Cantonment Station / City *",
                    placeholder = "e.g. Pune, Delhi Cantt, Ambala",
                    leadingIcon = Icons.Filled.Place,
                )

                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Quick select city:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(6.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(TOP_CITIES) { c ->
                        Box(
                            Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    if (city == c) Gold500.copy(alpha = 0.25f)
                                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                                )
                                .clickable { city = c }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = c,
                                style = MaterialTheme.typography.labelMedium,
                                color = if (city == c) Gold500 else MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = area,
                    onValueChange = { area = it },
                    label = "Locality / Military Enclave / Sector *",
                    placeholder = "e.g. Kirkee, Sadar Bazar, Command Hospital Road",
                    leadingIcon = Icons.Filled.Place,
                )

                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = price,
                    onValueChange = { if (it.all { ch -> ch.isDigit() }) price = it },
                    label = if (collection == "marketplace") "Selling Price (₹) *" else "Monthly Rent (₹) *",
                    placeholder = if (collection == "marketplace") "e.g. 7500" else "e.g. 14000",
                    leadingIcon = Icons.Filled.AttachMoney,
                    keyboardType = KeyboardType.Number,
                )
            }
        }

        // Section: Specs & Features
        item {
            GlassCard {
                if (collection == "marketplace") {
                    Text(
                        text = "Marketplace Category & Condition",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Gold500,
                    )
                    Spacer(Modifier.height(10.dp))

                    Text("Item Category", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(MARKET_CATEGORIES) { cat ->
                            ChoiceChip(
                                label = cat,
                                selected = marketCategory == cat,
                                onClick = { marketCategory = cat },
                                modifier = Modifier,
                            )
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    Text("Item Condition", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(MARKET_CONDITIONS) { cond ->
                            ChoiceChip(
                                label = cond,
                                selected = marketCondition == cond,
                                onClick = { marketCondition = cond },
                                modifier = Modifier,
                            )
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    Text("Price Flexibility", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        ChoiceChip(
                            label = "Negotiable",
                            selected = isNegotiable,
                            onClick = { isNegotiable = true },
                            modifier = Modifier.weight(1f),
                        )
                        ChoiceChip(
                            label = "Fixed Price",
                            selected = !isNegotiable,
                            onClick = { isNegotiable = false },
                            modifier = Modifier.weight(1f),
                        )
                    }
                } else {
                    Text(
                        text = "Specifications",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Gold500,
                    )
                    Spacer(Modifier.height(10.dp))

                    Text("Property Type", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        PROPERTY_TYPES.forEach { t ->
                            ChoiceChip(
                                label = t,
                                selected = selectedType == t,
                                onClick = { selectedType = t },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    Text("Configuration (BHK)", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        BHK_OPTIONS.forEach { b ->
                            ChoiceChip(
                                label = "$b BHK",
                                selected = selectedBhk == b,
                                onClick = { selectedBhk = b },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    Text("Furnishing", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        FURNISHING_OPTIONS.forEach { f ->
                            ChoiceChip(
                                label = f,
                                selected = selectedFurnishing == f,
                                onClick = { selectedFurnishing = f },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                }
            }
        }

        // Section: Owner & Contact
        item {
            GlassCard {
                Text(
                    text = "Owner & Defence Verification",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Gold500,
                )
                Spacer(Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    ChoiceChip(
                        label = "🎖️ Defence Owner",
                        selected = ownerType == "defence",
                        onClick = { ownerType = "defence" },
                        modifier = Modifier.weight(1f),
                    )
                    ChoiceChip(
                        label = "👤 Civilian Landlord",
                        selected = ownerType == "civilian",
                        onClick = { ownerType = "civilian" },
                        modifier = Modifier.weight(1f),
                    )
                }

                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = phone,
                    onValueChange = { if (it.length <= 10 && it.all { ch -> ch.isDigit() }) phone = it },
                    label = "Contact Mobile Number *",
                    placeholder = "10-digit mobile number",
                    leadingIcon = Icons.Filled.Phone,
                    keyboardType = KeyboardType.Phone,
                )

                Spacer(Modifier.height(12.dp))

                CustomTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "Description / Amenities (Optional)",
                    placeholder = "e.g. Near Army Public School, 24h water, gated society...",
                    leadingIcon = Icons.Filled.Description,
                    singleLine = false,
                    maxLines = 4,
                )
            }
        }

        // Submit Button
        item {
            if (isSubmitting) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = Gold500)
                }
            } else {
                GoldButton(
                    text = "Publish to Defence Network 🚀",
                    icon = {
                        Icon(
                            Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = Navy1000,
                            modifier = Modifier.size(18.dp),
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        if (name.isBlank() || city.isBlank() || price.isBlank() || phone.length < 10) {
                            Toast.makeText(context, "Please fill required fields (Title, City, Price, Phone)", Toast.LENGTH_SHORT).show()
                            return@GoldButton
                        }

                        isSubmitting = true
                        scope.launch {
                            val isMarket = collection == "marketplace"
                            val listing = Listing(
                                id = "mob_${System.currentTimeMillis()}",
                                collection = collection,
                                name = name.trim(),
                                title = name.trim(),
                                city = city.trim(),
                                area = area.trim(),
                                price = price.toDoubleOrNull() ?: 0.0,
                                type = if (isMarket) marketCategory else selectedType,
                                bhk = if (isMarket) 0 else (selectedBhk.filter { it.isDigit() }.toIntOrNull() ?: 2),
                                furnishing = if (isMarket) "" else selectedFurnishing,
                                ownerType = ownerType,
                                contact = "+91$phone",
                                description = description.trim(),
                                verified = false,
                                distance = if (isMarket) "Inside Cantonment" else "0.5 km from Cantonment",
                                createdAt = System.currentTimeMillis(),
                                images = listOf(
                                    if (isMarket) "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
                                    else "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"
                                ),
                                category = if (isMarket) marketCategory else "",
                                condition = if (isMarket) marketCondition else "",
                                negotiable = isNegotiable,
                            )

                            val res = repository.postListing(listing)
                            isSubmitting = false
                            if (res.isSuccess) {
                                Toast.makeText(context, "🎉 Listing published to Fauji Niwas!", Toast.LENGTH_LONG).show()
                                onListingPosted()
                            } else {
                                Toast.makeText(context, "Failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                            }
                        }
                    },
                )
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    leadingIcon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
    maxLines: Int = 1,
) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, style = MaterialTheme.typography.bodyMedium) },
            leadingIcon = {
                Icon(leadingIcon, contentDescription = null, tint = Gold500, modifier = Modifier.size(20.dp))
            },
            singleLine = singleLine,
            maxLines = maxLines,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            shape = RoundedCornerShape(16.dp),
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
}

@Composable
private fun ChoiceChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(
                if (selected) Gold500.copy(alpha = 0.22f)
                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.40f)
            )
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) Gold500 else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
        )
    }
}
