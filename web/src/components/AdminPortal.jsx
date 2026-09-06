import React, { useState } from 'react';
import { 
  Shield, MapPin, Users, CheckCircle2, Clock, AlertTriangle, 
  Filter, Search, ArrowUpRight, HardHat, ChevronRight, BarChart3, Building2, Sparkles, Bus, AlertOctagon, Activity, Zap, TrendingUp, Compass, AlertCircle
} from 'lucide-react';
import MapView from './MapView';
import { BENGALURU_WARDS } from '../data/bengaluruWards';

const FIELD_WORKER_TEAMS = [
  "BBMP Asphalt & Road Repair Rapid Unit #1",
  "BBMP Asphalt & Road Repair Rapid Unit #2",
  "BESCOM Streetlight Maintenance Wing",
  "BBMP Sanitation & Heavy Silt Clearing Crew",
  "BWSSB Water Supply Emergency Response",
  "BBMP Civic Works & Sidewalk Maintenance",
  "BBMP Structural Engineering & Bridge Cell",
  "Bengaluru Traffic Police & Road Marking Cell",
  "BBMP Traffic Engineering & Median Maintenance"
];

// Origin-Destination (O-D) Traffic Route Delay Matrix
const ROUTE_DELAY_ANALYTICS = [
  { corridor: "Silk Board ➔ Marathahalli (ORR)", delay: "+14 mins", congestion: "Heavy Bottleneck", avgSpeed: "18 km/h", status: "Critical Red" },
  { corridor: "HSR Layout ➔ Agara Junction", delay: "+6 mins", congestion: "Moderate Flow", avgSpeed: "32 km/h", status: "Moderate Amber" },
  { corridor: "Marathahalli ➔ HAL Airport Rd", delay: "+4 mins", congestion: "Free Flowing", avgSpeed: "44 km/h", status: "Normal Green" },
  { corridor: "Indiranagar 100ft ➔ Hebbal Flyover", delay: "+11 mins", congestion: "Heavy Bottleneck", avgSpeed: "22 km/h", status: "Critical Red" }
];

// City-Wide Infrastructure Deficiency Matrix
const INFRA_DEFICIENCY_STATS = [
  { title: "Severe Road Potholes & Craters", count: 42, priority: "P1", action: "Rapid Asphalt Patching Required" },
  { title: "Faded / Missing Zebra Crossings", count: 18, priority: "P2", action: "Thermoplastic Paint Renewal" },
  { title: "Missing Median Dividers", count: 11, priority: "P1", action: "Concrete Median Installation" },
  { title: "Monsoon Waterlogged Corridors", count: 8, priority: "P1", action: "Stormwater Pump Deployment" },
  { title: "Damaged / Missing Signboards", count: 15, priority: "P3", action: "Signpost Replacement" }
];

