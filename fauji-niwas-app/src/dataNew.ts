import { Property, Facility, RankHRAInfo } from "./typesNew";
import { PITCH_LISTINGS } from "./pitch_data";
import { ARMY_SCHOOLS, MILITARY_HOSPITALS, CANTEENS } from "./data";

function getCoordForProperty(prop: any) {
  // Patna/Danapur lat: 25.58 to 25.68, lng: 85.03 to 85.18
  let lat = prop.lat || 25.60;
  let lng = prop.lng || 85.10;
  
  if (prop.city === "Pune") {
    lat = 25.58 + ((lat - 18.5) * 0.1);
    lng = 85.03 + ((lng - 73.8) * 0.1);
  } else if (prop.city === "New Delhi" || prop.city === "Delhi") {
    lat = 25.58 + ((lat - 28.5) * 0.1);
    lng = 85.03 + ((lng - 77.1) * 0.1);
  } else if (prop.city === "Secunderabad") {
    lat = 25.58 + ((lat - 17.4) * 0.1);
    lng = 85.03 + ((lng - 78.5) * 0.1);
  } else if (prop.city === "Bengaluru" || prop.city === "Bangalore") {
    lat = 25.58 + ((lat - 12.9) * 0.1);
    lng = 85.03 + ((lng - 77.5) * 0.1);
  }
  
  const minLat = 25.58;
  const maxLat = 25.68;
  const minLng = 85.03;
  const maxLng = 85.18;
  
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
  
  return {
    x: Math.max(10, Math.min(90, x)),
    y: Math.max(10, Math.min(90, y))
  };
}

export function getSuitableRanks(price: number) {
  if (price < 10000) {
    return ["Sepoy", "Lance Naik", "Naik", "Havildar"];
  } else if (price < 18000) {
    return ["Havildar", "Naib Subedar", "Subedar", "Subedar Major", "Lieutenant"];
  } else {
    return ["Lieutenant", "Captain", "Major", "Lieutenant Colonel", "Colonel", "Brigadier", "Major General", "Lieutenant General", "General (COAS)"];
  }
}

export const PROPERTIES: Property[] = PITCH_LISTINGS.map((p: any) => ({
  id: p.id,
  title: p.name || p.title || "Defence Rental",
  rent: p.price || p.rent || 12000,
  commute: (p.distance || "1.5") + " km",
  size: (p.sqft || "80") + " m²",
  amenities: p.furnishing ? p.furnishing + " Furnished" : "Semi Furnished",
  image: (p.mediaUrls && p.mediaUrls[0]) || "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80",
  coord: getCoordForProperty(p),
  lat: p.lat || 25.60,
  lng: p.lng || 85.10,
  type: p.type === "1BHK" ? "1 BHK" : p.type === "2BHK" ? "2 BHK" : p.type === "3BHK" ? "3 BHK" : p.type,
  cantonment: (p.city || "Patna") + " Cantt",
  rating: p.verified ? 4.8 : 4.2,
  description: p.desc || p.name || "Secure accommodation suitable for defence families.",
  suitableRanks: getSuitableRanks(p.price || 12000),
  name: p.name || p.title || "Defence Rental",
  price: p.price || p.rent || 12000,
  city: p.city || "Patna",
  area: p.area || "Cantt Area",
}));

import { APS_SCHOOLS } from "./apsSchools";

const mappedSchools = APS_SCHOOLS.map((s: any) => ({
  ...s,
  coord: getCoordForProperty({ id: s.id, lat: s.lat, lng: s.lng, city: "Patna" }),
}));

const mappedHospitals = (MILITARY_HOSPITALS || []).slice(0, 15).map((h: any, idx: number) => ({
  id: `fac-hosp-${idx}`,
  name: h.name,
  type: "hospital" as const,
  coord: getCoordForProperty({ id: `hosp-${idx}`, lat: h.lat, lng: h.lng }),
  lat: h.lat || 25.60,
  lng: h.lng || 85.10,
  distance: "0.8 km",
  details: h.state || "Dedicated military healthcare."
}));

const mappedCanteens = (CANTEENS || []).slice(0, 15).map((c: any, idx: number) => ({
  id: `fac-cant-${idx}`,
  name: c.name,
  type: "station" as const,
  coord: getCoordForProperty({ id: `cant-${idx}`, lat: c.lat, lng: c.lng }),
  lat: c.lat || 25.60,
  lng: c.lng || 85.10,
  distance: "1.5 km",
  details: "CSD Canteen facility."
}));

export const FACILITIES: Facility[] = [
  ...mappedSchools,
  ...mappedHospitals,
  ...mappedCanteens
];

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
