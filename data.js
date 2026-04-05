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
    // Advanced filters
    furnishFilter: 'all',   // all | Fully | Semi | Unfurnished
    availFilter:   'all',   // all | now | 3mo
    sqftFilter:    'all',   // all | lt500 | 500to1000 | gt1000
    ownerFilter:   'all',   // all | defence | civilian | broker
    termFilter:    'all',   // all | short
    schoolKmFilter: null,  // null | number (km from nearest school)
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
{ id: 'ssb12', name: 'Budget Stay – Ambad', ssb: '5 SSB Pune', city: 'Pune', area: 'Camp Area', lat: 18.5204, lng: 73.8567, price: 400, type: 'Dormitory', distance: '2.5', amenities: ['Fan', 'Common Bath', 'Mess'], budget: '₹', desc: 'Simple dorm near Pune SSB.' },
{ id: 'ssb13', name: 'Dehradun AFS Boarding', ssb: '1 AFSB Dehradun', city: 'Dehradun', area: 'Clement Town', lat: 30.2680, lng: 78.0050, price: 350, type: 'Dormitory', distance: '1.5', amenities: ['Common Bath', 'Locker', 'Meals'], budget: '₹', desc: 'Convenient stay near AFSB Dehradun.' },
{ id: 'ssb14', name: 'Delhi Cantt Candidate Stay', ssb: 'SSB Delhi', city: 'New Delhi', area: 'Delhi Cantt', lat: 28.5961, lng: 77.1587, price: 600, type: 'Dormitory', distance: '1.2', amenities: ['AC', 'WiFi', 'Attached Bath'], budget: '₹₹', desc: 'Popular among Delhi SSB candidates.' },
{ id: 'ssb15', name: 'Chennai Naval Hostel', ssb: 'NSB Chennai', city: 'Chennai', area: 'Fort St George', lat: 13.0800, lng: 80.2800, price: 400, type: 'Dormitory', distance: '2.0', amenities: ['Fan', 'Common Bath', 'Mess'], budget: '₹', desc: 'Budget option near Naval selection board.' },
{ id: 'ssb16', name: 'Guwahati Transit Camp', ssb: 'SSB Guwahati', city: 'Guwahati', area: 'Narengi Cantt', lat: 26.1445, lng: 91.7362, price: 300, type: 'Dormitory', distance: '2.5', amenities: ['Locker', 'Fan', 'Common Bath'], budget: '₹', desc: 'Basic accommodation near Guwahati SSB.' },
{ id: 'ssb17', name: 'Kochi Naval Stay', ssb: 'NSB Kochi', city: 'Kochi', area: 'Naval Base', lat: 9.9312, lng: 76.2673, price: 500, type: 'Single Room', distance: '1.8', amenities: ['WiFi', 'AC', 'Attached Bath'], budget: '₹₹', desc: 'Comfortable private rooms near Kochi board.' }
];