export default function AdminPortal({ issues, onAssignTeam, onUpdateStatus, t }) {
  const ta = t.admin; // Admin translation strings

  const [selectedWardFilter, setSelectedWardFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("ALL"); // ALL, CITIZEN, BUS
  const [mapModeView, setMapModeView] = useState("GIS_DEFECTS"); // GIS_DEFECTS vs HEATMAP
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState("");

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesWard = selectedWardFilter === "ALL" || issue.ward?.id === selectedWardFilter;
    const matchesStatus = selectedStatusFilter === "ALL" || issue.status === selectedStatusFilter;
    
    let matchesSource = true;
    const isBusIssue = issue.reportedBy?.includes('BMTC') || issue.id?.startsWith('BUS-') || issue.title?.includes('Smart Bus') || issue.title?.includes('Sensing');
    if (selectedSourceFilter === 'BUS') matchesSource = isBusIssue;
    if (selectedSourceFilter === 'CITIZEN') matchesSource = !isBusIssue;

    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.defectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWard && matchesStatus && matchesSource && matchesSearch;
  });

  const pendingCount = issues.filter(i => i.status === 'Pending').length;
  const progressCount = issues.filter(i => i.status === 'In Progress').length;
  const completedCount = issues.filter(i => i.status === 'Completed').length;
  const busScannedCount = issues.filter(i => i.reportedBy?.includes('BMTC') || i.id?.startsWith('BUS-') || i.title?.includes('Smart Bus') || i.title?.includes('Sensing')).length;

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedIssueModal || !assigningTeam) return;

    onAssignTeam(selectedIssueModal.id, assigningTeam);
    setSelectedIssueModal(null);
    setAssigningTeam("");
  };

  return (
    <div className="space-y-8">
      
      {/* Admin Control Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-purple-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white shadow-sm rounded-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-1">
            <Shield className="w-4 h-4" /> Centralized Urban Intelligence Platform
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Bengaluru Urban Infrastructure & Fleet Intelligence</h2>
          <p className="text-sm text-slate-600 mt-1">
            Aggregates telemetry from BMTC Mobile Urban Sensing Units and citizen reports. Visualizes spatial GIS defects, congestion heatmaps, Origin-Destination route delays, and ANPR incidents.
          </p>
        </div>

        {busScannedCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2 shadow-2xs">
            <Bus className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>{busScannedCount} Mobile Urban Sensing Unit Dispatches</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-t-4 border-t-blue-600 bg-white shadow-xs rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{ta.totalDefects}</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{issues.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{ta.totalSub}</span>
        </div>

        <div className="glass-panel p-5 border-t-4 border-t-red-600 bg-white shadow-xs rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{ta.pendingOpen}</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-3xl font-extrabold text-red-600">{pendingCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{ta.pendingSub}</span>
        </div>

        <div className="glass-panel p-5 border-t-4 border-t-amber-500 bg-white shadow-xs rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{ta.inProgressTasks}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-extrabold text-amber-600">{progressCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{ta.progressSub}</span>
        </div>

        <div className="glass-panel p-5 border-t-4 border-t-emerald-600 bg-white shadow-xs rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{ta.completedRepairs}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">{completedCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{ta.completedSub}</span>
        </div>
      </div>

      {/* Interactive GIS Map & Congestion Heatmap View */}
      <div className="glass-panel p-6 space-y-4 bg-white shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              BBMP Municipal GIS & Fleet Intelligence Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time spatial mapping of citizen reports, mobile bus sensing units, and traffic heatmaps
            </p>
          </div>

          {/* View Mode Toggle (GIS Pins vs Heatmap) & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* GIS vs Heatmap Toggle Button */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapModeView("GIS_DEFECTS")}
                className={`px-3 py-1 rounded-md transition-all ${mapModeView === 'GIS_DEFECTS' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'}`}
              >
                🗺️ GIS Defect Pins
              </button>
              <button
                type="button"
                onClick={() => setMapModeView("HEATMAP")}
                className={`px-3 py-1 rounded-md transition-all ${mapModeView === 'HEATMAP' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'}`}
              >
                🔥 Congestion Heatmap
              </button>
            </div>

            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 shadow-2xs font-semibold"
            >
              <option value="ALL">All Sources (Citizen + Smart Bus)</option>
              <option value="CITIZEN">Citizen Reports Only</option>
              <option value="BUS">BMTC Smart Bus Scans Only</option>
            </select>

            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 shadow-2xs font-semibold"
            >
              <option value="ALL">{ta.allWards}</option>
              {BENGALURU_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  Ward {w.number}: {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap Notice Banner */}
        {mapModeView === 'HEATMAP' && (
          <div className="p-3 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 text-xs font-semibold text-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600 animate-pulse" />
              <span><strong>Traffic Congestion Heat Map Active:</strong> Red zones represent heavy vehicle bottlenecks detected by BMTC fleet sensing units.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-red-600"><span className="w-2.5 h-2.5 rounded-full bg-red-600"/> Bottleneck</span>
              <span className="flex items-center gap-1 font-bold text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"/> Moderate</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"/> Free Flow</span>
            </div>
          </div>
        )}

        {/* Map Render */}
        <MapView 
          issues={filteredIssues} 
          height="450px"
        />
      </div>

      {/* Urban Analytics: Origin-Destination Traffic Delays & Infrastructure Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Origin-Destination (O-D) Route Delays (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 bg-white shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Origin-Destination (O-D) Traffic Flow & Route Delays
                </h3>
                <p className="text-[11px] text-slate-500">Live transit corridor delay estimations from BMTC fleet telemetry</p>
              </div>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Fleet Telemetry
              </span>
            </div>

            <div className="space-y-2.5">
              {ROUTE_DELAY_ANALYTICS.map((route, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900">{route.corridor}</strong>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span>Flow: <strong className="text-slate-700">{route.congestion}</strong></span>
                      <span>Avg Speed: <strong className="text-blue-700">{route.avgSpeed}</strong></span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${route.status.includes('Red') ? 'bg-red-100 text-red-800 border border-red-300' : route.status.includes('Amber') ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                    {route.delay}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure Deficiency Matrix (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 bg-white shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  City-Wide Infrastructure Deficiency Matrix
                </h3>
                <p className="text-[11px] text-slate-500">Aggregated defect deficiencies across all BBMP Municipal Wards</p>
              </div>
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Action Matrix
              </span>
            </div>

            <div className="space-y-2.5">
              {INFRA_DEFICIENCY_STATS.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.action}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-extrabold text-blue-700 block leading-tight">{item.count}</span>
                    <span className="badge badge-priority-p1">{item.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Issues Table & Worker Assignment List */}
      <div className="glass-panel p-6 space-y-4 bg-white shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {ta.reportsTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {ta.reportsSub}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={ta.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Issues List Cards */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-700">{ta.noIssuesFound}</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isBusScan = issue.reportedBy?.includes('BMTC') || issue.id?.startsWith('BUS-') || issue.title?.includes('Smart Bus') || issue.title?.includes('Sensing');

              return (
                <div 
                  key={issue.id} 
                  className={`glass-panel p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border bg-white hover:border-slate-300 transition-all rounded-xl ${isBusScan ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'}`}
                >
                  {/* Photo & Main Details */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img 
                        src={issue.status === 'Completed' && issue.afterImage ? issue.afterImage : issue.beforeImage} 
                        alt={issue.title} 
                        className="w-full h-full object-contain p-1" 
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`badge ${issue.status === 'Pending' ? 'badge-pending' : issue.status === 'In Progress' ? 'badge-progress' : 'badge-completed'}`}>
                          {issue.status === 'Pending' ? ta.statusPending : issue.status === 'In Progress' ? ta.statusProgress : ta.statusCompleted}
                        </span>
                        
                        {isBusScan && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Bus className="w-3 h-3" /> BMTC Mobile Sensing Unit
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-blue-700 font-semibold">{issue.id}</span>
                        <span className="text-[11px] text-slate-500">Prio: <strong className="text-red-600">{issue.priorityCode}</strong></span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900">{issue.title}</h4>
                      <p className="text-xs text-blue-700 font-semibold">{issue.defectName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        Ward {issue.ward?.number} ({issue.ward?.name}) • {issue.address}
                      </p>
                    </div>
                  </div>

                  {/* AI Severity & Worker Assignment Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold text-slate-700">
                        AI Severity: <span className="text-amber-600 font-bold">{issue.severityScore}%</span> ({issue.hazardLevel})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ta.assignedCrew} <strong className="text-blue-800">{issue.assignedTeam || ta.notAssigned}</strong>
                      </div>
                    </div>

                    {/* Assign Team Button */}
                    <div>
                      {issue.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            setSelectedIssueModal(issue);
                            setAssigningTeam(issue.category.includes('Road') ? FIELD_WORKER_TEAMS[0] : FIELD_WORKER_TEAMS[2]);
                          }}
                          className="btn-primary text-xs py-2 px-4 shadow-sm"
                        >
                          <HardHat className="w-4 h-4" />
                          {ta.assignBtn}
                        </button>
                      ) : issue.status === 'In Progress' ? (
                        <button
                          onClick={() => setSelectedIssueModal(issue)}
                          className="btn-secondary text-xs py-2 px-4 text-amber-800 border-amber-300 bg-amber-50/50"
                        >
                          <Clock className="w-4 h-4 text-amber-600" />
                          {ta.reassignBtn}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedIssueModal(issue)}
                          className="btn-secondary text-xs py-2 px-4 text-emerald-800 border-emerald-300 bg-emerald-50/50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {ta.viewProofBtn}
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assign Worker Modal */}
      {selectedIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 border border-slate-200 bg-white space-y-5 animate-fadeIn shadow-2xl rounded-xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-600" />
                {ta.modalTitle}
              </h3>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-blue-700 font-bold uppercase">{selectedIssueModal.id}</span>
                <h4 className="font-bold text-slate-900 text-sm">{selectedIssueModal.title}</h4>
                <p className="text-xs text-slate-600">{selectedIssueModal.address}</p>
                <p className="text-xs text-blue-700 font-semibold">Ward {selectedIssueModal.ward?.number}: {selectedIssueModal.ward?.name}</p>
              </div>

              {/* Photo comparisons if completed */}
              {selectedIssueModal.status === 'Completed' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Before Image:</span>
                    <img src={selectedIssueModal.beforeImage} alt="Before" className="h-28 w-full object-contain bg-slate-50 rounded-lg border border-slate-200 p-1" />
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block mb-1">Resolved Proof:</span>
                    <img src={selectedIssueModal.afterImage} alt="After" className="h-28 w-full object-contain bg-slate-50 rounded-lg border border-emerald-400 p-1" />
                  </div>
                </div>
              )}

              {selectedIssueModal.status !== 'Completed' && (
                <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      {ta.selectCrewLabel}
                    </label>
                    <select
                      value={assigningTeam}
                      onChange={(e) => setAssigningTeam(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-lg p-2.5 focus:outline-none focus:border-blue-600"
                      required
                    >
                      {FIELD_WORKER_TEAMS.map((team, idx) => (
                        <option key={idx} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary justify-center py-2.5 text-xs font-bold"
                  >
                    {ta.confirmAssignBtn}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
