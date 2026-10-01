package com.faujiniwas.app.ui.screens

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import coil.compose.AsyncImage
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.components.fallbackImage
import com.faujiniwas.app.ui.glass.GlassCard
import com.faujiniwas.app.ui.glass.GlassPill
import com.faujiniwas.app.ui.glass.GoldButton
import com.faujiniwas.app.ui.theme.Gold400
import com.faujiniwas.app.ui.theme.Gold500
import com.faujiniwas.app.ui.theme.Navy1000
import com.faujiniwas.app.ui.theme.Navy950
import com.faujiniwas.app.ui.theme.Teal
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

data class StationCoord(
    val name: String,
    val lat: Double,
    val lng: Double,
    val description: String,
)

val CANTONMENT_STATIONS = listOf(
    StationCoord("Pune Cantt", 18.5089, 73.8797, "Southern Command HQ · Kirkee · NDA"),
    StationCoord("Delhi Cantt", 28.5961, 77.1587, "Western Air Command · Base Hospital · Shankar Vihar"),
    StationCoord("Ambala Cantt", 30.3411, 76.8378, "2 Corps Strike Corps · Air Force Station"),
    StationCoord("Secunderabad", 17.4399, 78.4983, "Bolarum · Trimulgherry · AOC Centre"),
    StationCoord("Bengaluru Cantt", 12.9716, 77.5946, "ASC Centre · MEG & Centre · Yelahanka"),
    StationCoord("Dehradun Cantt", 30.3165, 78.0322, "IMA · Clement Town · Garhwal Rifles"),
    StationCoord("Lucknow Cantt", 26.8467, 80.9462, "Central Command HQ · AMC Centre · Dilkusha"),
    StationCoord("Chandimandir", 30.7333, 76.7794, "Western Command HQ · Sector 34"),
    StationCoord("Bhopal Cantt", 23.2599, 77.4126, "21 Corps Sudarshan Chakra · 3 SSB Board"),
)

data class MilFacility(
    val type: String,
    val name: String,
    val lat: Double,
    val lng: Double,
    val station: String,
)