export const FOOD_BY_CITY = {
    // Allahabad / Prayagraj
    'Prayagraj': [
        { name: 'El Chico Restaurant', type: 'North Indian', budget: '₹₹', note: 'Great thali, AC seating' },
        { name: 'Sharma Dhaba', type: 'Veg Dhaba', budget: '₹', note: 'Under ₹100 full meal' },
        { name: 'Kanha Restaurant', type: 'North Indian', budget: '₹', note: 'Famous kachori-sabzi' },
        { name: 'Kabab-E-Grill', type: 'Mughlai', budget: '₹₹', note: 'Best seekh kabab' }
    ],
    // Bhopal
    'Bhopal': [
        { name: 'Under The Mango Tree', type: 'Multi-cuisine', budget: '₹₹₹', note: 'Nice ambience near VIP Rd' },
        { name: 'Bapu Ki Kutia', type: 'Thali', budget: '₹', note: 'Unlimited thali ₹120' },
        { name: 'Manohar Dairy & Restaurant', type: 'Sweets & Snacks', budget: '₹', note: 'Iconic since 1940' },
        { name: 'Wind & Waves', type: 'Lakeside Cafe', budget: '₹₹', note: 'Great view of Upper Lake' }
    ],
    // Kapurthala
    'Kapurthala': [
        { name: 'Punjabi Dhaba GT Road', type: 'Punjabi', budget: '₹', note: 'Best butter chicken' },
        { name: 'Amritsari Kulcha Corner', type: 'Street Food', budget: '₹', note: '₹60 kulcha-chole' },
        { name: 'Hotel Bilga Highway', type: 'North Indian', budget: '₹', note: 'Full dal-sabzi meal ₹90' },
        { name: 'Surya Sweets', type: 'Sweets & Snacks', budget: '₹', note: 'Fresh jalebis & lassi' }
    ],
    // Bangalore
    'Bengaluru': [
        { name: 'MTR Restaurant', type: 'South Indian', budget: '₹₹', note: 'Best idli-vada since 1924' },
        { name: "Brahmin's Coffee Bar", type: 'Breakfast', budget: '₹', note: '₹30 idli-chutney, legendary' },
        { name: 'Vidyarthi Bhavan', type: 'South Indian', budget: '₹', note: 'Famous masala dosa, Gandhi Bazaar' },
        { name: 'Sri Sagar (CTR)', type: 'South Indian', budget: '₹', note: 'Butter benne masala dosa' }
    ],
    'Bangalore': [
        { name: 'MTR Restaurant', type: 'South Indian', budget: '₹₹', note: 'Best idli-vada since 1924' },
        { name: "Brahmin's Coffee Bar", type: 'Breakfast', budget: '₹', note: '₹30 idli-chutney, legendary' },
        { name: 'Vidyarthi Bhavan', type: 'South Indian', budget: '₹', note: 'Famous masala dosa' },
        { name: 'Shivaji Military Hotel', type: 'Meals', budget: '₹', note: 'Full meals ₹80' }
    ],
    // Mysore
    'Mysuru': [
        { name: 'Hotel RRR', type: 'South Indian Meals', budget: '₹', note: 'Unlimited meals ₹100' },
        { name: 'Vinayaka Mylari', type: 'Breakfast', budget: '₹', note: 'Famous soft dosa' },
        { name: 'Hanumanthu Military Hotel', type: 'Meals', budget: '₹', note: 'Rice meals ₹60' },
        { name: 'Café Coffee Day (Sayyaji Rao)', type: 'Cafe', budget: '₹₹', note: 'Good for group meets' }
    ],
    'Mysore': [
        { name: 'Hotel RRR', type: 'South Indian Meals', budget: '₹', note: 'Unlimited meals ₹100' },
        { name: 'Vinayaka Mylari', type: 'Breakfast', budget: '₹', note: 'Famous soft dosa' }
    ],
    // Pune
    'Pune': [
        { name: 'Vaishali Restaurant', type: 'South Indian', budget: '₹₹', note: 'Iconic FC Road' },
        { name: 'Cafe Goodluck', type: 'Irani Cafe', budget: '₹', note: 'Bun maska ₹40' },
        { name: 'Goodluck Dhaba', type: 'North Indian', budget: '₹', note: 'Near Camp, full meal ₹120' },
        { name: 'Kayani Bakery', type: 'Bakery', budget: '₹', note: 'Famous Shrewsbury biscuits' }
    ],
    // Dehradun
    'Dehradun': [
        { name: 'Ellora Restaurant', type: 'North Indian / Chinese', budget: '₹₹', note: 'Rajpur Road classic' },
        { name: 'Hotel Osho Dhaba', type: 'Dhaba', budget: '₹', note: 'Full meal ₹100, open all day' },
        { name: 'Sikkimese Cafe', type: 'Tibetan / Momos', budget: '₹', note: 'Best momos ₹60/plate' },
        { name: 'Diwan Chand Pakodi Wala', type: 'Street Food', budget: '₹', note: 'Iconic since 1936' }
    ],
    // Delhi / New Delhi
    'Delhi': [
        { name: 'Karim\'s Jama Masjid', type: 'Mughlai', budget: '₹₹', note: 'Legendary since 1913' },
        { name: 'Paranthe Wali Gali', type: 'Street Food', budget: '₹', note: 'Chandni Chowk, ₹50/paratha' },
        { name: 'Sagar Ratna', type: 'South Indian', budget: '₹₹', note: 'All over Delhi, reliable' },
        { name: 'Haldiram\'s Connaught Place', type: 'Veg / Sweets', budget: '₹', note: 'Thali ₹150' }
    ],
    'New Delhi': [
        { name: 'Karim\'s Jama Masjid', type: 'Mughlai', budget: '₹₹', note: 'Legendary since 1913' },
        { name: 'Paranthe Wali Gali', type: 'Street Food', budget: '₹', note: '₹50/paratha, Chandni Chowk' },
        { name: 'Sagar Ratna', type: 'South Indian', budget: '₹₹', note: 'Reliable chain, AC seating' },
        { name: 'Haldiram\'s CP', type: 'Veg / Sweets', budget: '₹', note: 'Thali ₹150' }
    ],
    // Chandigarh
    'Chandigarh': [
        { name: 'Pal Dhaba Sector 28', type: 'Punjabi', budget: '₹', note: 'Famous dal makhani, late night' },
        { name: 'Gopal\'s Chinese', type: 'Chinese', budget: '₹', note: 'Sector 22, best Manchurian' },
        { name: 'Sindhi Sweets Sector 17', type: 'Sweets & Chaat', budget: '₹', note: 'Raj kachori & lassi' },
        { name: 'The Ghazal Restaurant', type: 'Multi-cuisine', budget: '₹₹', note: 'Good for groups' }
    ],
    // Chennai
    'Chennai': [
        { name: 'Saravana Bhavan', type: 'South Indian', budget: '₹', note: 'Reliable across Chennai' },
        { name: 'Murugan Idli Shop', type: 'Breakfast', budget: '₹', note: 'Softest idli in Chennai' },
        { name: 'Ratna Cafe', type: 'South Indian', budget: '₹', note: 'Sambar rice, legendary' },
        { name: 'Hotel Palmgrove', type: 'Meals', budget: '₹', note: 'AC meals ₹180' }
    ],
    // Hyderabad / Secunderabad
    'Hyderabad': [
        { name: 'Paradise Biryani', type: 'Biryani', budget: '₹₹', note: 'Iconic Hyderabadi biryani' },
        { name: 'Café Bahar', type: 'South Indian / Biryani', budget: '₹', note: 'Best Irani chai & Osmania biscuit' },
        { name: 'Govind Dosa Camp Secunderabad', type: 'South Indian', budget: '₹', note: 'Quick & cheap dosas' },
        { name: 'Nimra Café', type: 'Irani/Tea', budget: '₹', note: 'Near Charminar, Chai + biscuit ₹20' }
    ],
    'Secunderabad': [
        { name: 'Paradise Biryani', type: 'Biryani', budget: '₹₹', note: 'Iconic Hyderabadi biryani' },
        { name: 'Café Bahar', type: 'South Indian', budget: '₹', note: 'Best Irani chai' },
        { name: 'Ram Babu Mess', type: 'Andhra Meals', budget: '₹', note: 'Full Andhra thali ₹80' },
        { name: 'Minerva Coffee Shop', type: 'North/South Indian', budget: '₹', note: 'Near railway station' }
    ],
    // Kolkata
    'Kolkata': [
        { name: 'Arsalan Biryani', type: 'Biryani', budget: '₹₹', note: 'Best Kolkata biryani with aloo' },
        { name: 'Peter Cat', type: 'Continental / Mughlai', budget: '₹₹₹', note: 'Iconic Park Street' },
        { name: 'Anadi Cabin', type: 'Bengali / Mughlai', budget: '₹', note: 'Kathi roll birthplace' },
        { name: 'Sharma Dhaba Khidirpur', type: 'North Indian', budget: '₹', note: 'Near military quarters' }
    ],
    // Lucknow
    'Lucknow': [
        { name: 'Tunday Kababi', type: 'Mughlai', budget: '₹', note: 'World-famous galouti kebab' },
        { name: 'Dastarkhwan', type: 'Awadhi', budget: '₹₹', note: 'Dum biryani & nihari' },
        { name: 'Shirin Restaurant', type: 'Veg / Chaat', budget: '₹', note: 'Tokri chaat & sweets' },
        { name: 'Sharma Ji Ki Chai Gomti Nagar', type: 'Tea & Snacks', budget: '₹', note: 'Masala chai ₹15' }
    ],
    // Jaipur
    'Jaipur': [
        { name: 'Laxmi Misthan Bhandar (LMB)', type: 'Rajasthani', budget: '₹₹', note: 'Dal baati churma, iconic' },
        { name: 'Chokhi Dhani Village Dhaba', type: 'Rajasthani Thali', budget: '₹₹', note: 'Cultural experience' },
        { name: 'Rawat Mishthan Bhandar', type: 'Sweets & Kachori', budget: '₹', note: 'Pyaaz kachori ₹20' },
        { name: 'Hotel Shivam Ajmer Road', type: 'Dal Baati', budget: '₹', note: 'Near military area' }
    ],
    // Jabalpur
    'Jabalpur': [
        { name: 'Quality Restaurant', type: 'North Indian', budget: '₹₹', note: 'Near Cantt, AC' },
        { name: 'Naulakha Restaurant', type: 'Veg North Indian', budget: '₹', note: 'Full thali ₹100' },
        { name: 'Shree Krishna Dhaba', type: 'Dhaba', budget: '₹', note: 'Open 24 hrs near station' },
        { name: 'Bade Mian ka Dhaba', type: 'North Indian', budget: '₹', note: 'Army cantt area' }
    ],
    // Ambala
    'Ambala': [
        { name: 'Haveli Restaurant NH1', type: 'Punjabi', budget: '₹', note: 'Truck driver style, huge portions' },
        { name: 'Bombay Sweets Ambala City', type: 'Sweets / Snacks', budget: '₹', note: 'Famous milk cake' },
        { name: 'Highway Dhaba Ambala', type: 'Dhaba', budget: '₹', note: 'Dal-roti ₹80' },
        { name: 'Hotel Kwality', type: 'Multi-cuisine', budget: '₹₹', note: 'Near Cantonment' }
    ],
    // Meerut
    'Meerut': [
        { name: 'Sukhdev Dhaba Muzzaffarnagar Highway', type: 'North Indian', budget: '₹', note: 'Legendary truck stop dhaba' },
        { name: 'Giani Ice Cream & Snacks', type: 'Snacks & Sweets', budget: '₹', note: 'Kachori & rabri' },
        { name: 'Hotel Sindhi Restaurant', type: 'North Indian', budget: '₹', note: 'Near Cantt' },
        { name: 'Shiva Dhaba', type: 'Dhaba', budget: '₹', note: 'Dal makhani & roti ₹70' }
    ],
    // Ahmedabad
    'Ahmedabad': [
        { name: 'Gordhan Thal', type: 'Gujarati Thali', budget: '₹₹', note: 'Unlimited Gujarati thali' },
        { name: 'Agashiye', type: 'Gujarati', budget: '₹₹₹', note: 'Rooftop thali, iconic' },
        { name: 'Manek Chowk Street Food', type: 'Street Food', budget: '₹', note: 'Khichdi, lassi, pav bhaji' },
        { name: 'Shree Vijay Farsan Mart', type: 'Farsan / Snacks', budget: '₹', note: 'Best fafda-jalebi' }
    ],
    // Nagpur
    'Nagpur': [
        { name: 'Zabardast Chicken', type: 'Chicken Specialties', budget: '₹₹', note: 'Famous dry chicken' },
        { name: 'Hotel Kwality', type: 'Multi-cuisine', budget: '₹₹', note: 'Central Ave landmark' },
        { name: 'Bhonsle Military Hotel', type: 'Non-veg Meals', budget: '₹', note: 'Full meal ₹90' },
        { name: 'Haldiram\'s Nagpur', type: 'Veg / Sweets', budget: '₹', note: 'Best in Nagpur for veg' }
    ],
    // Pathankot
    'Pathankot': [
        { name: 'Aman Dhaba', type: 'Punjabi', budget: '₹', note: 'Near railway station' },
        { name: 'Rajdhani Dhaba NH44', type: 'North Indian', budget: '₹', note: 'Truckers dhaba, huge portions' },
        { name: 'Giani Di Hatti', type: 'Sweets & Kulfi', budget: '₹', note: 'Famous kulfi-falooda' },
        { name: 'Hotel Archana Residency', type: 'Multi-cuisine', budget: '₹₹', note: 'AC dining near Cantt' }
    ],
    // Shimla
    'Shimla': [
        { name: 'Ashiana & Goofa Restaurant', type: 'Multi-cuisine', budget: '₹₹', note: 'Ridge area, great views' },
        { name: 'Baljees Restaurant', type: 'North Indian / Snacks', budget: '₹', note: 'Since 1944, Himachali food' },
        { name: 'Café Sol', type: 'Cafe', budget: '₹₹', note: 'Cozy, pasta & coffee' },
        { name: 'Victory Tea House', type: 'Tibetan', budget: '₹', note: 'Thukpa & momos ₹80' }
    ],
    // Kochi
    'Kochi': [
        { name: 'Dhe Puttu', type: 'Kerala Style', budget: '₹', note: 'Best puttu & kadala curry ₹80' },
        { name: 'Pai Brothers', type: 'Mess-style Meals', budget: '₹', note: 'Rice meals ₹70' },
        { name: 'Hotel Abad', type: 'Kerala / Chinese', budget: '₹₹', note: 'Near Navy area' },
        { name: 'Kayees Rahmathulla Hotel', type: 'Biryani / Kerala', budget: '₹₹', note: 'Thalassery biryani' }
    ],
    // Trivandrum
    'Thiruvananthapuram': [
        { name: 'Hotel Ariya Nivaas', type: 'Kerala Meals', budget: '₹', note: 'Sadhya-style meals ₹90' },
        { name: 'Sri Padmanabha Swamy Mess', type: 'Mess', budget: '₹', note: 'Near fort area, full meals' },
        { name: 'Zam Zam Hotel', type: 'Biryani', budget: '₹₹', note: 'Malabar biryani' },
        { name: 'Indian Coffee House', type: 'Breakfast / Coffee', budget: '₹', note: 'Iconic since 1958' }
    ],
    'Trivandrum': [
        { name: 'Hotel Ariya Nivaas', type: 'Kerala Meals', budget: '₹', note: 'Sadhya-style meals ₹90' },
        { name: 'Indian Coffee House', type: 'Breakfast / Coffee', budget: '₹', note: 'Iconic since 1958' }
    ],
    // Guwahati
    'Guwahati': [
        { name: 'Paradise Restaurant', type: 'Assamese / North Indian', budget: '₹₹', note: 'Near Pan Bazar' },
        { name: 'Panbazar Fish Market Dhaba', type: 'Assamese Fish', budget: '₹', note: 'Fresh rohu curry ₹100' },
        { name: 'Hotel Nandan', type: 'Multi-cuisine', budget: '₹₹', note: 'Good for non-veg' },
        { name: 'Dynasty Restaurant', type: 'Chinese / Assamese', budget: '₹₹', note: 'Near Cantonment' }
    ],
    // Ranchi
    'Ranchi': [
        { name: 'Kaveri Restaurant', type: 'South Indian', budget: '₹', note: 'Dosa-idli, popular with officers' },
        { name: 'Hotel Capitol Hill', type: 'Multi-cuisine', budget: '₹₹', note: 'Near Cantt' },
        { name: 'Tandoor Express', type: 'North Indian', budget: '₹', note: 'Full meals ₹100' },
        { name: 'Rolls & More', type: 'Fast Food', budget: '₹', note: 'Kathi rolls ₹60' }
    ],
    // Jodhpur
    'Jodhpur': [
        { name: 'Gypsy Restaurant', type: 'Rajasthani', budget: '₹₹', note: 'Dal baati churma, rooftop' },
        { name: 'Janta Sweet Home', type: 'Sweets / Snacks', budget: '₹', note: 'Mirchi bada ₹15' },
        { name: 'Akshaya Dhaba', type: 'Dhaba', budget: '₹', note: 'Near Air Force Station' },
        { name: 'Omelette Shop Nai Sarak', type: 'Egg dishes', budget: '₹', note: '₹30 omelette, famous' }
    ],
    // Belgaum / Belagavi
    'Belagavi': [
        { name: 'Hotel Sanman', type: 'North Karnataka Meals', budget: '₹', note: 'Jolada roti + ennegai ₹80' },
        { name: 'Chapata Shahi Biryani', type: 'Biryani', budget: '₹₹', note: 'Popular near Cantt' },
        { name: 'Sri Ram Hotel', type: 'South Indian', budget: '₹', note: 'Dosa & upma ₹50' },
        { name: 'Kamat Upahara Darshini', type: 'South Indian', budget: '₹', note: 'Bisi bele bath ₹60' }
    ],
    'Belgaum': [
        { name: 'Hotel Sanman', type: 'North Karnataka Meals', budget: '₹', note: 'Jolada roti ₹80' },
        { name: 'Chapata Shahi Biryani', type: 'Biryani', budget: '₹₹', note: 'Popular near Cantt' }
    ],
};

