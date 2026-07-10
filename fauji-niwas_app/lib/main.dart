import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'listings_data.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const FaujiNiwasApp());
}

class FaujiNiwasApp extends StatelessWidget {
  const FaujiNiwasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Fauji Niwas',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF0B1325),
        primaryColor: const Color(0xFFFF9933),
        hintColor: const Color(0xFF7A8FA8),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF9933),
          secondary: Color(0xFFFF9933),
          background: Color(0xFF0B1325),
          surface: Color(0xFF131B2E),
        ),
        fontFamily: 'sans-serif',
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();

    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            transitionDuration: const Duration(milliseconds: 500),
            pageBuilder: (_, __, ___) => const MainDashboardScreen(),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1325),
      body: FadeTransition(
        opacity: _fade,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'assets/logo.png',
                  width: 120,
                  height: 120,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF9933),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Center(
                        child: Text(
                          'FN',
                          style: TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                  ),
                  children: [
                    TextSpan(
                      text: 'Fauji',
                      style: TextStyle(color: Color(0xFFFF9933)), // Saffron
                    ),
                    TextSpan(
                      text: ' Niwas',
                      style: TextStyle(color: Color(0xFFFFFFFF)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Defence Housing — Native Application',
                style: TextStyle(
                  color: Color(0xFF7A8FA8),
                  fontSize: 14,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 48),
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Color(0xFFFF9933),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MainDashboardScreen extends StatefulWidget {
  const MainDashboardScreen({super.key});

  @override
  State<MainDashboardScreen> createState() => _MainDashboardScreenState();
}

class _MainDashboardScreenState extends State<MainDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _activeTabIndex = 0;

  // Search & Filter State
  String _searchQuery = '';
  String _bhkFilter = 'all';
  double _maxPriceFilter = 100000;
  String _ownerTypeFilter = 'all';

  // Dynamic Lists (for post listing simulation)
  late List<RentalListing> _listings;
  late List<SsbDorm> _dorms;
  late List<MarketItem> _marketItems;
  final Map<String, List<bool>> _taskCheckStates = {};

  // Relocation State
  String _relocationRank = 'JCO';
  double _postingDistance = 1000.0;
  double _estimatedWeight = 5000.0;
  double _packersCost = 28000.0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _activeTabIndex = _tabController.index;
      });
    });

    _listings = List.from(rawSeedListings);
    _dorms = List.from(rawSeedDorms);
    _marketItems = List.from(rawSeedMarketItems);

    // Initialize check states for relocation tasks
    seedTasks.forEach((rank, tasks) {
      _taskCheckStates[rank] = List.generate(tasks.length, (_) => false);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Filter listings based on criteria
  List<RentalListing> get _filteredListings {
    return _listings.where((l) {
      final nameMatch = l.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          l.area.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          l.city.toLowerCase().contains(_searchQuery.toLowerCase());
      
      final bhkMatch = _bhkFilter == 'all' || l.type == _bhkFilter;
      final priceMatch = l.price <= _maxPriceFilter;
      
      final ownerMatch = _ownerTypeFilter == 'all' ||
          (_ownerTypeFilter == 'defence' && l.ownerType == 'defence') ||
          (_ownerTypeFilter == 'nobroker' && l.ownerType != 'broker');

      return nameMatch && bhkMatch && priceMatch && ownerMatch;
    }).toList();
  }

  List<MarketItem> get _filteredMarketItems {
    return _marketItems.where((item) {
      return item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.area.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.city.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();
  }

  void _showPostListingModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF131B2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return _PostListingForm(
          onAddListing: (newListing) {
            setState(() {
              _listings.insert(0, newListing);
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🎉 Listing submitted successfully for review!'),
                backgroundColor: Color(0xFF22C55E),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF090D16),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFF9933),
              ),
              child: const Center(
                child: Text('🪖', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Fauji Niwas',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 20,
                color: Colors.white,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: Colors.grey),
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  backgroundColor: const Color(0xFF131B2E),
                  title: const Text('Fauji Niwas Mobile'),
                  content: const Text(
                      'A separate native mobile application built for verified Indian Defence Housing, SSB Dorms & Relocation Logistics.\n\nCreated by Aman Kumar Singh & Anurag Kumar Singh.'),
                  actions: [
                    TextButton(
                      child: const Text('OK', style: TextStyle(color: Color(0xFFFF9933))),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Sub-navigation Tabs
          Container(
            color: const Color(0xFF090D16),
            child: TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFFFF9933),
              labelColor: const Color(0xFFFF9933),
              unselectedLabelColor: Colors.grey,
              tabs: const [
                Tab(icon: Icon(Icons.home_outlined), text: 'Rentals'),
                Tab(icon: Icon(Icons.hotel_outlined), text: 'Dorms'),
                Tab(icon: Icon(Icons.shopping_bag_outlined), text: 'Market'),
                Tab(icon: Icon(Icons.local_shipping_outlined), text: 'Relocation'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildRentalsTab(),
                _buildDormsTab(),
                _buildMarketTab(),
                _buildRelocationTab(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _activeTabIndex < 3
          ? FloatingActionButton(
              backgroundColor: const Color(0xFFFF9933),
              child: const Icon(Icons.add, color: Colors.black),
              onPressed: _showPostListingModal,
            )
          : null,
    );
  }

  // ─── TAB 1: RENTALS VIEW ────────────────────────────────────────────────────
  Widget _buildRentalsTab() {
    return Column(
      children: [
        _buildFiltersBar(),
        Expanded(
          child: _filteredListings.isEmpty
              ? const Center(
                  child: Text(
                    'No listings found matching criteria.',
                    style: TextStyle(color: Colors.grey),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _filteredListings.length,
                  itemBuilder: (context, index) {
                    final l = _filteredListings[index];
                    return _RentalCard(listing: l);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildFiltersBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      color: const Color(0xFF131B2E),
      child: Column(
        children: [
          // Search Box
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search Cantt, City or Area...',
              prefixIcon: const Icon(Icons.search, color: Colors.grey),
              filled: true,
              fillColor: const Color(0xFF090D16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
            ),
          ),
          const SizedBox(height: 8),
          // Filter buttons
          Row(
            children: [
              // BHK Filter
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF090D16),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _bhkFilter,
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All BHK')),
                        DropdownMenuItem(value: '1BHK', child: Text('1 BHK')),
                        DropdownMenuItem(value: '2BHK', child: Text('2 BHK')),
                        DropdownMenuItem(value: '3BHK', child: Text('3 BHK')),
                      ],
                      onChanged: (v) => setState(() => _bhkFilter = v!),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Owner filter
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF090D16),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _ownerTypeFilter,
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('Any Owner')),
                        DropdownMenuItem(value: 'defence', child: Text('🎖️ Defence')),
                        DropdownMenuItem(value: 'nobroker', child: Text('Direct')),
                      ],
                      onChanged: (v) => setState(() => _ownerTypeFilter = v!),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Max Price filter
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF090D16),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<double>(
                      value: _maxPriceFilter,
                      items: const [
                        DropdownMenuItem(value: 100000.0, child: Text('Any Rent')),
                        DropdownMenuItem(value: 15000.0, child: Text('< ₹15k')),
                        DropdownMenuItem(value: 30000.0, child: Text('< ₹30k')),
                      ],
                      onChanged: (v) => setState(() => _maxPriceFilter = v!),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── TAB 2: DORMS VIEW ──────────────────────────────────────────────────────
  Widget _buildDormsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _dorms.length,
      itemBuilder: (context, index) {
        final d = _dorms[index];
        return Card(
          color: const Color(0xFF131B2E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      d.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF9933).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        d.type,
                        style: const TextStyle(color: Color(0xFFFF9933), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '🎯 ${d.ssb} · 🚶 ${d.distance} km from gate',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 8),
                Text(d.desc, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₹${d.price.toStringAsFixed(0)}/night',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF9933), fontSize: 16),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Show nearby food
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            backgroundColor: const Color(0xFF131B2E),
                            title: Text('🍽️ Nearby Mess & Food - ${d.city}'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Verified canteen & catering options nearby:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                ...((d.city == 'Prayagraj')
                                    ? [
                                        const Text('• Sharma Dhaba (Veg) - ₹80 Unlimited'),
                                        const Text('• Officer Mess catering - Available for order'),
                                      ]
                                    : [
                                        const Text('• Bapu Ki Kutia (Veg thali) - ₹120'),
                                        const Text('• Canteen Smart Cards accepted'),
                                      ]),
                              ],
                            ),
                            actions: [
                              TextButton(
                                child: const Text('Close', style: TextStyle(color: Color(0xFFFF9933))),
                                onPressed: () => Navigator.pop(context),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: const Icon(Icons.restaurant, size: 12, color: Colors.black),
                      label: const Text('Nearby Food', style: TextStyle(fontSize: 10, color: Colors.black)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF9933),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─── TAB 3: MARKET VIEW ─────────────────────────────────────────────────────
  Widget _buildMarketTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _filteredMarketItems.length,
      itemBuilder: (context, index) {
        final item = _filteredMarketItems[index];
        return Card(
          color: const Color(0xFF131B2E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF090D16),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: item.mediaUrls.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(item.mediaUrls[0], fit: BoxFit.cover),
                        )
                      : const Center(child: Text('📦', style: TextStyle(fontSize: 32))),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF14B8A6).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item.category,
                              style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '📍 ${item.area}, ${item.city} · ${item.condition}',
                        style: const TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '₹${item.price.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF9933), fontSize: 16),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Connecting to vendor via secure military channel...'),
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF14B8A6),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            ),
                            child: const Text('Chat', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─── TAB 4: RELOCATION VIEW ─────────────────────────────────────────────────
  Widget _buildRelocationTab() {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          Container(
            color: const Color(0xFF131B2E),
            child: const TabBar(
              indicatorColor: Color(0xFFFF9933),
              tabs: [
                Tab(text: '📅 Relocation Timeline'),
                Tab(text: '💰 Allowance Matrix'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildTimelineSubTab(),
                _buildAllowanceMatrixSubTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSubTab() {
    final tasks = seedTasks[_relocationRank] ?? [];
    final checks = _taskCheckStates[_relocationRank] ?? [];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Rank Selection:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            Row(
              children: ['OR', 'JCO', 'Officer'].map((r) {
                final isSelected = _relocationRank == r;
                return Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: ChoiceChip(
                    label: Text(r),
                    selected: isSelected,
                    selectedColor: const Color(0xFFFF9933),
                    onSelected: (selected) {
                      if (selected) setState(() => _relocationRank = r);
                    },
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...List.generate(tasks.length, (index) {
          final t = tasks[index];
          final isChecked = checks[index];
          return Card(
            color: const Color(0xFF131B2E),
            child: CheckboxListTile(
              activeColor: const Color(0xFF22C55E),
              title: Text(t.label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFFF9933))),
              subtitle: Text(t.task, style: TextStyle(decoration: isChecked ? TextDecoration.lineThrough : null, color: isChecked ? Colors.grey : Colors.white70)),
              value: isChecked,
              onChanged: (val) {
                setState(() {
                  checks[index] = val!;
                });
              },
            ),
          );
        }),
      ],
    );
  }

  Widget _buildAllowanceMatrixSubTab() {
    final limits = luggageLimits[_relocationRank]!;
    final double maxGovWeight = limits['weight'];
    final double allowanceBase = limits['allowance'];

    // TA/DA formula: allowanceBase * (distance / 1000) * (min(weight, maxWeight) / maxWeight)
    final double govReimbursement = (allowanceBase * (_postingDistance / 1000.0) * (Math.min(_estimatedWeight, maxGovWeight) / maxGovWeight)).roundToDouble();
    final double variance = govReimbursement - _packersCost;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Input panel
          const Text('1. Enter Posting Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF131B2E),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _buildSliderRow(
                  label: 'Distance: ${_postingDistance.toInt()} km',
                  min: 100,
                  max: 3000,
                  value: _postingDistance,
                  onChanged: (v) => setState(() => _postingDistance = v),
                ),
                _buildSliderRow(
                  label: 'Luggage Weight: ${_estimatedWeight.toInt()} kg',
                  min: 500,
                  max: 15000,
                  value: _estimatedWeight,
                  onChanged: (v) => setState(() => _estimatedWeight = v),
                ),
                _buildSliderRow(
                  label: 'Packers Quote: ₹${_packersCost.toInt()}',
                  min: 5000,
                  max: 100000,
                  value: _packersCost,
                  onChanged: (v) => setState(() => _packersCost = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          // Output Card
          const Text('2. Official Allowance Outcome', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF131B2E), const Color(0xFF090D16)],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Govt Luggage Reimbursement TA/DA', style: TextStyle(color: Color(0xFFFF9933), fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text(
                  '₹${govReimbursement.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 32, color: Colors.white),
                ),
                const Divider(height: 20, color: Colors.grey),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Actual packers cost:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Text('₹${_packersCost.toInt()}', style: const TextStyle(fontSize: 12, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      variance >= 0 ? '💼 Budget Savings:' : '⚠️ Out of Pocket:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: variance >= 0 ? const Color(0xFF22C55E) : Colors.redAccent),
                    ),
                    Text(
                      '₹${variance.abs().toInt()}',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: variance >= 0 ? const Color(0xFF22C55E) : Colors.redAccent),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliderRow({required String label, required double min, required double max, required double value, required Function(double) onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.white70)),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: 40,
          activeColor: const Color(0xFFFF9933),
          inactiveColor: Colors.grey.withOpacity(0.3),
          onChanged: onChanged,
        ),
      ],
    );
  }
}

// ─── RENTAL LISTING CARD WIDGET ───────────────────────────────────────────────
class _RentalCard extends StatelessWidget {
  final RentalListing listing;
  const _RentalCard({required this.listing});

  @override
  Widget build(BuildContext context) {
    final hasImage = listing.mediaUrls.isNotEmpty;
    return Card(
      color: const Color(0xFF131B2E),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showListingDetail(context),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: const Color(0xFF090D16),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: hasImage
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          listing.mediaUrls[0],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Center(child: Text('🏠', style: TextStyle(fontSize: 32))),
                        ),
                      )
                    : const Center(child: Text('🏠', style: TextStyle(fontSize: 32))),
              ),
              const SizedBox(width: 12),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            listing.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (listing.verified)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF22C55E).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'VERIFIED',
                              style: TextStyle(color: Color(0xFF22C55E), fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '📍 ${listing.area}, ${listing.city} · 🚗 Parking: ${listing.parking}',
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '📐 Size: ${listing.sqft} sq ft · gate: ${listing.distance} km',
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${listing.price.toStringAsFixed(0)}/mo',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF9933),
                            fontSize: 16,
                          ),
                        ),
                        const Text(
                          'Details ➔',
                          style: TextStyle(color: Color(0xFFFF9933), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showListingDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF131B2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final hraLimit = listing.price <= 15000 ? '🟢 OR Limit' : listing.price <= 30000 ? '🟡 JCO Limit' : '🔴 Officer Limit';
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          listing.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Image
                  Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFF090D16),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: listing.mediaUrls.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(listing.mediaUrls[0], fit: BoxFit.cover),
                          )
                        : const Center(child: Text('🏠', style: TextStyle(fontSize: 48))),
                  ),
                  const SizedBox(height: 16),
                  // Attributes
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${listing.price.toStringAsFixed(0)}/mo',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFFFF9933)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey.withOpacity(0.3)),
                        ),
                        child: Text(hraLimit, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text('🎖️ Tactical Proximity (Cantt Gate)', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    'This property is located ${listing.distance} km from the military station corridor gate. Commute time is approximately ${Math.round(double.parse(listing.distance) * 2.5)} mins.',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 14),
                  const Text('🏫 Local Services proximity', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('• Military Hospital (MH) - ~2.4 km\n• Army Public School (APS) - ~1.8 km\n• CSD Canteen / URC - ~3.1 km', style: TextStyle(color: Colors.grey, fontSize: 12, height: 1.5)),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final Uri mapUri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${listing.city}+Cantonment');
                            if (await canLaunchUrl(mapUri)) {
                              await launchUrl(mapUri, mode: LaunchMode.externalApplication);
                            }
                          },
                          icon: const Icon(Icons.navigation, color: Colors.black),
                          label: const Text('Commute GPS', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF9933),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final Uri phoneUri = Uri.parse('tel:+919876543210');
                            if (await canLaunchUrl(phoneUri)) {
                              await launchUrl(phoneUri);
                            }
                          },
                          icon: const Icon(Icons.phone, color: Colors.white),
                          label: const Text('Contact Host', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF14B8A6),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// ─── POST LISTING FORM DIALOG ─────────────────────────────────────────────────
class _PostListingForm extends StatefulWidget {
  final Function(RentalListing) onAddListing;
  const _PostListingForm({required this.onAddListing});

  @override
  State<_PostListingForm> createState() => _PostListingFormState();
}

class _PostListingFormState extends State<_PostListingForm> {
  final _formKey = GlobalKey<FormState>();
  String _title = '';
  String _area = '';
  String _city = '';
  double _price = 0;
  String _type = '2BHK';
  String _furnishing = 'Semi';
  String _whatsapp = '';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '📝 Post Housing Listing',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFFFF9933)),
              ),
              const SizedBox(height: 16),
              // Name
              TextFormField(
                decoration: const InputDecoration(labelText: 'Title / Name *', hintText: 'e.g. 2BHK Near Station Gate'),
                validator: (v) => v!.isEmpty ? 'Please enter a title' : null,
                onSaved: (v) => _title = v!,
              ),
              // Price
              TextFormField(
                decoration: const InputDecoration(labelText: 'Rent Amount (₹/mo) *'),
                keyboardType: TextInputType.number,
                validator: (v) => double.tryParse(v!) == null ? 'Please enter a valid price' : null,
                onSaved: (v) => _price = double.parse(v!),
              ),
              // Area & City
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: const InputDecoration(labelText: 'Area / Cantt *'),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      onSaved: (v) => _area = v!,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      decoration: const InputDecoration(labelText: 'City *'),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      onSaved: (v) => _city = v!,
                    ),
                  ),
                ],
              ),
              // Type / Furnishing
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _type,
                      decoration: const InputDecoration(labelText: 'Type'),
                      items: const [
                        DropdownMenuItem(value: '1BHK', child: Text('1 BHK')),
                        DropdownMenuItem(value: '2BHK', child: Text('2 BHK')),
                        DropdownMenuItem(value: '3BHK', child: Text('3 BHK')),
                      ],
                      onChanged: (v) => setState(() => _type = v!),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _furnishing,
                      decoration: const InputDecoration(labelText: 'Furnishing'),
                      items: const [
                        DropdownMenuItem(value: 'Semi', child: Text('Semi')),
                        DropdownMenuItem(value: 'Fully', child: Text('Fully')),
                        DropdownMenuItem(value: 'Unfurnished', child: Text('Unfurnished')),
                      ],
                      onChanged: (v) => setState(() => _furnishing = v!),
                    ),
                  ),
                ],
              ),
              // WhatsApp
              TextFormField(
                decoration: const InputDecoration(labelText: 'WhatsApp Mobile No *'),
                keyboardType: TextInputType.phone,
                validator: (v) => v!.length < 10 ? 'Please enter a 10-digit number' : null,
                onSaved: (v) => _whatsapp = v!,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF9933),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      _formKey.currentState!.save();
                      final newListing = RentalListing(
                        id: 'pl_custom_${Date.now()}',
                        verified: false,
                        name: _title,
                        area: _area,
                        city: _city,
                        price: _price,
                        type: _type,
                        available: 'Available Now',
                        distance: '2.5',
                        ownerType: 'defence',
                        furnishing: _furnishing,
                        sqft: '900',
                        parking: '1',
                        petFriendly: true,
                        category: 'rentals',
                        mediaUrls: [],
                      );
                      debugPrint('Submitted WhatsApp: $_whatsapp');
                      widget.onAddListing(newListing);
                      Navigator.pop(context);
                    }
                  },
                  child: const Text('Submit Listing', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
class Math {
  static double min(double a, double b) => a < b ? a : b;
  static int round(double value) => value.round();
}

extension Date on DateTime {
  static String now() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }
}
