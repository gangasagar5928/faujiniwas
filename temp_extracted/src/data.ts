import { Property, Facility, RankHRAInfo } from "./types";

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "2 BHK Patna Cantt",
    rent: 18749,
    commute: "21 m",
    size: "38 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    coord: { x: 37, y: 27 }, // Near Danapur Cantt / west Patna
    type: "2 BHK",
    cantonment: "Patna Cantt",
    rating: 4.8,
    description: "Centrally located modern apartment. Walking distance to the central canteen and army school. Fully safe gated community reserved strictly for defense families.",
    suitableRanks: ["Sepoy", "Havildar", "Naib Subedar", "Subedar", "Lieutenant", "Captain", "Major"]
  },
  {
    id: "prop-2",
    title: "1 BHK Patna Cantt",
    rent: 14500,
    commute: "12 m",
    size: "36 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    coord: { x: 54, y: 44 }, // Middle Patna Cantt area
    type: "1 BHK",
    cantonment: "Patna Cantt",
    rating: 4.5,
    description: "Perfect for single officers or young couples. 12 minutes commute to Regiment Headquarter. Secure complex with 24/7 military police patrolling nearby.",
    suitableRanks: ["Sepoy", "Lance Naik", "Naik", "Havildar", "Naib Subedar", "Subedar", "Lieutenant"]
  },
  {
    id: "prop-3",
    title: "PG/Room Patna Cantt",
    rent: 18749,
    commute: "21 m",
    size: "60 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    coord: { x: 59, y: 75 }, // South Patna Cantt / Phulwari area
    type: "PG/Room",
    cantonment: "Patna Cantt",
    rating: 4.2,
    description: "Spacious independent room with attached bath and kitchenette. Safe environment, 24/7 running water, power backup. Best suited for defense aspirants or single soldiers on transit.",
    suitableRanks: ["Sepoy", "Lance Naik", "Naik", "Havildar"]
  },
  {
    id: "prop-4",
    title: "3 BHK Officers Bunglow",
    rent: 23000,
    commute: "5 m",
    size: "120 m",
    amenities: "Parking & Lawn",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    coord: { x: 45, y: 66 }, // Danapur Cantt Officers Enclave
    type: "3 BHK",
    cantonment: "Danapur Cantt",
    rating: 4.9,
    description: "Premium independent bunglow-style unit. Located inside the highly secure Officers Enclave. Private lawn, spacious portico, walking distance to golf course and Officers' Mess.",
    suitableRanks: ["Major", "Lieutenant Colonel", "Colonel", "Brigadier", "Major General"]
  },
  {
    id: "prop-5",
    title: "2 BHK Phulwari Block",
    rent: 16000,
    commute: "17 m",
    size: "45 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
    coord: { x: 72, y: 44 }, // Phulwari Sharif border
    type: "2 BHK",
    cantonment: "Patna Cantt",
    rating: 4.6,
    description: "Recently renovated first floor flat. Gated community with double entry security. Close to Phulwari railways and defense transport zone.",
    suitableRanks: ["Havildar", "Naib Subedar", "Subedar", "Lieutenant", "Captain"]
  },
  {
    id: "prop-6",
    title: "1 BHK Khagaul Haven",
    rent: 11000,
    commute: "8 m",
    size: "30 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
    coord: { x: 28, y: 55 }, // West near Khagaul station
    type: "1 BHK",
    cantonment: "Danapur Cantt",
    rating: 4.3,
    description: "Cosy 1 BHK near Khagaul. Quick commute to Danapur Station Commute Zone and military hospital. Approved landlord (retired Major S.K. Sharma).",
    suitableRanks: ["Sepoy", "Lance Naik", "Naik", "Havildar"]
  },
  {
    id: "prop-7",
    title: "3 BHK Luxury Cantonment Flat",
    rent: 22000,
    commute: "15 m",
    size: "95 m",
    amenities: "Parking",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    coord: { x: 62, y: 51 }, // East Patna Cantt
    type: "3 BHK",
    cantonment: "Patna Cantt",
    rating: 4.7,
    description: "Spacious 3 BHK apartment with modular kitchen, premium fittings and expansive views. Reserved parking, army broad band lines, and direct HRA clearance.",
    suitableRanks: ["Captain", "Major", "Lieutenant Colonel", "Colonel"]
  }
];

