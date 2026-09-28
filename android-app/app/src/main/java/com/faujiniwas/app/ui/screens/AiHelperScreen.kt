package com.faujiniwas.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.SectionTitle
import com.faujiniwas.app.ui.navigation.GlassBackTopBar
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Teal
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
)

private val QUICK_PROMPTS = listOf(
    "📊 7th CPC HRA Rates" to "What are the latest 7th CPC HRA rates for X, Y, and Z class military stations?",
    "📦 Transfer Packing Checklist" to "What is the packing and luggage allowance for defence posting transfer?",
    "🏫 APS Admission Priorities" to "What are the priority categories for Army Public School (APS) admission during posting?",
    "🏥 ECHS & Military Hospitals" to "How to transfer ECHS polyclinic card and get referral for family members?",
    "🎖️ CSD Smart Card in Transit" to "Can I use my CSD canteen grocery and liquor card during transit between stations?",
    "🛂 Cantonment Pass & NAC" to "What is the process for Non-Availability Certificate (NAC) and Out-Living permission?",
)

@Composable
fun AiHelperScreen(
    onBack: () -> Unit,
) {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var inputText by remember { mutableStateOf("") }

    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                id = "m1",
                text = "Jai Hind! 🇮🇳 I am Fauji Sahayak, your dedicated defence housing and relocation assistant. How can I assist you with your posting, cantonment quarters, HRA rates, or military transit today?",
                isUser = false,
            )
        )
    }

    LaunchedEffect(messages.size) {
        if (messages.size > 1) {
            listState.animateScrollToItem(messages.size)
        }
    }

    fun sendMessage(text: String) {
        val q = text.trim()
        if (q.isBlank()) return
        messages.add(ChatMessage(id = "u_${System.currentTimeMillis()}", text = q, isUser = true))
        inputText = ""

        scope.launch {
            val responseText = generateMilitaryResponse(q)
            messages.add(ChatMessage(id = "a_${System.currentTimeMillis()}", text = responseText, isUser = false))
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 14.dp),
    ) {
        GlassBackTopBar(
            title = "Fauji Sahayak AI",
            onBack = onBack,
            trailing = {
                GlassPill(text = "Online 24/7", tint = Teal)
            }
        )

        Spacer(Modifier.height(8.dp))

        // Message list
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            state = listState,
            contentPadding = PaddingValues(vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                GlassCard {
                    SectionTitle(
                        eyebrow = "Defence Advisory Intelligence",
                        title = "Fauji Housing Assistant",
                        trailing = {
                            Icon(Icons.Filled.SmartToy, contentDescription = null, tint = Gold500, modifier = Modifier.size(24.dp))
                        }
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Instant advice on 7th CPC HRA, Composite Transfer Grant (CTG), APS school admissions, Non-Availability Certificates (NAC), and cantonment housing rules.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // Quick Prompt Chips
            item {
                Text(
                    text = "Suggested Questions:",
                    style = MaterialTheme.typography.labelMedium,
                    color = Gold500,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                )
                Spacer(Modifier.height(4.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(QUICK_PROMPTS) { (label, fullQuery) ->
                        Box(
                            Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
                                .clickable { sendMessage(fullQuery) }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }
            }

            items(messages, key = { it.id }) { msg ->
                ChatBubble(message = msg)
            }
        }

        // Input bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Ask about HRA, postings, quarters, schools…") },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { sendMessage(inputText) }),
                shape = RoundedCornerShape(22.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold500,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                    cursorColor = Gold500,
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f),
                ),
                modifier = Modifier.weight(1f),
            )

            IconButton(
                onClick = { sendMessage(inputText) },
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Gold500)
                    .size(50.dp),
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.Send,
                    contentDescription = "Send",
                    tint = Navy1000,
                    modifier = Modifier.size(22.dp),
                )
            }
        }
    }
}

