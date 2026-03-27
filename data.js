export const state = {
    map: null,
    markerCluster: null,
    markers: {},
    typeFilter: 'all',
    smartSearchQ: '',
    sortPref: 'new',
    maxPrice: 100000,
    listings: [],
    draftCoords: { lat: 22.9074, lng: 79.1469 },
    currentReportId: null
};

export const SSB_DORMS = [
    { id: 'ssb1', name: 'Pragati Guesthouse', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Civil Lines', lat: 25.4358, lng: 81.8463, price: 400, type: 'Dormitory', distance: '1.2', amenities: ['AC', 'Mess', 'Locker'], budget: '₹', desc: 'Basic clean dorm, 5-min auto to Allahabad SSB.' },
{ id: 'ssb2', name: 'Station Rest House', ssb: '1 SSB Allahabad', city: 'Prayagraj', area: 'Naini', lat: 25.4025, lng: 81.8611, price: 600, type: 'Single Room', distance: '2.5', amenities: ['AC', 'WiFi', 'Attached Bath'], budget: '₹₹', desc: 'Quiet rooms near railway station.' },
{ id: 'ssb3', name: 'Shivam Dormitory', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'Habibganj', lat: 23.2340, lng: 77.4342, price: 350, type: 'Dormitory', distance: '3.0', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Budget-friendly dorm near Bhopal SSB.' },
{ id: 'ssb4', name: 'Hotel Palash Residency', ssb: '2 SSB Bhopal', city: 'Bhopal', area: 'MP Nagar', lat: 23.2240, lng: 77.4428, price: 900, type: 'Single Room', distance: '4.0', amenities: ['AC', 'WiFi', 'TV', 'Geyser'], budget: '₹₹', desc: 'Mid-range hotel. Good for candidates wanting comfort.' },
{ id: 'ssb5', name: 'Kapurthala Youth Hostel', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'Bus Stand Road', lat: 31.3798, lng: 75.3733, price: 300, type: 'Dormitory', distance: '1.8', amenities: ['Fan Rooms', 'Mess', 'Common Bath'], budget: '₹', desc: 'Most popular among SSB candidates.' },
{ id: 'ssb6', name: 'Hotel Satluj', ssb: '3 SSB Kapurthala', city: 'Kapurthala', area: 'GT Road', lat: 31.3851, lng: 75.3810, price: 700, type: 'Single Room', distance: '2.2', amenities: ['AC', 'WiFi', 'Hot Water'], budget: '₹₹', desc: 'Decent private rooms. Auto to SSB in 10 mins.' },
{ id: 'ssb7', name: 'SSB Candidate Lodge', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Vijayanagar', lat: 12.9716, lng: 77.5946, price: 500, type: 'Dormitory', distance: '2.8', amenities: ['Common Bath', 'Mess', 'Locker'], budget: '₹', desc: 'Near Bangalore SSB centre.' },
{ id: 'ssb8', name: 'OYO – Manekshaw Nagar', ssb: '21 SSB Bangalore', city: 'Bengaluru', area: 'Cantonment', lat: 12.9882, lng: 77.6101, price: 1200, type: 'Single Room', distance: '1.5', amenities: ['AC', 'WiFi', 'Geyser', 'TV'], budget: '₹₹₹', desc: 'Premium option close to SSB.' },
{ id: 'ssb9', name: 'Landmark PG House', ssb: '17 SSB Allahabad (Air)', city: 'Prayagraj', area: 'Bamrauli', lat: 25.4483, lng: 81.7337, price: 450, type: 'PG/Room', distance: '1.0', amenities: ['Fan', 'Mess', 'Attached Bath'], budget: '₹', desc: 'Closest budget PG to Air Force SSB gate.' },
{ id: 'ssb10', name: 'NDA Candidate Hostel', ssb: '19 SSB Bangalore', city: 'Bengaluru', area: 'Ulsoor', lat: 12.9790, lng: 77.6208, price: 250, type: 'Dormitory', distance: '3.5', amenities: ['Basic Meals', 'Locker', 'Common Bath'], budget: '₹', desc: 'No-frills dormitory.' },
{ id: 'ssb11', name: 'Hotel Landmark Mysore', ssb: '12 SSB Mysore', city: 'Mysuru', area: 'Nazarbad', lat: 12.3052, lng: 76.6552, price: 550, type: 'Single Room', distance: '2.0', amenities: ['AC', 'Hot Water', 'WiFi'], budget: '₹₹', desc: 'Clean rooms, 15 min from Mysore SSB.' },
{ id: 'ssb12', name: 'Budget Stay – Ambad', ssb: '5 SSB Pune', city: 'Pune', area: 'Camp Area', lat: 18.5204, lng: 73.8567, price: 400, type: 'Dormitory', distance: '2.5', amenities: ['Fan', 'Common Bath', 'Mess'], budget: '₹', desc: 'Simple dorm near Pune SSB.' }
];

export const FOOD_BY_CITY = {
    'Prayagraj': [{ name: 'El Chico Restaurant', type: 'North Indian', budget: '₹₹', note: 'Great thali, AC seating' }, { name: 'Sharma Dhaba', type: 'Veg Dhaba', budget: '₹', note: 'Under ₹100 full meal' }],
    'Bhopal': [{ name: 'Under The Mango Tree', type: 'Multi-cuisine', budget: '₹₹₹', note: 'Nice ambience' }, { name: 'Bapu Ki Kutia', type: 'Thali', budget: '₹', note: 'Unlimited thali ₹120' }],
    'Kapurthala': [{ name: 'Punjabi Dhaba GT Road', type: 'Punjabi', budget: '₹', note: 'Best butter chicken' }, { name: 'Amritsari Kulcha Corner', type: 'Street Food', budget: '₹', note: '₹60 kulcha-chole' }],
    'Bengaluru': [{ name: 'MTR Restaurant', type: 'South Indian', budget: '₹₹', note: 'Best idli-vada' }, { name: "Brahmin's Coffee Bar", type: 'Breakfast', budget: '₹', note: '₹30 idli-chutney' }],
    'Mysuru': [{ name: 'Hotel RRR', type: 'South Indian Meals', budget: '₹', note: 'Unlimited meals ₹100' }, { name: 'Vinayaka Mylari', type: 'Breakfast', budget: '₹', note: 'Famous dosa' }],
    'Pune': [{ name: 'Vaishali Restaurant', type: 'South Indian', budget: '₹₹', note: 'Iconic FC Road' }, { name: 'Cafe Goodluck', type: 'Irani Cafe', budget: '₹', note: 'Bun maska ₹40' }]
};