export const FACILITIES: Facility[] = [
  // Schools
  {
    id: "fac-sch-1",
    name: "Army Public School (APS) Danapur",
    type: "school",
    coord: { x: 32, y: 46 },
    distance: "1.2 km",
    details: "Premium CBSe School dedicated for kids of military personnel with priority admission and subsidized fee structures."
  },
  {
    id: "fac-sch-2",
    name: "Kendriya Vidyalaya No. 1 Kankarbagh",
    type: "school",
    coord: { x: 79, y: 22 },
    distance: "4.5 km",
    details: "KV board school for central government and military kids, featuring high-quality labs and play grounds."
  },
  {
    id: "fac-sch-3",
    name: "St. Michael's Cantonment Branch",
    type: "school",
    coord: { x: 68, y: 19 },
    distance: "3.1 km",
    details: "Affiliated primary wing with special defense quota allocation and sports excellence track."
  },

  // Hospitals
  {
    id: "fac-hosp-1",
    name: "Military Hospital (MH) Danapur Cantt",
    type: "hospital",
    coord: { x: 57, y: 15 },
    distance: "0.8 km",
    details: "Full-scale dedicated military hospital offering primary, secondary, and specialized healthcare for serving personnel, veterans (ECHS), and dependents."
  },
  {
    id: "fac-hosp-2",
    name: "ECHS Polyclinic Patna",
    type: "hospital",
    coord: { x: 86, y: 24 },
    distance: "3.5 km",
    details: "Ex-Servicemen Contributory Health Scheme polyclinic for outpatient consultations and drug dispensaries."
  },

  // Station Commute Zones
  {
    id: "fac-stat-1",
    name: "Danapur Railway Station",
    type: "station",
    coord: { x: 18, y: 64 },
    distance: "1.8 km",
    details: "Major railway terminal with specialized Army Movement Office (AMO) and exclusive defense booking counter."
  },
  {
    id: "fac-stat-2",
    name: "Patna Junction Railway Station",
    type: "station",
    coord: { x: 84, y: 70 },
    distance: "5.2 km",
    details: "Primary transport hub linking Bihar with all defense commands. Exclusive Army transit lounge available 24/7."
  }
];

// 7th Pay Commission Indian Armed Forces Rank Base Pay and HRA (Y Category city - 18% of basic pay)
export const RANKS_HRA: RankHRAInfo[] = [
  { rank: "Sepoy", minBasicPay: 21700, maxBasicPay: 69100, hraRateY: 18 },
  { rank: "Lance Naik", minBasicPay: 25500, maxBasicPay: 81100, hraRateY: 18 },
  { rank: "Naik", minBasicPay: 25500, maxBasicPay: 81100, hraRateY: 18 },
  { rank: "Havildar", minBasicPay: 29200, maxBasicPay: 92300, hraRateY: 18 },
  { rank: "Naib Subedar", minBasicPay: 35400, maxBasicPay: 112400, hraRateY: 18 },
  { rank: "Subedar", minBasicPay: 44900, maxBasicPay: 142400, hraRateY: 18 },
  { rank: "Subedar Major", minBasicPay: 47600, maxBasicPay: 151100, hraRateY: 18 },
  { rank: "Lieutenant", minBasicPay: 56100, maxBasicPay: 177500, hraRateY: 18 },
  { rank: "Captain", minBasicPay: 61300, maxBasicPay: 193900, hraRateY: 18 },
  { rank: "Major", minBasicPay: 69400, maxBasicPay: 207200, hraRateY: 18 },
  { rank: "Lieutenant Colonel", minBasicPay: 121200, maxBasicPay: 212400, hraRateY: 18 },
  { rank: "Colonel", minBasicPay: 130600, maxBasicPay: 215900, hraRateY: 18 },
  { rank: "Brigadier", minBasicPay: 139600, maxBasicPay: 217600, hraRateY: 18 },
  { rank: "Major General", minBasicPay: 144200, maxBasicPay: 218200, hraRateY: 18 },
  { rank: "Lieutenant General", minBasicPay: 182200, maxBasicPay: 224100, hraRateY: 18 },
  { rank: "General (COAS)", minBasicPay: 250000, maxBasicPay: 250000, hraRateY: 18 }
];
