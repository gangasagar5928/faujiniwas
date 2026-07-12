class RentalListing {
  final String id;
  final bool verified;
  final String name;
  final String area;
  final String city;
  final double price;
  final String type;
  final String available;
  final String distance;
  final String ownerType;
  final String furnishing;
  final String sqft;
  final String parking;
  final bool petFriendly;
  final String category;
  final List<String> mediaUrls;

  RentalListing({
    required this.id,
    required this.verified,
    required this.name,
    required this.area,
    required this.city,
    required this.price,
    required this.type,
    required this.available,
    required this.distance,
    required this.ownerType,
    required this.furnishing,
    required this.sqft,
    required this.parking,
    required this.petFriendly,
    required this.category,
    required this.mediaUrls,
  });
}

class SsbDorm {
  final String id;
  final String name;
  final String ssb;
  final String city;
  final String area;
  final double price;
  final String type;
  final String distance;
  final List<String> amenities;
  final String budget;
  final String desc;

  SsbDorm({
    required this.id,
    required this.name,
    required this.ssb,
    required this.city,
    required this.area,
    required this.price,
    required this.type,
    required this.distance,
    required this.amenities,
    required this.budget,
    required this.desc,
  });
}

class MarketItem {
  final String id;
  final String name;
  final String area;
  final String city;
  final double price;
  final String category;
  final String condition;
  final bool negotiable;
  final List<String> mediaUrls;
  final String uid;

  MarketItem({
    required this.id,
    required this.name,
    required this.area,
    required this.city,
    required this.price,
    required this.category,
    required this.condition,
    required this.negotiable,
    required this.mediaUrls,
    required this.uid,
  });
}

class RelocationTask {
  final String id;
  final String label;
  final String task;

  RelocationTask({
    required this.id,
    required this.label,
    required this.task,
  });
}

// ─── SEED DATA ───────────────────────────────────────────────────────────────

final List<RentalListing> rawSeedListings = [
  RentalListing(
    id: 'pl001',
    verified: true,
    name: 'Spacious 2BHK Near Gate 3',
    area: 'Kirkee Cantt',
    city: 'Pune',
    price: 14000,
    type: '2BHK',
    available: 'Available Now',
    distance: '1.2',
    ownerType: 'defence',
    furnishing: 'Semi',
    sqft: '850',
    parking: '1',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl002',
    verified: true,
    name: 'Cozy 1BHK Officers Lane',
    area: 'Camp Area',
    city: 'Pune',
    price: 9500,
    type: '1BHK',
    available: '2026-08-01',
    distance: '2.5',
    ownerType: 'civilian',
    furnishing: 'Fully',
    sqft: '580',
    parking: '0',
    petFriendly: false,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl003',
    verified: true,
    name: '3BHK Family Flat AFDCC Road',
    area: 'AFDCC Road',
    city: 'Pune',
    price: 22000,
    type: '3BHK',
    available: 'Available Now',
    distance: '0.8',
    ownerType: 'defence',
    furnishing: 'Fully',
    sqft: '1400',
    parking: '2',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl004',
    verified: false,
    name: 'PG Room for SSB Candidates',
    area: 'Camp',
    city: 'Pune',
    price: 6000,
    type: 'Room',
    available: 'Available Now',
    distance: '3.0',
    ownerType: 'civilian',
    furnishing: 'Fully',
    sqft: '200',
    parking: '0',
    petFriendly: false,
    category: 'rentals',
    mediaUrls: [],
  ),
  RentalListing(
    id: 'pl005',
    verified: true,
    name: '3BHK Ground Floor Delhi Cantt',
    area: 'Delhi Cantt',
    city: 'Delhi',
    price: 28000,
    type: '3BHK',
    available: 'Available Now',
    distance: '0.5',
    ownerType: 'defence',
    furnishing: 'Semi',
    sqft: '1600',
    parking: '2',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl006',
    verified: true,
    name: '2BHK Naraina Vihar Flat',
    area: 'Naraina Vihar',
    city: 'Delhi',
    price: 18000,
    type: '2BHK',
    available: '2026-08-15',
    distance: '3.2',
    ownerType: 'civilian',
    furnishing: 'Semi',
    sqft: '950',
    parking: '1',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: [],
  ),
  RentalListing(
    id: 'pl007',
    verified: true,
    name: '2BHK Trimulgherry Base Area',
    area: 'Trimulgherry',
    city: 'Secunderabad',
    price: 13000,
    type: '2BHK',
    available: 'Available Now',
    distance: '1.8',
    ownerType: 'defence',
    furnishing: 'Semi',
    sqft: '900',
    parking: '1',
    petFriendly: false,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl008',
    verified: true,
    name: '3BHK Bowenpally Gated Society',
    area: 'Bowenpally',
    city: 'Secunderabad',
    price: 20000,
    type: '3BHK',
    available: 'Available Now',
    distance: '2.5',
    ownerType: 'civilian',
    furnishing: 'Fully',
    sqft: '1350',
    parking: '2',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: [],
  ),
  RentalListing(
    id: 'pl009',
    verified: true,
    name: '2BHK Hebbal Cantt Corridor',
    area: 'Hebbal',
    city: 'Bengaluru',
    price: 16000,
    type: '2BHK',
    available: 'Available Now',
    distance: '1.5',
    ownerType: 'defence',
    furnishing: 'Semi',
    sqft: '980',
    parking: '1',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=75'],
  ),
  RentalListing(
    id: 'pl010',
    verified: true,
    name: '3BHK Ulsoor Lake View Flat',
    area: 'Ulsoor',
    city: 'Bengaluru',
    price: 32000,
    type: '3BHK',
    available: '2026-09-01',
    distance: '3.0',
    ownerType: 'civilian',
    furnishing: 'Fully',
    sqft: '1800',
    parking: '2',
    petFriendly: true,
    category: 'rentals',
    mediaUrls: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=75'],
  ),
];