// ─── Army Schools & KV Data ───
export const ARMY_SCHOOLS = {
    'Pune': [
        { name: 'Army Public School Kirkee', type: 'APS', lat: 18.5736, lng: 73.8535, address: 'Kirkee Cantt' },
        { name: 'Kendriya Vidyalaya Pune', type: 'KV', lat: 18.5204, lng: 73.8567, address: 'Cantonment' },
    ],
    'Delhi': [
        { name: 'Army Public School Delhi Cantt', type: 'APS', lat: 28.6027, lng: 77.1348, address: 'Delhi Cantt' },
        { name: 'Kendriya Vidyalaya No.1 Delhi Cantt', type: 'KV', lat: 28.5955, lng: 77.1387, address: 'Delhi Cantt' },
    ],
    'New Delhi': [
        { name: 'Army Public School Delhi Cantt', type: 'APS', lat: 28.6027, lng: 77.1348, address: 'Delhi Cantt' },
        { name: 'Kendriya Vidyalaya No.1 Delhi Cantt', type: 'KV', lat: 28.5955, lng: 77.1387, address: 'Delhi Cantt' },
    ],
    'Bengaluru': [
        { name: 'Army Public School Bengaluru', type: 'APS', lat: 12.9989, lng: 77.6677, address: 'Hebbal Cantt' },
        { name: 'Kendriya Vidyalaya ASC Centre South', type: 'KV', lat: 12.9716, lng: 77.5946, address: 'Bengaluru South' },
    ],
    'Bangalore': [
        { name: 'Army Public School Bengaluru', type: 'APS', lat: 12.9989, lng: 77.6677, address: 'Hebbal Cantt' },
        { name: 'Kendriya Vidyalaya ASC Centre South', type: 'KV', lat: 12.9716, lng: 77.5946, address: 'Bengaluru South' },
    ],
    'Secunderabad': [
        { name: 'Army Public School Secunderabad', type: 'APS', lat: 17.4444, lng: 78.5016, address: 'Secunderabad Cantt' },
        { name: 'Kendriya Vidyalaya Secunderabad', type: 'KV', lat: 17.4477, lng: 78.4982, address: 'Secunderabad' },
    ],
    'Mhow': [
        { name: 'Army Public School Mhow', type: 'APS', lat: 22.5549, lng: 75.7617, address: 'Mhow Cantt' },
        { name: 'Kendriya Vidyalaya Mhow', type: 'KV', lat: 22.5511, lng: 75.7583, address: 'Mhow' },
    ],
    'Ambala': [
        { name: 'Army Public School Ambala', type: 'APS', lat: 30.3782, lng: 76.7767, address: 'Ambala Cantt' },
        { name: 'Kendriya Vidyalaya Ambala Cantt', type: 'KV', lat: 30.3711, lng: 76.7821, address: 'Ambala Cantt' },
    ],
    'Jalandhar': [
        { name: 'Army Public School Jalandhar', type: 'APS', lat: 31.3260, lng: 75.5762, address: 'Jalandhar Cantt' },
        { name: 'Kendriya Vidyalaya Jalandhar Cantt', type: 'KV', lat: 31.3281, lng: 75.5728, address: 'Jalandhar Cantt' },
    ],
    'Dehradun': [
        { name: 'Army Public School Dehradun', type: 'APS', lat: 30.3165, lng: 78.0322, address: 'Clement Town' },
        { name: 'Kendriya Vidyalaya IMA Dehradun', type: 'KV', lat: 30.3395, lng: 78.0419, address: 'IMA Campus' },
    ],
    'Jodhpur': [
        { name: 'Army Public School Jodhpur', type: 'APS', lat: 26.2635, lng: 73.0068, address: 'Ratanada Cantt' },
        { name: 'Kendriya Vidyalaya Jodhpur Cantt', type: 'KV', lat: 26.2741, lng: 73.0112, address: 'Jodhpur Cantt' },
    ],
};

