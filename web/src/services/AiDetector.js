import { detectBBMPWard } from '../data/bengaluruWards';

// Simulated & Smart Pattern Vision Classifier for Public Infrastructure Defect Detection
export async function analyzeInfrastructureImage(fileOrUrl, coordinates = [12.9260, 77.6762], manualDefectType = null) {
  // Simulate AI deep learning inference latency (1.2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1200));

  const ward = detectBBMPWard(coordinates[0], coordinates[1]);

  // Defect library presets
  const defectCatalog = [
    {
      category: "Road Infrastructure",
      type: "Severe Asphalt Pothole & Craters",
      severityRange: [65, 95],
      hazard: "Critical",
      priority: "P1",
      team: "BBMP Asphalt & Road Repair Rapid Unit",
      repairTime: "6 Hours",
      confidence: "98.4%",
      description: "Detected deep structural road depression (depth ~12cm). Potential severe risk to 2-wheelers and traffic flow on primary arterial corridor."
    },
    {
      category: "Electrical Infrastructure",
      type: "Flickering & Exposed Cable Streetlight",
      severityRange: [45, 75],
      hazard: "High",
      priority: "P2",
      team: "BESCOM Streetlight Maintenance Wing",
      repairTime: "12 Hours",
      confidence: "96.1%",
      description: "Intermittent LED driver failure and exposed wiring at base panel. Dark spot creation causing pedestrian safety hazard at night."
    },
    {
      category: "Drainage & Sewerage",
      type: "Overflowing Stormwater Drain & Waste Blockage",
      severityRange: [70, 98],
      hazard: "Critical",
      priority: "P1",
      team: "BBMP Sanitation & Heavy Silt Clearing Crew",
      repairTime: "4 Hours",
      confidence: "99.1%",
      description: "Severe silt buildup and solid waste accumulation causing wastewater overflow onto public carriageway. High health hazard."
    },
    {
      category: "Pedestrian Infrastructure",
      type: "Broken Footpath & Missing Paver Blocks",
      severityRange: [35, 65],
      hazard: "Medium",
      priority: "P3",
      team: "BBMP Civic Works & Sidewalk Maintenance",
      repairTime: "24 Hours",
      confidence: "94.8%",
      description: "Dislodged concrete slab and missing paver blocks over 4 meters. High trip hazard for elderly pedestrians."
    },
    {
      category: "Water Infrastructure",
      type: "High-Pressure Water Pipeline Leakage",
      severityRange: [80, 99],
      hazard: "Critical",
      priority: "P1",
      team: "BWSSB Water Supply Emergency Response",
      repairTime: "3 Hours",
      confidence: "97.9%",
      description: "Ruptured underground main pipeline discharging potability-grade water onto roadway. Soil erosion risk under pavement."
    },
    {
      category: "Bridges & Overpasses",
      type: "Flyover Concrete Spalling & Joint Damage",
      severityRange: [50, 85],
      hazard: "High",
      priority: "P2",
      team: "BBMP Structural Engineering & Bridge Cell",
      repairTime: "48 Hours",
      confidence: "95.3%",
      description: "Concrete spalling on underside pier bracket and damaged expansion joint rubber seal."
    }
  ];

  // Pick defect based on manual selector or intelligent random hash from filename/url
  let selected = defectCatalog[0];
  if (manualDefectType) {
    const matched = defectCatalog.find(d => d.category.toLowerCase().includes(manualDefectType.toLowerCase()) || d.type.toLowerCase().includes(manualDefectType.toLowerCase()));
    if (matched) selected = matched;
  } else if (fileOrUrl && typeof fileOrUrl === 'string') {
    const str = fileOrUrl.toLowerCase();
    if (str.includes('light') || str.includes('lamp') || str.includes('pole')) selected = defectCatalog[1];
    else if (str.includes('drain') || str.includes('water') || str.includes('sewer') || str.includes('flood')) selected = defectCatalog[2];
    else if (str.includes('path') || str.includes('tile') || str.includes('walk')) selected = defectCatalog[3];
    else if (str.includes('pipe') || str.includes('leak')) selected = defectCatalog[4];
    else if (str.includes('bridge') || str.includes('crack') || str.includes('pillar')) selected = defectCatalog[5];
    else selected = defectCatalog[0];
  } else {
    // Select based on current time mod catalog length for realistic variety
    selected = defectCatalog[Math.floor(Math.random() * defectCatalog.length)];
  }

  // Calculate random severity score within range
  const severityScore = Math.floor(Math.random() * (selected.severityRange[1] - selected.severityRange[0] + 1)) + selected.severityRange[0];

  return {
    category: selected.category,
    defectName: selected.type,
    severityScore: severityScore,
    hazardLevel: selected.hazard,
    priorityCode: selected.priority,
    recommendedTeam: selected.team,
    estimatedRepairHours: selected.repairTime,
    aiConfidence: selected.confidence,
    aiDescription: selected.description,
    detectedWard: ward,
    coordinates: coordinates
  };
}