final List<SsbDorm> rawSeedDorms = [
  SsbDorm(
    id: 'ssb1',
    name: 'Pragati Guesthouse',
    ssb: '1 SSB Allahabad',
    city: 'Prayagraj',
    area: 'Civil Lines',
    price: 400,
    type: 'Dormitory',
    distance: '1.2',
    amenities: ['AC', 'Mess', 'Locker'],
    budget: '₹',
    desc: 'Basic clean dorm, 5-min auto to Allahabad SSB.',
  ),
  SsbDorm(
    id: 'ssb2',
    name: 'Station Rest House',
    ssb: '1 SSB Allahabad',
    city: 'Prayagraj',
    area: 'Naini',
    price: 600,
    type: 'Single Room',
    distance: '2.5',
    amenities: ['AC', 'WiFi', 'Attached Bath'],
    budget: '₹',
    desc: 'Quiet rooms near railway station.',
  ),
  SsbDorm(
    id: 'ssb3',
    name: 'Shivam Dormitory',
    ssb: '2 SSB Bhopal',
    city: 'Bhopal',
    area: 'Habibganj',
    price: 350,
    type: 'Dormitory',
    distance: '3.0',
    amenities: ['Common Bath', 'Mess', 'Locker'],
    budget: '₹',
    desc: 'Budget-friendly dorm near Bhopal SSB.',
  ),
  SsbDorm(
    id: 'ssb4',
    name: 'Hotel Palash Residency',
    ssb: '2 SSB Bhopal',
    city: 'Bhopal',
    area: 'MP Nagar',
    price: 900,
    type: 'Single Room',
    distance: '4.0',
    amenities: ['AC', 'WiFi', 'TV', 'Geyser'],
    budget: '₹₹',
    desc: 'Mid-range hotel. Good for candidates wanting comfort.',
  ),
  SsbDorm(
    id: 'ssb5',
    name: 'Kapurthala Youth Hostel',
    ssb: '3 SSB Kapurthala',
    city: 'Kapurthala',
    area: 'Bus Stand Road',
    price: 300,
    type: 'Dormitory',
    distance: '1.8',
    amenities: ['Fan Rooms', 'Mess', 'Common Bath'],
    budget: '₹',
    desc: 'Most popular among SSB candidates.',
  ),
];

