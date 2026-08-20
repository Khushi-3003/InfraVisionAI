import React, { useState } from 'react';
import { 
  HardHat, MapPin, CheckCircle2, Clock, Upload, 
  Camera, Navigation, AlertTriangle, Sparkles, FileCheck, ArrowRight, ExternalLink, Copy
} from 'lucide-react';
import MapView from './MapView';
import { getDefectSvg } from '../utils/svgPlaceholders';

// High-clarity vector resolution proof presets
const RESOLVED_PROOF_SAMPLES = [
  {
    name: "Repaired Asphalt Pothole",
    category: "Road Infrastructure",
    svg: getDefectSvg("Road Infrastructure Pothole", "after")
  },
  {
    name: "Clean Desilted Stormwater Drain",
    category: "Drainage & Sewerage",
    svg: getDefectSvg("Overflowing Drain", "after")
  },
  {
    name: "Replaced LED Streetlight Luminaire",
    category: "Electrical Infrastructure",
    svg: getDefectSvg("Flickering Streetlight", "after")
  }
];

export default function WorkerPortal({ issues, onCompleteTask, t }) {
  const tw = t.worker; // Worker translation strings

  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(RESOLVED_PROOF_SAMPLES[0].svg);
  const [workerNotes, setWorkerNotes] = useState("Pothole excavated, cold-mix asphalt compacted with vibratory roller. Carriageway restored and cleared for traffic.");
  const [submitting, setSubmitting] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Filter tasks assigned or available for workers (In Progress or Pending)
  const assignedTasks = issues.filter(i => i.status === 'In Progress' || i.status === 'Pending');
  const completedTasks = issues.filter(i => i.status === 'Completed');

  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResolutionPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!selectedTask || !resolutionPhoto) return;

    setSubmitting(true);

    setTimeout(() => {
      onCompleteTask(selectedTask.id, {
        status: "Completed",
        afterImage: resolutionPhoto,
        workerNotes: workerNotes,
        completedAt: new Date().toLocaleString()
      });
      setSubmitting(false);
      setSelectedTask(null);
    }, 600);
  };

  const handleCopyCoordinates = (lat, lng) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Worker Portal Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white shadow-sm rounded-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1">
            <HardHat className="w-4 h-4" /> {tw.badge}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{tw.title}</h2>
          <p className="text-sm text-slate-600 mt-1">
            {tw.desc}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Task Action & Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Assigned Tasks Inbox (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            {tw.assignedWorkOrders} ({assignedTasks.length})
          </h3>

          {assignedTasks.length === 0 ? (
            <div className="glass-panel p-8 text-center text-sm text-slate-500 space-y-2 bg-white rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-900">{tw.allTasksDone}</p>
              <p className="text-xs">{tw.noPending}</p>
            </div>
          ) : (
            assignedTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setResolutionPhoto(getDefectSvg(task.category, 'after'));
                }}
                className={`glass-panel p-4 cursor-pointer transition-all border bg-white rounded-xl ${selectedTask?.id === task.id ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400/40' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`badge ${task.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`}>
                    {task.status === 'In Progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">{task.id}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  Ward {task.ward?.number} ({task.ward?.name})
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Assigned: <strong className="text-blue-800">{task.assignedTeam || "BBMP Maintenance Crew"}</strong></span>
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    {tw.selectTask} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Site Navigation & Resolution Upload Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTask ? (
            <div className="glass-panel p-6 space-y-6 border border-amber-300 bg-white shadow-sm rounded-xl">
              
              {/* Task Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">{tw.activeAssignment}</span>
                  <h3 className="text-xl font-bold text-slate-900">{selectedTask.title}</h3>
                  <p className="text-xs text-blue-700 font-semibold">{selectedTask.defectName}</p>
                </div>
                <span className="badge badge-priority-p1">
                  Prio {selectedTask.priorityCode}
                </span>
              </div>

              {/* Site Location, GPS Coordinates & Turn-by-Turn Navigation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    {tw.sitePin}
                  </span>
                  <span className="text-xs text-blue-700 font-mono font-bold">
                    GPS: {selectedTask.coordinates[0]}, {selectedTask.coordinates[1]}
                  </span>
                </div>

                <MapView 
                  selectedLocation={selectedTask.coordinates}
                  center={selectedTask.coordinates}
                  height="220px"
                />

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900">{tw.siteAddr}</strong> {selectedTask.address} (BBMP Ward {selectedTask.ward?.number}: {selectedTask.ward?.name})
                </div>

                {/* Direct Google Maps Turn-by-Turn GPS Navigation Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.coordinates[0]},${selectedTask.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 btn-primary py-3 px-4 text-xs font-bold justify-center shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center gap-2 text-white rounded-xl"
                  >
                    <Navigation className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>Start GPS Navigation (Google Maps 🗺️)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-200 ml-auto sm:ml-0" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyCoordinates(selectedTask.coordinates[0], selectedTask.coordinates[1])}
                    className="w-full sm:w-auto btn-secondary text-xs py-3 px-3.5 flex items-center justify-center gap-1.5 shrink-0 rounded-xl"
                    title="Copy GPS coordinates"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copiedCoords ? 'Copied GPS! ✓' : 'Copy GPS Coords'}</span>
                  </button>
                </div>
              </div>

              {/* Before Photo & Resolution Upload Form */}
              <form onSubmit={handleCompleteSubmit} className="space-y-5 border-t border-slate-200 pt-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  {tw.uploadHeader}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Reported Defect Photo */}
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">{tw.beforeLabel}</span>
                    <div className="h-36 rounded-lg overflow-hidden bg-slate-50 border border-slate-200">
                      <img src={selectedTask.beforeImage} alt="Before" className="w-full h-full object-contain p-1" />
                    </div>
                  </div>

                  {/* Resolution Proof Upload */}
                  <div>
                    <span className="text-xs text-emerald-700 font-semibold block mb-1">{tw.afterLabel}</span>
                    <div className="h-36 rounded-lg overflow-hidden bg-slate-50 border border-emerald-400 relative">
                      <img src={resolutionPhoto} alt="After" className="w-full h-full object-contain p-1" />
                      <label className="absolute bottom-2 right-2 bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-300 cursor-pointer flex items-center gap-1 hover:bg-blue-50 shadow-xs">
                        <Upload className="w-3 h-3 text-blue-600" /> {tw.changePhoto}
                        <input type="file" accept="image/*" onChange={handleCustomPhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                </div>

                {/* Proof Presets Selector */}
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1.5">{tw.presetsLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RESOLVED_PROOF_SAMPLES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResolutionPhoto(sample.svg)}
                        className={`text-[10px] p-2 rounded-lg border text-left truncate transition-all ${resolutionPhoto === sample.svg ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:text-slate-900'}`}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Worker Notes */}
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">{tw.notesLabel}</label>
                  <textarea
                    rows={3}
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Complete Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-success justify-center py-3 text-xs font-bold shadow-md"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" /> {tw.verifying}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {tw.markSolvedBtn}
                    </span>
                  )}
                </button>
              </form>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-sm text-slate-500 space-y-3 bg-white shadow-sm rounded-xl">
              <HardHat className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
              <h3 className="text-base font-bold text-slate-900">{tw.selectQueuePrompt}</h3>
              <p className="text-xs max-w-sm mx-auto">
                {tw.selectQueueSub}
              </p>
            </div>
          )}

          {/* Completed Tasks Log */}
          {completedTasks.length > 0 && (
            <div className="glass-panel p-5 space-y-3 border border-emerald-200 bg-white shadow-sm rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                {tw.recentlyCompleted} ({completedTasks.length})
              </h4>

              <div className="space-y-2">
                {completedTasks.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase">{item.id}</span>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">Ward {item.ward?.number}: {item.ward?.name}</p>
                    </div>
                    <span className="badge badge-completed">Resolved</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
