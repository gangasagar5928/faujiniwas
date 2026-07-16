export interface Property {
  id: string;
  title: string;
  rent: number;
  commute: string; // e.g. "21 m" (commute time in mins or distance in m)
  size: string;    // e.g. "38 m" (square size or dimensions)
  amenities: string; // e.g. "Parking"
  image: string;     // URL
  coord: { x: number; y: number }; // Percentage coordinate on SVG map (0-100)
  type: "1 BHK" | "2 BHK" | "3 BHK" | "PG/Room" | "Bungalow";
  cantonment: string;
  rating: number;
  description: string;
  suitableRanks: string[]; // e.g. ["Sepoy", "Havildar", "Major", "Captain", "Colonel", "General"]
  isFavorite?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: "school" | "hospital" | "station";
  coord: { x: number; y: number }; // Percentage coordinate on SVG map (0-100)
  distance: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface RankHRAInfo {
  rank: string;
  minBasicPay: number;
  maxBasicPay: number;
  hraRateY: number; // 18% or 20%
}
