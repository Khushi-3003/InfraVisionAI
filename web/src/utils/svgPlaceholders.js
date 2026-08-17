// Clean SVG Vector Graphic Generator for InfraVision AI Public Infrastructure Defect Illustrations
// Replaces external stock photo dependencies with guaranteed high-clarity vector diagrams.

export function getDefectSvg(defectName, type = 'before') {
  const name = (defectName || '').toLowerCase();

  if (name.includes('pothole') || name.includes('road') || name.includes('asphalt')) {
    if (type === 'after') {
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="0" y="160" width="800" height="260" fill="#334155"/>
          <line x1="0" y1="290" x2="800" y2="290" stroke="#f59e0b" stroke-dasharray="40 25" stroke-width="8"/>
          <ellipse cx="400" cy="310" rx="140" ry="60" fill="#475569" stroke="#10b981" stroke-width="4"/>
          <circle cx="400" cy="310" r="8" fill="#10b981"/>
          <rect x="250" y="40" width="300" height="80" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
          <text x="400" y="72" text-anchor="middle" fill="#047857" font-size="20" font-family="sans-serif" font-weight="800">✅ REPAIR VERIFIED (BBMP ROAD WORK)</text>
          <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Cold-Mix Asphalt Compacted &amp; Carriageway Restored</text>
        </svg>
      `)}`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect x="0" y="160" width="800" height="260" fill="#334155"/>
        <line x1="0" y1="290" x2="800" y2="290" stroke="#f59e0b" stroke-dasharray="40 25" stroke-width="8"/>
        <ellipse cx="400" cy="310" rx="140" ry="60" fill="#0f172a" stroke="#dc2626" stroke-width="6"/>
        <path d="M 290 300 Q 400 350 510 300" stroke="#ef4444" stroke-width="4" fill="none"/>
        <rect x="230" y="40" width="340" height="85" rx="12" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
        <text x="400" y="72" text-anchor="middle" fill="#dc2626" font-size="20" font-family="sans-serif" font-weight="800">⚠️ ROAD DEFECT DETECTED</text>
        <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Severe Asphalt Crater &amp; Pothole (Depth ~12cm)</text>
      </svg>
    `)}`;
  }

  if (name.includes('light') || name.includes('lamp') || name.includes('electrical')) {
    if (type === 'after') {
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="385" y="160" width="30" height="300" fill="#64748b"/>
          <path d="M 400 160 C 400 90, 520 90, 550 150" fill="none" stroke="#64748b" stroke-width="16"/>
          <polygon points="530,150 570,150 550,190" fill="#f59e0b"/>
          <circle cx="550" cy="180" r="45" fill="#fef08a" opacity="0.8"/>
          <rect x="230" y="40" width="340" height="85" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
          <text x="400" y="72" text-anchor="middle" fill="#047857" font-size="20" font-family="sans-serif" font-weight="800">✅ LED STREETLIGHT REPAIRED</text>
          <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">BESCOM Module Replacement Completed</text>
        </svg>
      `)}`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect x="385" y="160" width="30" height="300" fill="#64748b"/>
        <path d="M 400 160 C 400 90, 520 90, 550 150" fill="none" stroke="#64748b" stroke-width="16"/>
        <polygon points="530,150 570,150 550,190" fill="#475569"/>
        <circle cx="550" cy="180" r="30" fill="#ef4444" opacity="0.3"/>
        <line x1="530" y1="160" x2="570" y2="200" stroke="#dc2626" stroke-width="6"/>
        <line x1="570" y1="160" x2="530" y2="200" stroke="#dc2626" stroke-width="6"/>
        <rect x="220" y="40" width="360" height="85" rx="12" fill="#fffbebf1" stroke="#fde68a" stroke-width="2"/>
        <text x="400" y="72" text-anchor="middle" fill="#b45309" font-size="20" font-family="sans-serif" font-weight="800">⚠️ ELECTRICAL DEFECT DETECTED</text>
        <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Flickering Streetlight &amp; Driver Module Failure</text>
      </svg>
    `)}`;
  }

  if (name.includes('drain') || name.includes('silt') || name.includes('sewer')) {
    if (type === 'after') {
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="150" y="240" width="500" height="180" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="6"/>
          <rect x="200" y="240" width="400" height="180" fill="#f1f5f9"/>
          <path d="M 200 320 Q 400 300 600 320 L 600 420 L 200 420 Z" fill="#0284c7" opacity="0.7"/>
          <rect x="220" y="40" width="360" height="85" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
          <text x="400" y="72" text-anchor="middle" fill="#047857" font-size="20" font-family="sans-serif" font-weight="800">✅ DRAIN DESILTED &amp; CLEARED</text>
          <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">BBMP Sanitation Unit Jetting Completed</text>
        </svg>
      `)}`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect x="150" y="240" width="500" height="180" fill="#94a3b8" stroke="#64748b" stroke-width="6"/>
        <rect x="200" y="240" width="400" height="180" fill="#334155"/>
        <path d="M 200 280 Q 400 230 600 280 L 600 420 L 200 420 Z" fill="#78350f" opacity="0.9"/>
        <circle cx="350" cy="310" r="18" fill="#dc2626"/>
        <circle cx="450" cy="330" r="22" fill="#dc2626"/>
        <rect x="210" y="40" width="380" height="85" rx="12" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
        <text x="400" y="72" text-anchor="middle" fill="#dc2626" font-size="20" font-family="sans-serif" font-weight="800">⚠️ STORMWATER DRAIN OVERFLOW</text>
        <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Severe Plastic Clog &amp; Blackwater Accumulation</text>
      </svg>
    `)}`;
  }

  if (name.includes('footpath') || name.includes('paver') || name.includes('walk')) {
    if (type === 'after') {
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="100" y="200" width="600" height="220" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="6"/>
          <line x1="250" y1="200" x2="250" y2="420" stroke="#94a3b8" stroke-width="4"/>
          <line x1="400" y1="200" x2="400" y2="420" stroke="#94a3b8" stroke-width="4"/>
          <line x1="550" y1="200" x2="550" y2="420" stroke="#94a3b8" stroke-width="4"/>
          <rect x="220" y="40" width="360" height="85" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
          <text x="400" y="72" text-anchor="middle" fill="#047857" font-size="20" font-family="sans-serif" font-weight="800">✅ SIDEWALK SLABS REPLACED</text>
          <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Pedestrian Pathway Restored Smooth &amp; Safe</text>
        </svg>
      `)}`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect x="100" y="200" width="600" height="220" fill="#cbd5e1" stroke="#94a3b8" stroke-width="6"/>
        <rect x="320" y="240" width="160" height="140" fill="#0f172a" stroke="#dc2626" stroke-width="4"/>
        <line x1="320" y1="240" x2="480" y2="380" stroke="#ef4444" stroke-width="4"/>
        <rect x="220" y="40" width="360" height="85" rx="12" fill="#fff7ed" stroke="#ffedd5" stroke-width="2"/>
        <text x="400" y="72" text-anchor="middle" fill="#c2410c" font-size="20" font-family="sans-serif" font-weight="800">⚠️ BROKEN FOOTPATH SLAB</text>
        <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">Dislodged Concrete Paver &amp; Pedestrian Hazard</text>
      </svg>
    `)}`;
  }

  // Default Water Pipeline / General Asset
  if (type === 'after') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <rect x="100" y="280" width="600" height="80" fill="#475569"/>
        <rect x="360" y="260" width="80" height="120" fill="#059669" stroke="#10b981" stroke-width="4"/>
        <rect x="220" y="40" width="360" height="85" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
        <text x="400" y="72" text-anchor="middle" fill="#047857" font-size="20" font-family="sans-serif" font-weight="800">✅ PIPELINE CLAMP REPAIR COMPLETE</text>
        <text x="400" y="100" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">BWSSB Water Main Sealed &amp; Pressure Normal</text>
      </svg>
    `)}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <rect x="100" y="280" width="600" height="80" fill="#475569"/>
      <path d="M 400 280 Q 370 140 400 120 Q 430 140 400 280" fill="#0284c7" opacity="0.85"/>
      <rect x="220" y="35" width="360" height="85" rx="12" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
      <text x="400" y="67" text-anchor="middle" fill="#dc2626" font-size="20" font-family="sans-serif" font-weight="800">⚠️ WATER MAIN BURST LEAK</text>
      <text x="400" y="95" text-anchor="middle" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="600">High-Pressure BWSSB Supply Pipe Discharge</text>
    </svg>
  `)}`;
}