final List<MarketItem> rawSeedMarketItems = [
  MarketItem(
    id: 'm1',
    name: 'Study Desk & Officer Chair',
    area: 'Kirkee Cantt',
    city: 'Pune',
    price: 3500,
    category: 'Furniture',
    condition: 'Good',
    negotiable: true,
    mediaUrls: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400'],
    uid: 'host123',
  ),
  MarketItem(
    id: 'm2',
    name: 'Automatic Washing Machine 7Kg',
    area: 'Delhi Cantt',
    city: 'Delhi',
    price: 11000,
    category: 'Electronics',
    condition: 'New',
    negotiable: false,
    mediaUrls: [],
    uid: 'host456',
  ),
  MarketItem(
    id: 'm3',
    name: 'Royal Enfield Classic 350',
    area: 'Hebbal Cantt',
    city: 'Bengaluru',
    price: 135000,
    category: 'Vehicles',
    condition: 'Good',
    negotiable: true,
    mediaUrls: [],
    uid: 'host789',
  ),
];

final Map<String, List<RelocationTask>> seedTasks = {
  'OR': [
    RelocationTask(id: 'or-t45', label: 'T-45 Days', task: 'Check posting order & obtain vacate approval for OR family quarters.'),
    RelocationTask(id: 'or-t30', label: 'T-30 Days', task: 'Register for school transfer certificates for children in local KV.'),
    RelocationTask(id: 'or-t15', label: 'T-15 Days', task: 'Book railway warrants or military-approved transport vectors.'),
    RelocationTask(id: 'or-t7',  label: 'T-7 Days',  task: 'Vacate quarter, submit electricity clearance certs, clear canteen balances.'),
    RelocationTask(id: 'or-t1',  label: 'T-1 Day',   task: 'Collect final clearance certificate & movement order from Adjutant.'),
    RelocationTask(id: 'or-tp5', label: 'T+5 Days',  task: 'Arrive at new station, report to new Unit HQ & submit movement order.'),
  ],
  'JCO': [
    RelocationTask(id: 'jco-t45', label: 'T-45 Days', task: 'Confirm posting signals and schedule vacate inspection with Garrison Engineer (GE).'),
    RelocationTask(id: 'jco-t30', label: 'T-30 Days', task: 'Apply for school TC and clear all local Unit mess bills.'),
    RelocationTask(id: 'jco-t15', label: 'T-15 Days', task: 'Acquire Packers & Movers bids and register luggage warrants with Quartermaster.'),
    RelocationTask(id: 'jco-t7',  label: 'T-7 Days',  task: 'VACATE JCO quarters, complete water/power dues clearance.'),
    RelocationTask(id: 'jco-t1',  label: 'T-1 Day',   task: 'Receive command clearance and sign official movement order sheets.'),
    RelocationTask(id: 'jco-tp5', label: 'T+5 Days',  task: 'Report to new unit, file travel claims (TA/DA) at the finance depot.'),
  ],
  'Officer': [
    RelocationTask(id: 'off-t45', label: 'T-45 Days', task: 'Coordinate officer quarter vacating slots & inspect private outliving rentals.'),
    RelocationTask(id: 'off-t30', label: 'T-30 Days', task: 'Initiate APS admission pre-registration in next station area.'),
    RelocationTask(id: 'off-t15', label: 'T-15 Days', task: 'Coordinate vehicle transport vouchers and schedule movers.'),
    RelocationTask(id: 'off-t7',  label: 'T-7 Days',  task: 'Vacate bungalow, finalize outliving clearance paperwork with station HQ.'),
    RelocationTask(id: 'off-t1',  label: 'T-1 Day',   task: 'Obtain Adjutant signatures and command clearance certificates.'),
    RelocationTask(id: 'off-tp5', label: 'T+5 Days',  task: 'Report to Command/Regimental HQ, file TA/DA claims & check HRA limits.'),
  ]
};

final Map<String, Map<String, dynamic>> luggageLimits = {
  'OR': {'weight': 3000.0, 'allowance': 18000.0, 'label': 'Other Ranks (OR)'},
  'JCO': {'weight': 6000.0, 'allowance': 34000.0, 'label': 'Junior Commissioned Officers'},
  'Officer': {'weight': 12000.0, 'allowance': 78000.0, 'label': 'Commissioned Officers'},
};