val MILITARY_FACILITIES = listOf(
    MilFacility("CSD", "Golden Palm CSD Depot", 18.5120, 73.8830, "Pune Cantt"),
    MilFacility("MH", "Command Hospital (SC)", 18.4980, 73.8820, "Pune Cantt"),
    MilFacility("APS", "Army Public School Kirkee", 18.5630, 73.8420, "Pune Cantt"),
    MilFacility("CSD", "Delhi Cantt Central URC", 28.5920, 77.1520, "Delhi Cantt"),
    MilFacility("MH", "Base Hospital Delhi Cantt", 28.5990, 77.1480, "Delhi Cantt"),
    MilFacility("APS", "Army Public School Dhaula Kuan", 28.5880, 77.1620, "Delhi Cantt"),
    MilFacility("CSD", "Kharga CSD Canteen", 30.3390, 76.8320, "Ambala Cantt"),
    MilFacility("MH", "Military Hospital Ambala", 30.3450, 76.8420, "Ambala Cantt"),
    MilFacility("APS", "Army Public School Ambala", 30.3420, 76.8390, "Ambala Cantt"),
    MilFacility("CSD", "Bolarum Area CSD Canteen", 17.5120, 78.5130, "Secunderabad"),
    MilFacility("MH", "Military Hospital Secunderabad", 17.4890, 78.5020, "Secunderabad"),
    MilFacility("APS", "Army Public School Bolarum", 17.5090, 78.5080, "Secunderabad"),
)

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MapScreen(
    listings: List<Listing>,
    onOpenListing: (String) -> Unit,
) {
    var selectedStation by remember { mutableStateOf(CANTONMENT_STATIONS[0]) }
    var selectedLayer by remember { mutableStateOf("All") } // "All", "Homes", "Marketplace", "Facilities"
    var selectedListing by remember { mutableStateOf<Listing?>(null) }
    var selectedFacility by remember { mutableStateOf<MilFacility?>(null) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var isMapLoading by remember { mutableStateOf(true) }

    val displayListings = listings.ifEmpty { Listing.SAMPLE_LISTINGS }

    Box(modifier = Modifier.fillMaxSize()) {
        // ── Map Container ──
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    webViewRef = this
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.cacheMode = WebSettings.LOAD_DEFAULT
                    settings.allowFileAccess = true
                    settings.allowContentAccess = true
                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    settings.userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 FaujiNiwas/1.0"
                    setBackgroundColor(0xFF060A14.toInt())

                    class MapBridge {
                        @JavascriptInterface
                        fun onListingClick(id: String) {
                            val item = displayListings.find { it.id == id }
                            selectedListing = item
                            selectedFacility = null
                        }

                        @JavascriptInterface
                        fun onFacilityClick(name: String, type: String) {
                            val fac = MILITARY_FACILITIES.find { it.name == name }
                            selectedFacility = fac
                            selectedListing = null
                        }

                        @JavascriptInterface
                        fun onMapReady() {
                            isMapLoading = false
                        }
                    }

                    addJavascriptInterface(MapBridge(), "AndroidMap")

                    webChromeClient = object : android.webkit.WebChromeClient() {
                        override fun onConsoleMessage(msg: android.webkit.ConsoleMessage?): Boolean {
                            android.util.Log.d("TacticalMap", "${msg?.message()} [line ${msg?.lineNumber()}]")
                            return true
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            view?.postDelayed({ isMapLoading = false }, 800)
                        }
                        override fun onReceivedError(
                            view: WebView?,
                            request: android.webkit.WebResourceRequest?,
                            error: android.webkit.WebResourceError?
                        ) {
                            android.util.Log.e("TacticalMap", "Error: ${error?.description}")
                        }
                    }

                    val html = buildTacticalMapHtml(displayListings, selectedStation)
                    loadDataWithBaseURL("https://tactical-map.faujiniwas.local", html, "text/html", "UTF-8", null)
                }
            },
            update = { wv ->
                // Trigger flyTo via JS when station changes
                val script = "if (window.flyToStation) { window.flyToStation(${selectedStation.lat}, ${selectedStation.lng}, '${selectedStation.name}'); }"
                wv.evaluateJavascript(script, null)
            }
        )

        // ── Top Tactical Control Bar ──
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp)
        ) {
            // Station Selector Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CANTONMENT_STATIONS.forEach { station ->
                    val isSelected = selectedStation.name == station.name
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(18.dp))
                            .background(
                                if (isSelected) Gold500 else Navy950.copy(alpha = 0.85f)
                            )
                            .clickable {
                                selectedStation = station
                                selectedListing = null
                                selectedFacility = null
                                webViewRef?.evaluateJavascript(
                                    "if (window.flyToStation) { window.flyToStation(${station.lat}, ${station.lng}, '${station.name}'); }",
                                    null
                                )
                            }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                Icons.Filled.Place,
                                contentDescription = null,
                                tint = if (isSelected) Navy1000 else Gold500,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = station.name,
                                style = MaterialTheme.typography.labelLarge,
                                color = if (isSelected) Navy1000 else Color.White,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Layer Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf("All", "Homes", "Marketplace", "CSD & Hospitals").forEach { layer ->
                    val isSelected = selectedLayer == layer
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                if (isSelected) Teal else Navy950.copy(alpha = 0.75f)
                            )
                            .clickable {
                                selectedLayer = layer
                                webViewRef?.evaluateJavascript(
                                    "if (window.filterLayers) { window.filterLayers('$layer'); }",
                                    null
                                )
                            }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = layer,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isSelected) Navy1000 else Color.White.copy(alpha = 0.85f),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        // ── Loading indicator ──
        if (isMapLoading) {
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Navy950.copy(alpha = 0.85f))
                    .padding(20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Gold500, modifier = Modifier.size(32.dp))
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text = "Loading Tactical Military Map…",
                        style = MaterialTheme.typography.labelMedium,
                        color = Gold400
                    )
                }
            }
        }

        // ── Floating Selected Listing Preview Card ──
        AnimatedVisibility(
            visible = selectedListing != null,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            selectedListing?.let { item ->
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(26.dp),
                    padding = 14.dp
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Navy950)
                        ) {
                            AsyncImage(
                                model = item.images.firstOrNull() ?: fallbackImage,
                                contentDescription = item.displayName,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                GlassPill(
                                    text = if (item.isMarketplace) "Marketplace" else if (item.verified) "Verified" else "Defence Home",
                                    tint = if (item.isMarketplace) Teal else Gold500
                                )
                                Spacer(Modifier.weight(1f))
                                Icon(
                                    Icons.Filled.Close,
                                    contentDescription = "Close",
                                    tint = Color.White.copy(alpha = 0.7f),
                                    modifier = Modifier
                                        .size(20.dp)
                                        .clickable { selectedListing = null }
                                )
                            }
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = item.displayName,
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "${item.area} · ${item.city}",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = item.displayPrice,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = Gold400,
                                    fontWeight = FontWeight.Black
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Gold500)
                                        .clickable { onOpenListing(item.id) }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Text(
                                            text = "View Details",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = Navy1000,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Icon(
                                            Icons.AutoMirrored.Filled.ArrowForward,
                                            contentDescription = null,
                                            tint = Navy1000,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // ── Floating Facility Card ──
        AnimatedVisibility(
            visible = selectedFacility != null,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            selectedFacility?.let { fac ->
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(26.dp),
                    padding = 14.dp
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(if (fac.type == "CSD") Gold500.copy(alpha = 0.2f) else Teal.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (fac.type == "CSD") "🏪" else if (fac.type == "MH") "🏥" else "🏫",
                                style = MaterialTheme.typography.headlineMedium
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = fac.name,
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Military Installation · ${fac.station}",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(
                            Icons.Filled.Close,
                            contentDescription = "Close",
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier
                                .size(20.dp)
                                .clickable { selectedFacility = null }
                        )
                    }
                }
            }
        }
    }
}

