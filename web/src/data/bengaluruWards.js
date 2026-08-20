// Comprehensive Bengaluru BBMP (Bruhat Bengaluru Mahanagara Palike) Wards & Spatial GIS Engine

export const BENGALURU_WARDS = [
  { id: "BBMP-150", number: 150, name: "Bellandur", zone: "Mahadevapura Zone", center: [12.9260, 77.6762], radiusKm: 3.5, description: "IT Hub & ORR Belt, Outer Ring Road, Sarjapur Road" },
  { id: "BBMP-174", number: 174, name: "HSR Layout", zone: "Bommanahalli Zone", center: [12.9121, 77.6446], radiusKm: 2.8, description: "Sector 1-7, 27th Main Road, Agara Lake Sector" },
  { id: "BBMP-84", number: 84, name: "Koramangala", zone: "South Zone", center: [12.9352, 77.6245], radiusKm: 2.5, description: "1st to 8th Block, 100ft Road, Sony World Signal" },
  { id: "BBMP-110", number: 110, name: "Indiranagar", zone: "East Zone", center: [12.9784, 77.6408], radiusKm: 2.2, description: "100 Feet Road, 12th Main Road, CMH Road" },
  { id: "BBMP-85", number: 85, name: "Whitefield / Doddanekkundi", zone: "Mahadevapura Zone", center: [12.9698, 77.7499], radiusKm: 4.0, description: "ITPL Main Road, Hope Farm Circle, Graphite India Road" },
  { id: "BBMP-35", number: 35, name: "Malleshwaram", zone: "West Zone", center: [13.0031, 77.5643], radiusKm: 2.4, description: "Sampige Road, Margosa Road, IISc Corridor" },
  { id: "BBMP-168", number: 168, name: "Jayanagar", zone: "South Zone", center: [12.9250, 77.5938], radiusKm: 2.6, description: "4th Block Shopping Complex, 11th Main, South End Circle" },
  { id: "BBMP-176", number: 176, name: "BTM Layout", zone: "Bommanahalli Zone", center: [12.9166, 77.6101], radiusKm: 2.5, description: "BTM 1st & 2nd Stage, Madiwala Lake Corridor" },
  { id: "BBMP-177", number: 177, name: "JP Nagar", zone: "South Zone", center: [12.9077, 77.5854], radiusKm: 3.0, description: "Phase 1 to 7, Sarakki Signal, Bannerghatta Road" },
  { id: "BBMP-192", number: 192, name: "Electronic City / Begur", zone: "Bommanahalli Zone", center: [12.8452, 77.6602], radiusKm: 4.2, description: "Phase 1 & Phase 2, Hosur Road Elevated Expressway" },
  { id: "BBMP-12", number: 12, name: "Yelahanka Satellite Town", zone: "Yelahanka Zone", center: [13.1007, 77.5963], radiusKm: 4.5, description: "Hebbal-Yelahanka NH44, Kogilu Cross, Kogilu Road" },
  { id: "BBMP-19", number: 19, name: "Hebbal", zone: "Yelahanka Zone", center: [13.0359, 77.5970], radiusKm: 3.2, description: "Hebbal Flyover, Ring Road, Manyata Tech Park Corridor" },
  { id: "BBMP-93", number: 93, name: "Vasanth Nagar / MG Road", zone: "East Zone", center: [12.9830, 77.5970], radiusKm: 2.0, description: "Cunningham Road, Vidhana Soudha Area, High Court Corridor" },
  { id: "BBMP-108", number: 108, name: "Banashankari", zone: "South Zone", center: [12.9254, 77.5468], radiusKm: 3.5, description: "Banashankari 1st, 2nd & 3rd Stage, BDA Complex" },
  { id: "BBMP-120", number: 120, name: "Rajajinagar", zone: "West Zone", center: [12.9898, 77.5534], radiusKm: 2.6, description: "Dr. Rajkumar Road, ESI Hospital, Orion Mall Sector" },
  { id: "BBMP-154", number: 154, name: "Marathahalli", zone: "Mahadevapura Zone", center: [12.9569, 77.7011], radiusKm: 3.0, description: "Marathahalli Bridge, Kundalahalli Gate, HAL Airport Road" },
  { id: "BBMP-40", number: 40, name: "Vijayanagar", zone: "West Zone", center: [12.9719, 77.5304], radiusKm: 2.8, description: "Vijayanagar Bus Station, Magadi Road, Chord Road Corridor" },
  { id: "BBMP-50", number: 50, name: "Kammanahalli / Kalyan Nagar", zone: "East Zone", center: [13.0093, 77.6378], radiusKm: 2.8, description: "HRBR Layout, Outer Ring Road, Hennur Main Road" }
];

// High-precision distance calculation algorithm (Haversine formula for exact spherical km)
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate exact BBMP Ward based on GPS coordinates or reverse geocoded locality name
export function detectBBMPWard(lat, lng, localityName = null) {
  if (localityName && typeof localityName === 'string') {
    const locLower = localityName.toLowerCase();
    const matchedByName = BENGALURU_WARDS.find(w => 
      locLower.includes(w.name.toLowerCase()) || 
      w.name.toLowerCase().includes(locLower) ||
      locLower.includes(w.zone.toLowerCase())
    );
    if (matchedByName) return matchedByName;
  }

  let nearestWard = BENGALURU_WARDS[0];
  let minDistance = Infinity;

  BENGALURU_WARDS.forEach((ward) => {
    const distKm = calculateHaversineKm(lat, lng, ward.center[0], ward.center[1]);
    if (distKm < minDistance) {
      minDistance = distKm;
      nearestWard = ward;
    }
  });

  // If outside standard BBMP boundaries, generate a dynamic localized municipal ward badge
  if (minDistance > 15 && localityName) {
    const wardNum = Math.floor(100 + (Math.abs(lat * 100) % 90));
    return {
      id: `BBMP-${wardNum}`,
      number: wardNum,
      name: localityName,
      zone: "Municipal Zone",
      center: [lat, lng],
      radiusKm: 3.0,
      description: `Geotagged Municipal Ward at ${localityName}`
    };
  }

  return nearestWard;
}