// ─── Cab Share Routes ───
export const CAB_ROUTES = [
    { id: 'c1', from: 'Ambala Cantt', to: 'Delhi Cantt', via: 'NH44', distance: '~250 km', time: '4–5 hrs', typical: '₹400–600/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
    { id: 'c2', from: 'Pune', to: 'Mumbai Airport', via: 'Expressway', distance: '~150 km', time: '2.5–3 hrs', typical: '₹350–500/seat', contact: 'Post on community board', peak: 'All year' },
    { id: 'c3', from: 'Mhow', to: 'Indore Airport', via: 'NH52', distance: '~25 km', time: '40 min', typical: '₹100–150/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
    { id: 'c4', from: 'Dehradun', to: 'Delhi', via: 'NH334', distance: '~300 km', time: '5–6 hrs', typical: '₹500–700/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
    { id: 'c5', from: 'Secunderabad', to: 'Hyderabad Airport', via: 'ORR', distance: '~40 km', time: '1–1.5 hrs', typical: '₹200–300/seat', contact: 'Post on community board', peak: 'All year' },
    { id: 'c6', from: 'Jalandhar', to: 'Amritsar Airport', via: 'GT Road', distance: '~80 km', time: '1.5 hrs', typical: '₹200–300/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
    { id: 'c7', from: 'Bengaluru', to: 'Mysuru', via: 'NICE Road', distance: '~145 km', time: '2.5 hrs', typical: '₹300–450/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
    { id: 'c8', from: 'Jodhpur', to: 'Jaipur Airport', via: 'NH62', distance: '~340 km', time: '5 hrs', typical: '₹500–700/seat', contact: 'Post on community board', peak: 'Jun–Jul' },
];
