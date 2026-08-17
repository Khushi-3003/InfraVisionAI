// Bengaluru BBMP (Bruhat Bengaluru Mahanagara Palike) Wards & Geographical Zones

export const BENGALURU_WARDS = [
  {
    id: "BBMP-150",
    number: 150,
    name: "Bellandur",
    zone: "Mahadevapura Zone",
    center: [12.9260, 77.6762],
    radiusKm: 3.5,
    description: "IT Hub & ORR Belt, Outer Ring Road, Sarjapur Road"
  },
  {
    id: "BBMP-174",
    number: 174,
    name: "HSR Layout",
    zone: "Bommanahalli Zone",
    center: [12.9121, 77.6446],
    radiusKm: 2.8,
    description: "Sector 1-7, 27th Main Road, Agara Lake Sector"
  },
  {
    id: "BBMP-84",
    number: 84,
    name: "Koramangala",
    zone: "South Zone",
    center: [12.9352, 77.6245],
    radiusKm: 2.5,
    description: "1st to 8th Block, 100ft Road, Sony World Signal"
  },
  {
    id: "BBMP-110",
    number: 110,
    name: "Indiranagar (Sampangiram Nagar)",
    zone: "East Zone",
    center: [12.9784, 77.6408],
    radiusKm: 2.2,
    description: "100 Feet Road, 12th Main Road, CMH Road"
  },
  {
    id: "BBMP-85",
    number: 85,
    name: "Doddanekkundi / Whitefield",
    zone: "Mahadevapura Zone",
    center: [12.9698, 77.7499],
    radiusKm: 4.0,
    description: "ITPL Main Road, Hope Farm Circle, Graphite India Road"
  },
  {
    id: "BBMP-35",
    number: 35,
    name: "Aramane Nagar / Malleshwaram",
    zone: "West Zone",
    center: [13.0031, 77.5643],
    radiusKm: 2.4,
    description: "Sampige Road, Margosa Road, IISc Corridor"
  },
  {
    id: "BBMP-168",
    number: 168,
    name: "Pattabhiram Nagar / Jayanagar",
    zone: "South Zone",
    center: [12.9250, 77.5938],
    radiusKm: 2.6,
    description: "4th Block Shopping Complex, 11th Main, South End Circle"
  },
  {
    id: "BBMP-192",
    number: 192,
    name: "Begur / Electronic City",
    zone: "Bommanahalli Zone",
    center: [12.8452, 77.6602],
    radiusKm: 4.2,
    description: "Phase 1 & Phase 2, Hosur Road Elevated Expressway"
  },
  {
    id: "BBMP-12",
    number: 12,
    name: "Yelahanka Satellite Town",
    zone: "Yelahanka Zone",
    center: [13.1007, 77.5963],
    radiusKm: 4.5,
    description: "Hebbal-Yelahanka NH44, Kogilu Cross, Kogilu Road"
  },
  {
    id: "BBMP-93",
    number: 93,
    name: "Vasanth Nagar / MG Road",
    zone: "East Zone",
    center: [12.9830, 77.5970],
    radiusKm: 2.0,
    description: "Cunningham Road, Vidhana Soudha Area, High Court Corridor"
  }
];

// Calculate nearest Bengaluru BBMP Ward from lat, lng
export function detectBBMPWard(lat, lng) {
  let nearestWard = BENGALURU_WARDS[0];
  let minDistance = Infinity;

  BENGALURU_WARDS.forEach((ward) => {
    const dLat = lat - ward.center[0];
    const dLng = lng - ward.center[1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestWard = ward;
    }
  });

  return nearestWard;
}