private fun buildTacticalMapHtml(listings: List<Listing>, initialStation: StationCoord): String {
    val listingsArray = JSONArray()
    listings.forEach { l ->
        val obj = JSONObject().apply {
            put("id", l.id)
            put("name", l.displayName)
            put("price", l.displayPrice)
            put("lat", if (l.lat != 0.0 && l.lat != 22.5) l.lat else initialStation.lat + (Math.random() - 0.5) * 0.04)
            put("lng", if (l.lng != 0.0 && l.lng != 82.0) l.lng else initialStation.lng + (Math.random() - 0.5) * 0.04)
            put("type", l.type)
            put("isMarket", l.isMarketplace)
            put("verified", l.verified)
            put("city", l.city)
        }
        listingsArray.put(obj)
    }

    val facilitiesArray = JSONArray()
    MILITARY_FACILITIES.forEach { f ->
        val obj = JSONObject().apply {
            put("name", f.name)
            put("type", f.type)
            put("lat", f.lat)
            put("lng", f.lng)
            put("station", f.station)
        }
        facilitiesArray.put(obj)
    }

    return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <!-- Leaflet CSS via Cloudflare CDN with unpkg fallback -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
    <!-- Leaflet JS via Cloudflare CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
    <script>
        if (typeof L === 'undefined') {
            document.write('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />');
            document.write('<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>');
        }
    </script>
    <style>
        html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #060a14;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .leaflet-container {
            background: #060a14 !important;
        }
        /* Custom Price Marker Chip */
        .price-chip {
            background: rgba(15, 23, 42, 0.92);
            border: 1.5px solid #f59e0b;
            color: #fbbf24;
            font-weight: 800;
            font-size: 11px;
            padding: 3px 7px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            white-space: nowrap;
            text-align: center;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: transform 0.2s;
        }
        .price-chip.market {
            border-color: #14b8a6;
            color: #2dd4bf;
        }
        .price-chip:hover, .price-chip:active {
            transform: translate(-50%, -50%) scale(1.15);
            background: #f59e0b;
            color: #060a14;
        }
        /* Facility Marker */
        .facility-marker {
            background: #0f172a;
            border: 1.5px solid #14b8a6;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 0 10px rgba(20, 184, 166, 0.4);
            transform: translate(-50%, -50%);
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var listings = $listingsArray;
        var facilities = $facilitiesArray;
        var map = null;
        var listingLayer = null;
        var facilityLayer = null;
        var perimeterLayer = null;

        function drawPerimeter(lat, lng, name) {
            if (!perimeterLayer) return;
            perimeterLayer.clearLayers();
            // 3km inner gate circle
            L.circle([lat, lng], {
                radius: 3000,
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: '5, 8'
            }).addTo(perimeterLayer);

            // 5km cantonment boundary
            L.circle([lat, lng], {
                radius: 5000,
                color: '#14b8a6',
                fillColor: '#14b8a6',
                fillOpacity: 0.02,
                weight: 1,
                dashArray: '8, 12'
            }).addTo(perimeterLayer);

            // Gate marker
            var gateIcon = L.divIcon({
                className: '',
                html: '<div style="background:#f59e0b;color:#000;padding:4px 8px;border-radius:8px;font-weight:900;font-size:10px;white-space:nowrap;box-shadow:0 0 14px rgba(245,158,11,0.6);border:1px solid #fff;">🎖️ ' + name + ' HQ</div>',
                iconAnchor: [40, 15]
            });
            L.marker([lat, lng], { icon: gateIcon }).addTo(perimeterLayer);
        }

        function renderPins() {
            if (!listingLayer || !facilityLayer) return;
            listingLayer.clearLayers();
            listings.forEach(function(l) {
                var cls = l.isMarket ? 'price-chip market' : 'price-chip';
                var icon = L.divIcon({
                    className: '',
                    html: '<div class="' + cls + '" onclick="window.onListingSelect(\'' + l.id + '\')">' + l.price + '</div>'
                });
                L.marker([l.lat, l.lng], { icon: icon }).addTo(listingLayer);
            });

            facilityLayer.clearLayers();
            facilities.forEach(function(f) {
                var emoji = f.type === 'CSD' ? '🏪' : f.type === 'MH' ? '🏥' : '🏫';
                var icon = L.divIcon({
                    className: '',
                    html: '<div class="facility-marker" onclick="window.onFacilitySelect(\'' + f.name.replace(/'/g, "\\'") + '\', \'' + f.type + '\')">' + emoji + '</div>'
                });
                L.marker([f.lat, f.lng], { icon: icon }).addTo(facilityLayer);
            });
        }

        window.onListingSelect = function(id) {
            if (window.AndroidMap && window.AndroidMap.onListingClick) {
                window.AndroidMap.onListingClick(id);
            }
        };

        window.onFacilitySelect = function(name, type) {
            if (window.AndroidMap && window.AndroidMap.onFacilityClick) {
                window.AndroidMap.onFacilityClick(name, type);
            }
        };

        window.flyToStation = function(lat, lng, name) {
            if (map) {
                map.flyTo([lat, lng], 13, { duration: 1.2 });
                drawPerimeter(lat, lng, name);
            }
        };

        window.filterLayers = function(layer) {
            if (!map || !listingLayer || !facilityLayer) return;
            if (layer === 'All') {
                map.addLayer(listingLayer);
                map.addLayer(facilityLayer);
            } else if (layer === 'Homes') {
                map.addLayer(listingLayer);
                map.removeLayer(facilityLayer);
            } else if (layer === 'Marketplace') {
                map.addLayer(listingLayer);
                map.removeLayer(facilityLayer);
            } else if (layer === 'CSD & Hospitals') {
                map.removeLayer(listingLayer);
                map.addLayer(facilityLayer);
            }
        };

        function initMap() {
            if (typeof L === 'undefined') {
                setTimeout(initMap, 50);
                return;
            }

            try {
                map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([${initialStation.lat}, ${initialStation.lng}], 13);

                // High-performance tactical dark tiles via CartoDB
                var primaryTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19,
                    subdomains: 'abcd'
                }).addTo(map);

                // Safe fallback to Google tiles if CartoDB experiences network errors
                primaryTiles.on('tileerror', function() {
                    if (!window._switchedTiles) {
                        window._switchedTiles = true;
                        map.removeLayer(primaryTiles);
                        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                            maxZoom: 19
                        }).addTo(map);
                    }
                });

                listingLayer = L.layerGroup().addTo(map);
                facilityLayer = L.layerGroup().addTo(map);
                perimeterLayer = L.layerGroup().addTo(map);

                drawPerimeter(${initialStation.lat}, ${initialStation.lng}, '${initialStation.name}');
                renderPins();

                setTimeout(function() {
                    try { map.invalidateSize(); } catch(e) {}
                }, 300);

                if (window.AndroidMap && window.AndroidMap.onMapReady) {
                    window.AndroidMap.onMapReady();
                }
            } catch (err) {
                console.error("Map init error:", err);
                if (window.AndroidMap && window.AndroidMap.onMapReady) {
                    window.AndroidMap.onMapReady();
                }
            }
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            initMap();
        } else {
            window.addEventListener('DOMContentLoaded', initMap);
        }
    </script>
</body>
</html>
    """.trimIndent()
}