@Composable
private fun ChatBubble(message: ChatMessage) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = if (message.isUser) Alignment.CenterEnd else Alignment.CenterStart,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(if (message.isUser) 0.82f else 0.92f)
                .clip(
                    RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (message.isUser) 18.dp else 4.dp,
                        bottomEnd = if (message.isUser) 4.dp else 18.dp,
                    )
                )
                .background(
                    if (message.isUser) Gold500.copy(alpha = 0.22f)
                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.60f)
                )
                .padding(horizontal = 14.dp, vertical = 12.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = if (message.isUser) "You" else "Fauji Sahayak 🎖️",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (message.isUser) Gold500 else Teal,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = MaterialTheme.typography.bodyMedium.lineHeight,
                )
            }
        }
    }
}

private fun generateMilitaryResponse(query: String): String {
    val q = query.lowercase()
    return when {
        q.contains("hra") || q.contains("rate") || q.contains("7th cpc") ->
            """📋 7th Pay Commission HRA Norms:
• X-Class Cities (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad): 30% of Basic Pay (min ₹5,400).
• Y-Class Cities (Ambala, Dehradun, Lucknow, Meerut, Jaipur, Jodhpur, Bhopal, Kochi, etc.): 20% of Basic Pay (min ₹3,600).
• Z-Class Stations (All other military stations & border areas): 10% of Basic Pay (min ₹1,800).
Tip: Once DA crosses 50%, HRA rates automatically revise to 30%, 20%, and 10% as per MoD directives."""

        q.contains("pack") || q.contains("luggage") || q.contains("transfer") || q.contains("ctg") ->
            """📦 Posting Transfer Allowances:
1. Composite Transfer Grant (CTG): 80% of last month's Basic Pay for transfers over 20 km.
2. Luggage Scale by Train/Road (Vth/VIth/VIIth CPC):
   • Officers: Up to 60 quintals (6,000 kg) by goods train or equivalent road transport reimbursement.
   • JCOs (Sub Maj, Sub, Nb Sub): Up to 30 quintals (3,000 kg).
   • OR (Hav, Nk, Sep): Up to 15 quintals (1,500 kg).
3. Motor Car / Two-Wheeler: One 4-wheeler conveyance allowed for officers; 2-wheeler for JCOs/OR."""

        q.contains("aps") || q.contains("school") || q.contains("admission") ->
            """🏫 Army Public School (APS) Admission Priorities:
• Priority 1: Children of serving Army personnel (including DSC and TA personnel).
• Priority 2: Children of Army widows and Ex-servicemen.
• Priority 3: Children of serving Air Force & Naval personnel.
• Priority 4: Children of retired Air Force and Naval personnel.
• Priority 5: Children of civilians paid out of Defence Estimates & MES.
Note: TC issued by an APS guarantees direct transfer without entrance test at the new station!"""

        q.contains("echs") || q.contains("hospital") || q.contains("medical") ->
            """🏥 Military Hospital & ECHS Guidelines:
• Serving: Direct access to Command Hospital and Station Military Hospital (MH) with identity card.
• Veterans/ECHS: Update your parent polyclinic online on the ECHS portal (echs.sourcepro.in) upon shifting residence.
• Outstation Emergency: Treatment at any empaneled hospital without prior referral under emergency clause."""

        q.contains("csd") || q.contains("canteen") || q.contains("liquor") ->
            """🎖️ CSD Smart Card in Transit:
• CSD Grocery Card works seamlessly across all Station Canteens and URCs pan-India.
• For liquor quota transfer, get your card mapped to the new station's Unit Run Canteen (URC) by submitting your Movement Order copy at the manager's office."""

        q.contains("nac") || q.contains("out-living") || q.contains("permission") || q.contains("pass") ->
            """🛂 Non-Availability Certificate (NAC) & Out-Living:
1. Apply to Station HQ / BSO for Married Accommodation.
2. If waiting period exceeds prescribed limits, BSO issues an official NAC.
3. Submit NAC to your unit admin/adjutant to claim Out-Living allowance and HRA.
4. Fauji Niwas properties are verified to be within authorized cantonment radius for zero-disallowance claims."""

        else ->
            """Jai Hind! Regarding your query about "$query":
In defence service postings, always secure your NAC (Non-Availability Certificate) from the local Station HQ/BSO before finalizing private accommodation. 

On Fauji Niwas, all properties are curated close to cantonment gates (within 0.5 to 5 km) with verified defence owners and zero brokerage. Would you like assistance calculating your specific HRA for this station?"""
    }
}
