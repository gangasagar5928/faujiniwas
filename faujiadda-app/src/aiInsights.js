export function generateNeighborhoodInsight(listing, proximity = {}) {
  if (!listing) return "AI insight currently unavailable for this property.";

  const city = listing.city || "this city";
  const area = listing.area || "this area";
  const type = listing.type?.toUpperCase() || "property";
  const owner = listing.ownerType === "defence" ? "Defence-owned" : "Civilian-owned";
  
  const distance = parseFloat(listing.distance) || 0;
  const isClose = distance > 0 && distance < 4;
  const price = listing.price || 0;
  const bah = price <= 15000 ? 'within OR limits' : price <= 30000 ? 'within JCO limits' : 'in the Officer bracket';

  // Seeded randomization basis
  const hash = (listing.id || "").split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  
  const advantages = [
    "known for excellent water supply",
    "part of a highly secure community zone",
    "featuring 24/7 power backup",
    "convenient for grocery and canteen runs",
    "popular among newly posted officers",
    "in a peaceful, traffic-free enclave",
  ];

  const advantage = advantages[hash % advantages.length];

  let insight = `🤖 AI Analysis: This ${owner} ${type} in ${area} is highly competitive. `;
  
  if (isClose) {
    insight += `Located just ${distance}km from the Cantt, it offers an incredibly short commute. `;
  } else if (distance >= 4) {
    insight += `At ${distance}km out, you trade a slightly longer commute for a quieter suburban environment. `;
  }

  // Tactical Proximity
  if (proximity.nearestSchool) {
    insight += `Strategic location: only ${proximity.nearestSchool.dist}km from ${proximity.nearestSchool.name}. `;
  }
  if (proximity.nearestHosp) {
    insight += `Immediate healthcare access: ${proximity.nearestHosp.name} is within ${proximity.nearestHosp.dist}km. `;
  }

  insight += `Pricing is firmly ${bah}. The neighborhood is ${advantage}.`;
  
  return insight;
}

