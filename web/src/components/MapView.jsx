import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertCircle, ShieldAlert, CheckCircle2, User, HardHat, Sparkles } from 'lucide-react';
import { detectBBMPWard } from '../data/bengaluruWards';

// Custom Leaflet Icons for Red (Pending), Yellow (In Progress), and Green (Completed)
function createCustomIcon(status) {
  let colorClass = 'pending';
  if (status === 'In Progress') colorClass = 'progress';
  if (status === 'Completed') colorClass = 'completed';

  const html = `<div class="custom-map-marker"><div class="marker-dot ${colorClass}"></div></div>`;
  
  return L.divIcon({
    html: html,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Selector icon for picking location (High-clarity blue pin)
const pickerIcon = L.divIcon({
  html: `<div style="color: #0284c7; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.4));"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#0284c7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3.5" fill="#ffffff"/></svg></div>`,
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

// Helper component to handle map click in picker mode
function MapClickHandler({ onLocationSelect, isPickerActive }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        const lat = parseFloat(e.latlng.lat.toFixed(5));
        const lng = parseFloat(e.latlng.lng.toFixed(5));
        const ward = detectBBMPWard(lat, lng);
        onLocationSelect([lat, lng], ward);
      }
    }
  });
  return null;
}

// Auto Recenter helper with high-clarity zoom
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ 
  issues = [], 
  selectedLocation = null, 
  onLocationSelect = null, 
  isPickerActive = false,
  center = [12.9716, 77.5946],
  height = "500px" 
}) {

  return (
    <div style={{ height: height, width: '100%' }} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md">
      
      {/* Picker Helper Banner */}
      {isPickerActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-full border border-blue-400 backdrop-blur-md shadow-xl flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Click anywhere on the map to adjust exact pin location
        </div>
      )}

      {/* Map Legend Banner */}
      <div className="absolute bottom-3 right-3 z-[1000] glass-panel px-3.5 py-2 text-xs flex items-center gap-3 border border-slate-200 shadow-md bg-white/95 text-slate-800 rounded-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />
          <span className="text-slate-800 font-bold">Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_6px_#d97706]" />
          <span className="text-slate-800 font-bold">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_6px_#059669]" />
          <span className="text-slate-800 font-bold">Solved</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap center={selectedLocation || center} />
        <MapClickHandler onLocationSelect={onLocationSelect} isPickerActive={isPickerActive} />

        {/* Selected Pin preview for Picker */}
        {selectedLocation && (
          <Marker position={selectedLocation} icon={pickerIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-blue-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Geotagged Pin Location
                </p>
                <p className="text-slate-700 font-mono mt-1 font-semibold">
                  {selectedLocation[0]}, {selectedLocation[1]}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Existing Issues Pins (Red, Yellow, Green) */}
        {!isPickerActive && issues.map((issue) => {
          let badgeStyle = "badge-pending";
          if (issue.status === 'In Progress') badgeStyle = "badge-progress";
          if (issue.status === 'Completed') badgeStyle = "badge-completed";

          return (
            <Marker 
              key={issue.id} 
              position={issue.coordinates}
              icon={createCustomIcon(issue.status)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-64 p-1">
                  {/* Photo preview */}
                  <div className="relative h-28 rounded-lg overflow-hidden mb-2 bg-slate-50 border border-slate-200">
                    <img 
                      src={issue.status === 'Completed' && issue.afterImage ? issue.afterImage : issue.beforeImage} 
                      alt={issue.title} 
                      className="w-full h-full object-contain p-1"
                    />
                    <span className={`absolute top-2 right-2 badge ${badgeStyle}`}>
                      {issue.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{issue.title}</h4>
                  <p className="text-xs text-blue-700 font-semibold mb-1">{issue.defectName}</p>

                  <div className="space-y-1 text-[11px] text-slate-700 mt-2 border-t border-slate-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">BBMP Ward:</span>
                      <span className="font-bold text-slate-900">Ward {issue.ward?.number} ({issue.ward?.name})</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">AI Severity:</span>
                      <span className="font-bold text-amber-600">{issue.severityScore}% ({issue.hazardLevel})</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Priority:</span>
                      <span className="font-bold text-red-600">{issue.priorityCode}</span>
                    </div>

                    {issue.assignedTeam && (
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Assigned Team:</span>
                        <span className="text-blue-800 font-semibold text-[10px] text-right max-w-[130px] truncate">{issue.assignedTeam}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}
