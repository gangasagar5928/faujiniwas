package com.faujiniwas.app.ui.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navOptions
import com.faujiniwas.app.data.Listing
import com.faujiniwas.app.ui.screens.AiHelperScreen
import com.faujiniwas.app.ui.screens.HraScreen
import com.faujiniwas.app.ui.screens.ListingDetailScreen
import com.faujiniwas.app.ui.screens.ListingsScreen
import com.faujiniwas.app.ui.screens.HomeScreen
import com.faujiniwas.app.ui.screens.MapScreen
import com.faujiniwas.app.ui.screens.SettingsScreen
import com.faujiniwas.app.ui.screens.SsbDormsScreen
import com.faujiniwas.app.ui.screens.StationsScreen

import com.faujiniwas.app.data.FirestoreRepository
import com.faujiniwas.app.ui.screens.PostListingScreen

@Composable
fun FaujiNiwasAppRoot(
    repository: FirestoreRepository,
    listings: List<Listing>,
    feedConnected: Boolean,
    darkOverride: Boolean,
    onToggleDark: (Boolean) -> Unit,
) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color.Transparent,
        bottomBar = {
            if (currentRoute in topLevelRoutes) {
                GlassBottomBar(
                    currentRoute = currentRoute,
                    onNavigate = { route -> navController.navigateSingleTop(route) },
                )
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Destination.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            composable(Destination.Home.route) {
                HomeScreen(
                    listings = listings,
                    onNavigate = { route ->
                        if (route in topLevelRoutes) navController.navigateSingleTop(route)
                        else navController.navigate(route)
                    },
                    onOpenListing = { id -> navController.navigate("listing/$id") },
                )
            }
            composable(Destination.Listings.route) {
                ListingsScreen(
                    listings = listings,
                    onOpenListing = { id -> navController.navigate("listing/$id") },
                    onPostListing = { navController.navigate("post") },
                )
            }
            composable(Destination.Map.route) {
                MapScreen(
                    listings = listings,
                    onOpenListing = { id -> navController.navigate("listing/$id") },
                )
            }
            composable(Destination.Stations.route) {
                StationsScreen(
                    onOpenStation = { navController.navigateSingleTop(Destination.Listings.route) },
                )
            }
            composable("hra") {
                HraScreen()
            }
            composable(Destination.Settings.route) {
                SettingsScreen(
                    darkOverride = darkOverride,
                    onToggleDark = onToggleDark,
                    feedConnected = feedConnected,
                    onNavigate = { route ->
                        if (route in topLevelRoutes) navController.navigateSingleTop(route)
                        else navController.navigate(route)
                    },
                )
            }
            composable("post") {
                PostListingScreen(
                    repository = repository,
                    onBack = { navController.popBackStack() },
                    onListingPosted = {
                        navController.navigateSingleTop(Destination.Listings.route)
                    },
                )
            }
            composable("ai_helper") {
                AiHelperScreen(
                    onBack = { navController.popBackStack() },
                )
            }
            composable("ssb_dorms") {
                SsbDormsScreen(
                    onBack = { navController.popBackStack() },
                )
            }
            composable(
                route = "listing/{listingId}",
                arguments = listOf(navArgument("listingId") { type = NavType.StringType }),
            ) { entry ->
                val id = entry.arguments?.getString("listingId")
                val listing = listings.firstOrNull { it.id == id }
                ListingDetailScreen(
                    listing = listing,
                    onBack = { navController.popBackStack() },
                )
            }
        }
    }
}

private fun NavHostController.navigateSingleTop(route: String) {
    navigate(
        route = route,
        navOptions = navOptions {
            popUpTo(graph.findStartDestination().id) {
                saveState = true
            }
            launchSingleTop = true
            restoreState = true
        },
    )
}