export const state = {
    map: null,
    markerCluster: null,
    markers: {},
    typeFilter: 'all',
    smartSearchQ: '',
    sortPref: 'new',
    maxPrice: 100000,
    listings: [],
    draftCoords: { lat: 22.5, lng: 82.0 },
    currentReportId: null,
    furnishFilter: 'all',
    availFilter:   'all',
    sqftFilter:    'all',
    ownerFilter:   'all',
    termFilter:    'all',
    schoolKmFilter: null,
};

export const SSB_DORMS = [
    { id: 'ssb1', name: 'Pragati Guesthouse', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Civil Lines', lat: 25.4358, lng: 81.8463, price: 400, type: 'Dormitory', distance: '1.2', amenities: ['AC', 'Mess', 'Locker'], budget: '₹', desc: 'Basic clean dorm, 5-min auto to Allahabad SSB.' },
    { id: 'ssb2', name: 'Station Rest House', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Naini', lat: 25.4025, lng: 81.8611, price: 600, type: 'Single Room', distance: '2.5', amenities: ['AC', 'WiFi', 'Attached Bath'], budget: '₹', desc: 'Quiet rooms near railway station.' },
    { id: 'ssb3', name: 'Shivam Dormitory', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'Habibganj', lat: 23.2340, lng: 77.4342, price: 350, type: 'Dormitory', distance: '3.0', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Budget-friendly dorm near Bhopal SSB.' },
    { id: 'ssb4', name: 'Hotel Palash Residency', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'MP Nagar', lat: 23.2240, lng: 77.4428, price: 900, type: 'Single Room', distance: '4.0', amenities: ['AC', 'WiFi', 'TV', 'Geyser'], budget: '₹₹', desc: 'Mid-range hotel. Good for candidates wanting comfort.' },
    { id: 'ssb5', name: 'Kapurthala Youth Hostel', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'Bus Stand Road', lat: 31.3798, lng: 75.3733, price: 300, type: 'Dormitory', distance: '1.8', amenities: ['Fan Rooms', 'Mess', 'Common Bath'], budget: '₹', desc: 'Most popular among SSB candidates.' },
    { id: 'ssb6', name: 'Hotel Satluj', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'GT Road', lat: 31.3851, lng: 75.3810, price: 700, type: 'Single Room', distance: '2.2', amenities: ['AC', 'WiFi', 'Hot Water'], budget: '₹₹', desc: 'Decent private rooms. Auto to SSB in 10 mins.' },
    { id: 'ssb7', name: 'SSB Candidate Lodge', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Vijayanagar', lat: 12.9716, lng: 77.5946, price: 500, type: 'Dormitory', distance: '2.8', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Near Bangalore SSB centre.' },
    { id: 'ssb8', name: 'OYO – Manekshaw Nagar', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Cantonment', lat: 12.9882, lng: 77.6101, price: 1200, type: 'Single Room', distance: '1.5', amenities: ['AC', 'WiFi', 'Geyser', 'TV'], budget: '₹₹₹', desc: 'Premium option close to SSB.' },
    { id: 'ssb9', name: 'Landmark PG House', ssb: '17 SSB Allahabad (Air)', city: 'Prayagraj', area: 'Bamrauli', lat: 25.4483, lng: 81.7337, price: 450, type: 'PG/Room', distance: '1.0', amenities: ['Fan', 'Mess', 'Attached Bath'], budget: '₹', desc: 'Closest budget PG to Air Force SSB gate.' },
    { id: 'ssb14', name: 'Delhi Cantt Candidate Stay', ssb: 'SSB Delhi', city: 'New Delhi', area: 'Delhi Cantt', lat: 28.5961, lng: 77.1587, price: 600, type: 'Dormitory', distance: '1.2', amenities: ['AC', 'WiFi', 'Attached Bath'], budget: '₹₹', desc: 'Popular among Delhi SSB candidates.' },
];

export const FOOD_BY_CITY = {
    'Prayagraj': [
        { name: 'El Chico Restaurant', type: 'North Indian', budget: '₹₹', note: 'Great thali, AC seating' },
        { name: 'Sharma Dhaba', type: 'Veg Dhaba', budget: '₹', note: 'Under ₹100 full meal' }
    ],
    'Bhopal': [
        { name: 'Bapu Ki Kutia', type: 'Thali', budget: '₹', note: 'Unlimited thali ₹120' },
        { name: 'Manohar Dairy', type: 'Sweets', budget: '₹', note: 'Iconic since 1940' }
    ],
    'Pune': [
        { name: 'Vaishali Restaurant', type: 'South Indian', budget: '₹₹', note: 'Iconic FC Road' },
        { name: 'Cafe Goodluck', type: 'Irani Cafe', budget: '₹', note: 'Bun maska ₹40' }
    ],
    'Delhi': [
        { name: 'Karim\'s Jama Masjid', type: 'Mughlai', budget: '₹₹', note: 'Legendary since 1913' },
        { name: 'Haldiram\'s CP', type: 'Veg / Sweets', budget: '₹', note: 'Thali ₹150' }
    ],
    'Lucknow': [
        { name: 'Tunday Kababi', type: 'Mughlai', budget: '₹', note: 'World-famous galouti kebab' },
        { name: 'Dastarkhwan', type: 'Awadhi', budget: '₹', note: 'Dum biryani & nihari' }
    ],
    'Bengaluru': [
        { name: 'MTR Restaurant', type: 'South Indian', budget: '₹₹', note: 'Best idli-vada' },
        { name: 'Vidyarthi Bhavan', type: 'South Indian', budget: '₹', note: 'Famous masala dosa' }
    ],
    'Secunderabad': [
        { name: 'Paradise Biryani', type: 'Biryani', budget: '₹₹', note: 'Iconic Hyderabadi biryani' },
        { name: 'Café Bahar', type: 'Irani/Tea', budget: '₹', note: 'Best Irani chai' }
    ]
};

export const ARMY_SCHOOLS = {
    'Pune': [
        { name: 'Army Public School Kirkee', type: 'APS', lat: 18.5736, lng: 73.8535 },
        { name: 'Army Public School Pune', type: 'APS', lat: 18.5204, lng: 73.8567 },
        { name: 'KV No.1 AF Station', type: 'KV', lat: 18.583, lng: 73.919 }
    ],
    'Delhi': [
        { name: 'Army Public School Dhaula Kuan', type: 'APS', lat: 28.5888, lng: 77.1700 },
        { name: 'Army Public School Delhi Cantt', type: 'APS', lat: 28.6027, lng: 77.1348 },
        { name: 'KV No.1 Delhi Cantt', type: 'KV', lat: 28.5955, lng: 77.1387 }
    ],
    'Udhampur': [
        { name: 'Army Public School Udhampur', type: 'APS', lat: 32.9268, lng: 75.1325 },
        { name: 'KV No.1 Udhampur', type: 'KV', lat: 32.94, lng: 75.15 }
    ],
    'Pathankot': [
        { name: 'Army Public School Pathankot', type: 'APS', lat: 32.26, lng: 75.65 },
        { name: 'KV No.1 Pathankot', type: 'KV', lat: 32.27, lng: 75.66 }
    ],
    'Jammu': [
        { name: 'Army Public School Jammu Cantt', type: 'APS', lat: 32.70, lng: 74.83 },
        { name: 'KV No.1 Jammu', type: 'KV', lat: 32.72, lng: 74.85 }
    ],
    'Srinagar': [
        { name: 'Army Public School Srinagar', type: 'APS', lat: 34.0837, lng: 74.7973 }
    ],
    'Jodhpur': [
        { name: 'Army Public School Jodhpur', type: 'APS', lat: 26.26, lng: 73.00 },
        { name: 'KV No.1 Jodhpur', type: 'KV', lat: 26.27, lng: 73.01 }
    ],
    'Lucknow': [
        { name: 'Army Public School Lucknow', type: 'APS', lat: 26.82, lng: 80.95 },
        { name: 'KV AMC Centre', type: 'KV', lat: 26.83, lng: 80.94 }
    ],
    'Bengaluru': [
        { name: 'Army Public School Bengaluru', type: 'APS', lat: 12.9698, lng: 77.6255 }
    ],
    'Secunderabad': [
        { name: 'Army Public School Secunderabad', type: 'APS', lat: 17.472, lng: 78.485 }
    ],
    'Jabalpur': [
        { name: 'Army Public School Jabalpur', type: 'APS', lat: 23.18, lng: 79.98 }
    ],
    'Ambala': [
        { name: 'Army Public School Ambala', type: 'APS', lat: 30.36, lng: 76.81 }
    ],
    'Guwahati': [
        { name: 'Army Public School Narangi', type: 'APS', lat: 26.17, lng: 91.83 }
    ],
    'Kochi': [
        { name: 'Navy Children School Kochi', type: 'APS', lat: 9.93, lng: 76.26 }
    ],
    'Vizag': [
        { name: 'Navy Children School Vizag', type: 'APS', lat: 17.71, lng: 83.30 }
    ],
    'Mumbai': [
        { name: 'Army Public School Mumbai', type: 'APS', lat: 18.91, lng: 72.82 }
    ],
    'Jhansi': [
        { name: 'Army Public School Jhansi', type: 'APS', lat: 25.44, lng: 78.56 }
    ],
    'Agra': [
        { name: 'Army Public School Agra', type: 'APS', lat: 27.17, lng: 78.00 }
    ],
    'Ahmedabad': [
        { name: 'Army Public School Ahmedabad', type: 'APS', lat: 23.07, lng: 72.62 }
    ],
    'Chandimandir': [
        { name: 'Army Public School Chandimandir', type: 'APS', lat: 30.71, lng: 76.85 }
    ],
    'Mathura': [
        { name: 'Army Public School Mathura', type: 'APS', lat: 27.49, lng: 77.67 }
    ],
    'Gwalior': [
        { name: 'Army Public School Gwalior', type: 'APS', lat: 26.21, lng: 78.18 }
    ],
    'Mhow': [
        { name: 'Army Public School Mhow', type: 'APS', lat: 22.55, lng: 75.76 }
    ],
    'Bathinda': [
        { name: 'Army Public School Bathinda', type: 'APS', lat: 30.21, lng: 74.94 }
    ],
    'Danapur': [
        { name: 'Army Public School Danapur', type: 'APS', lat: 25.63, lng: 85.04 }
    ],
    'Shillong': [
        { name: 'Army Public School Shillong', type: 'APS', lat: 25.56, lng: 91.88 }
    ],
    'Allahabad': [
        { name: 'Army Public School Allahabad', type: 'APS', lat: 25.43, lng: 81.84 }
    ],
    'Ferozepur': [
        { name: 'Army Public School Ferozepur', type: 'APS', lat: 30.92, lng: 74.62 }
    ],
    'Meerut': [
        { name: 'Army Public School Meerut', type: 'APS', lat: 28.99, lng: 77.71 }
    ],
    'Bareilly': [
        { name: 'Army Public School Bareilly', type: 'APS', lat: 28.34, lng: 79.43 }
    ],
    'Siliguri': [
        { name: 'Army Public School Sukna', type: 'APS', lat: 26.78, lng: 88.36 }
    ],
    'Bikaner': [
        { name: 'Army Public School Bikaner', type: 'APS', lat: 28.02, lng: 73.31 }
    ],
    'Jaipur': [
        { name: 'Army Public School Jaipur', type: 'APS', lat: 26.91, lng: 75.78 }
    ],
    'Ahmednagar': [
       { name: 'Army Public School Ahmednagar', type: 'APS', lat: 19.10, lng: 74.75 }
    ],
    'Nasirabad': [
       { name: 'Army Public School Nasirabad', type: 'APS', lat: 26.30, lng: 74.73 }
    ],
    'Panagarh': [
       { name: 'Army Public School Panagarh', type: 'APS', lat: 23.45, lng: 87.46 }
    ],
    'Barrackpore': [
       { name: 'Army Public School Barrackpore', type: 'APS', lat: 22.77, lng: 88.37 }
    ]
};

export const MILITARY_HOSPITALS = {
    'Pune': [
        { name: 'Command Hospital Southern Command', lat: 18.514, lng: 73.882 },
        { name: 'Military Hospital Kirkee', lat: 18.572, lng: 73.851 }
    ],
    'Kolkata': [
        { name: 'Command Hospital Eastern Command', lat: 22.53, lng: 88.33 }
    ],
    'Lucknow': [
        { name: 'Command Hospital Central Command', lat: 26.818, lng: 80.941 }
    ],
    'Chandimandir': [
        { name: 'Command Hospital Western Command', lat: 30.71, lng: 76.85 }
    ],
    'Udhampur': [
        { name: 'Command Hospital Northern Command', lat: 32.93, lng: 75.14 }
    ],
    'Bengaluru': [
        { name: 'Command Hospital Air Force', lat: 12.964, lng: 77.621 }
    ],
    'Mumbai': [
        { name: 'INHS Asvini (Navy)', lat: 18.90, lng: 72.82 }
    ],
    'Delhi': [
        { name: 'Army Hospital (R&R)', lat: 28.583, lng: 77.153 },
        { name: 'Base Hospital Delhi Cantt', lat: 28.591, lng: 77.135 }
    ],
    'Jammu': [
        { name: 'Military Hospital Jammu', lat: 32.71, lng: 74.84 }
    ],
    'Srinagar': [
        { name: '92 Base Hospital', lat: 34.08, lng: 74.80 }
    ],
    'Leh': [
        { name: '153 General Hospital', lat: 34.14, lng: 77.58 }
    ],
    'Shillong': [
        { name: 'Military Hospital Shillong', lat: 25.56, lng: 91.88 }
    ],
    'Guwahati': [
        { name: '151 Base Hospital', lat: 26.17, lng: 91.82 }
    ],
    'Jabalpur': [
        { name: 'Military Hospital Jabalpur', lat: 23.16, lng: 79.95 }
    ],
    'Jhansi': [
        { name: 'Military Hospital Jhansi', lat: 25.45, lng: 78.57 }
    ],
    'Pathankot': [
        { name: 'Military Hospital Pathankot', lat: 32.26, lng: 75.64 }
    ]
};

export const CANTEENS = {
    'Delhi': [
        { name: 'CSD Canteen Delhi Cantt', lat: 28.59, lng: 77.14 },
        { name: 'Central Canteen Dhaula Kuan', lat: 28.58, lng: 77.16 }
    ],
    'Pune': [
        { name: 'Golden Palm CSD URC', lat: 18.525, lng: 73.875 },
        { name: 'Kirkee URC Canteen', lat: 18.575, lng: 73.855 }
    ],
    'Lucknow': [
        { name: 'Surya Canteen URC', lat: 26.82, lng: 80.94 }
    ],
    'Bengaluru': [
        { name: 'Hebbal CSD Canteen', lat: 13.01, lng: 77.67 }
    ],
    'Ambala': [
        { name: 'Ambala Cantt CSD', lat: 30.37, lng: 76.82 }
    ],
    'Meerut': [
        { name: 'Meerut Cantt URC', lat: 29.01, lng: 77.71 }
    ],
    'Jodhpur': [
        { name: 'Jodhpur Cantt CSD', lat: 26.27, lng: 73.07 }
    ],
    'Ahmedabad': [
        { name: 'Ahmedabad Cantt URC', lat: 23.09, lng: 72.65 }
    ],
    'Secunderabad': [
        { name: 'Trimulgherry CSD', lat: 17.47, lng: 78.49 }
    ]
};

// Aliases for user searches
export const CITY_ALIASES = {
    'bangalore': 'bengaluru',
    'allahabad': 'prayagraj',
    'mysore': 'mysuru',
    'hyderabad': 'secunderabad',
    'pune camp': 'pune',
    'gurgaon': 'delhi',
    'noida': 'delhi'
};

export const CAB_ROUTES = [
    { id: 'c1', from: 'Ambala Cantt', to: 'Delhi Cantt', via: 'NH44', distance: '~250 km', contact: 'Connect via Chat' },
    { id: 'c2', from: 'Pune', to: 'Mumbai Airport', via: 'Expressway', distance: '~150 km', contact: 'Connect via Chat' },
    { id: 'c3', from: 'Mhow', to: 'Indore Airport', via: 'NH52', distance: '~25 km', contact: 'Connect via Chat' }
];
