import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, Play, Pause, RotateCcw, Camera, Cpu, Sparkles, CheckCircle2, 
  MapPin, AlertTriangle, ShieldCheck, Zap, Layers, RefreshCw, Send, Radio, Navigation, Eye, Check, Video, Grid, StopCircle
} from 'lucide-react';
import MapView from './MapView';
import { analyzeInfrastructureImage } from '../services/AiDetector';
import { detectBBMPWard } from '../data/bengaluruWards';
import { getDefectSvg } from '../utils/svgPlaceholders';

// Realistic BMTC Route 500D Waypoints (Silk Board -> Hebbal via ORR & Marathahalli)
const BUS_ROUTE_WAYPOINTS = [
  { name: "Silk Board Central Junction", coords: [12.9172, 77.6228], landmark: "Central Silk Board Corridor" },
  { name: "HSR Layout 27th Main Signal", coords: [12.9116, 77.6412], landmark: "HSR Layout Sector 1 Road" },
  { name: "Agara Lake Outer Ring Road", coords: [12.9238, 77.6514], landmark: "Agara Flyover Carriageway" },
  { name: "Bellandur Ecospace Signal", coords: [12.9260, 77.6762], landmark: "Outer Ring Road Tech Corridor" },
  { name: "Kadubeesanahalli Underpass", coords: [12.9354, 77.6912], landmark: "Kadubeesanahalli Road" },
  { name: "Marathahalli Multiplex Bridge", coords: [12.9562, 77.7019], landmark: "Marathahalli Bridge Junction" },
  { name: "HAL Airport Road Junction", coords: [12.9602, 77.6485], landmark: "HAL Heritage Road" },
  { name: "Domlur Flyover Ramp", coords: [12.9609, 77.6382], landmark: "Domlur Inner Ring Road" },
  { name: "Indiranagar 100ft Road", coords: [12.9784, 77.6408], landmark: "Indiranagar Metro Corridor" },
  { name: "Hebbal Central Flyover", coords: [13.0358, 77.5970], landmark: "Hebbal Airport Highway Ramp" }
];

export default function TransitBusPortal({ onSubmitIssue, t }) {
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoCapturingActive, setIsVideoCapturingActive] = useState(true); // Camera On / Capturing state
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [busSpeedKmh, setBusSpeedKmh] = useState(42);

  // Video AI Bounding Box & Capture State
  const [capturedPotholeBuffer, setCapturedPotholeBuffer] = useState([]);
  const [collagedReports, setCollagedReports] = useState([]);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [lastDispatchedToast, setLastDispatchedToast] = useState(null);

  // Device Video Stream Ref
  const videoStreamRef = useRef(null);
  const webCamRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const activeWaypoint = BUS_ROUTE_WAYPOINTS[currentWaypointIdx];

  // Toggle Live Camera Video Capturing On/Off
  const toggleLiveVideoCapturing = async () => {
    if (isVideoCapturingActive) {
      setIsVideoCapturingActive(false);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
      }
    } else {
      setIsVideoCapturingActive(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoStreamRef.current = stream;
        if (webCamRef.current) {
          webCamRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Real device camera not available, utilizing AI road video stream engine:", err);
      }
    }
  };

  // Moving Bus Route Animation Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && isVideoCapturingActive) {
      interval = setInterval(() => {
        setCurrentWaypointIdx((prev) => {
          const next = (prev + 1) % BUS_ROUTE_WAYPOINTS.length;
          setBusSpeedKmh(Math.floor(38 + Math.random() * 12));
          return next;
        });
      }, 4000 / speedMultiplier);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isVideoCapturingActive, speedMultiplier]);

  // Real-Time CCTV Camera Road Video Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let roadOffset = 0;
    let potholeY = -50;
    let hasCapturedCurrentPothole = false;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isVideoCapturingActive) {
        // Camera Standby Screen
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 CAMERA IS OFF - CLICK "START LIVE VIDEO CAPTURING" BELOW', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // 1. Asphalt Road Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.4, '#334155');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Moving Road Dividers
      roadOffset = (roadOffset + 4 * speedMultiplier) % 40;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffset;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 60);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer White Lane Boundaries
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.15, 60);
      ctx.lineTo(0, canvas.height);
      ctx.moveTo(canvas.width * 0.85, 60);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();

      // 3. Move Pothole Hazard Object down the road in real time
      potholeY += 2.5 * speedMultiplier;
      if (potholeY > canvas.height + 40) {
        potholeY = -60;
        hasCapturedCurrentPothole = false;
      }

      // Draw Pothole Texture on Road
      const potholeX = canvas.width / 2 - 35;
      const potholeWidth = 70;
      const potholeHeight = 40;

      if (potholeY > 40 && potholeY < canvas.height - 20) {
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.ellipse(potholeX + 35, potholeY + 20, 32, 18, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. AI Real-Time CCTV Laser Bounding Box Target
        const boxX = potholeX - 10;
        const boxY = potholeY - 10;
        const boxW = potholeWidth + 20;
        const boxH = potholeHeight + 20;

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const cornerLen = 8;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY);
        ctx.lineTo(boxX + boxW);
        ctx.lineTo(boxX + boxW, boxY + cornerLen);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(boxX, boxY - 20, 150, 18);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('POTHOLE: 98.4% CONF', boxX + 4, boxY - 6);

        // Auto-Capture Pothole Frame when passing camera center line
        if (potholeY > canvas.height * 0.45 && !hasCapturedCurrentPothole && isPlaying && isVideoCapturingActive) {
          hasCapturedCurrentPothole = true;
          triggerPotholeCctvCapture();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isVideoCapturingActive, speedMultiplier, currentWaypointIdx]);

  // Capture individual Pothole CCTV Frame into Buffer
  const triggerPotholeCctvCapture = () => {
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 250);

    const locationObj = BUS_ROUTE_WAYPOINTS[currentWaypointIdx];
    const imageSvg = getDefectSvg("Road Infrastructure Pothole", "before");

    const newSnapshot = {
      id: `SNAP-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString(),
      coords: locationObj.coords,
      locationName: locationObj.name,
      landmark: locationObj.landmark,
      imageSvg: imageSvg,
      severity: Math.floor(75 + Math.random() * 20)
    };

    setCapturedPotholeBuffer((prev) => {
      const updated = [newSnapshot, ...prev];
      // When buffer reaches 3 snapshots, automatically generate Collage & Dispatch to Admin!
      if (updated.length >= 3) {
        generateCollageAndDispatchToAdmin(updated, locationObj);
        return []; // Reset buffer after collage generation
      }
      return updated;
    });
  };

  // Canvas Multi-Photo Collage Generator Engine
  const generateCollageAndDispatchToAdmin = async (snapshots, locationObj) => {
    const collageDataUrl = await createPotholeCollageCanvas(snapshots, locationObj.name);

    const lat = locationObj.coords[0];
    const lng = locationObj.coords[1];
    const ward = detectBBMPWard(lat, lng);

    const adminCollageIssue = {
      id: `BUS-COLLAGE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `[BMTC Smart Bus CCTV] Multi-Pothole Collage (${snapshots.length} Potholes Stitched)`,
      category: "Road Infrastructure",
      defectName: "Multi-Pothole Road Corridor Damage",
      severityScore: 92,
      hazardLevel: "Critical",
      priorityCode: "P1",
      status: "Pending",
      coordinates: [lat, lng],
      address: `${locationObj.landmark}, ${locationObj.name}, Bengaluru`,
      ward: ward,
      beforeImage: collageDataUrl, // Single Combined Multi-Photo Collage Image!
      afterImage: null,
      reportedBy: `BMTC Smart Bus CCTV Fleet (Vehicle KA-01-F-2940, Route 500D)`,
      reporterName: `BMTC CCTV Autonomous System`,
      reporterPhone: `BMTC Command Center`,
      createdAt: new Date().toLocaleString(),
      assignedTeam: null,
      workerNotes: null,
      aiDescription: `Continuous CCTV video stream detected ${snapshots.length} severe potholes along the road corridor. AI automatically stitched all captured pothole snapshots into 1 combined photo collage and sent to Admin.`
    };

    // SUBMIT COMBINED COLLAGE ISSUE TO ADMIN DASHBOARD
    onSubmitIssue(adminCollageIssue);

    setCollagedReports((prev) => [adminCollageIssue, ...prev]);

    setLastDispatchedToast({
      title: adminCollageIssue.title,
      count: snapshots.length,
      location: locationObj.name
    });
    setTimeout(() => setLastDispatchedToast(null), 5000);
  };

  // Helper: Stitches multiple pothole images into ONE Single Combined Collage Data URL
  const createPotholeCollageCanvas = (snapshots, locationName) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');

      // 1. Dark Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 420);

      // 2. Banner Header
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 640, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`🚌 BMTC SMART BUS CCTV - AI POTHOLE COLLAGE (${snapshots.length} DETECTED)`, 15, 26);

      // Sub-banner info
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 40, 640, 30);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`LOCATION: ${locationName.toUpperCase()} | BUS: BMTC-KA-01-F-2940 | ROUTE: 500D`, 15, 59);

      // 3. Draw 3-Panel Collage Grid
      const panelWidth = 190;
      const panelHeight = 310;
      const startY = 85;

      snapshots.slice(0, 3).forEach((snap, idx) => {
        const startX = 20 + idx * (panelWidth + 15);

        // Panel Border
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(startX, startY, panelWidth, panelHeight);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, panelWidth, panelHeight);

        // Load SVG/Image onto panel
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          ctx.drawImage(img, startX + 5, startY + 5, panelWidth - 10, panelHeight - 60);

          // Pothole Label Tag
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(startX + 5, startY + panelHeight - 50, panelWidth - 10, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`POTHOLE #${idx + 1} (${snap.severity}%)`, startX + 10, startY + panelHeight - 36);

          // GPS Tag
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(startX + 5, startY + panelHeight - 28, panelWidth - 10, 22);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px monospace';
          ctx.fillText(`TIME: ${snap.time}`, startX + 10, startY + panelHeight - 14);

          if (idx === Math.min(snapshots.length, 3) - 1) {
            resolve(canvas.toDataURL('image/jpeg'));
          }
        };
        img.onerror = () => {
          if (idx === Math.min(snapshots.length, 3) - 1) {
            resolve(canvas.toDataURL('image/jpeg'));
          }
        };
        img.src = snap.imageSvg;
      });
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-amber-500 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white shadow-sm rounded-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1">
            <Video className="w-4 h-4" /> BMTC Smart Bus Live CCTV Video Capturing
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Live Video Capturing & AI Pothole Detector</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Click **Start Live Video Capturing** to turn on the Smart Bus CCTV camera. While capturing video on the move, AI automatically detects potholes, combines images into a single photo collage, and sends it directly to the Admin Dashboard with exact GPS coordinates.
          </p>
        </div>

        {/* Primary Action Button: Toggle Live Video Capturing */}
        <button
          type="button"
          onClick={toggleLiveVideoCapturing}
          className={`py-3 px-6 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-2.5 ${isVideoCapturingActive ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'}`}
        >
          {isVideoCapturingActive ? (
            <>
              <StopCircle className="w-5 h-5" />
              <span>Stop Video Capturing ⏹️</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Start Live Video Capturing 📹</span>
            </>
          )}
        </button>
      </div>

      {/* Main Layout: CCTV Live Stream & GIS Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live CCTV Camera Stream (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5 bg-slate-950 text-white rounded-xl shadow-md space-y-4 relative overflow-hidden border border-slate-800">
            
            {/* Viewfinder Header Overlay */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <div className="flex items-center gap-2">
                {isVideoCapturingActive ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono font-bold text-red-400">🔴 LIVE VIDEO CAPTURING IN PROGRESS</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-mono font-bold text-slate-400">📷 CAMERA STANDBY / OFF</span>
                  </>
                )}
              </div>
              <span className="font-mono text-[11px] text-cyan-400">VEHICLE: BMTC-KA01-F-2940</span>
            </div>

            {/* Live CCTV Video Canvas */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              
              <canvas 
                ref={canvasRef} 
                width={560} 
                height={315} 
                className="w-full h-full object-cover"
              />

              {/* Shutter Camera Flash Effect on Pothole Auto-Capture */}
              {isCapturingFlash && (
                <div className="absolute inset-0 bg-white animate-fadeOut z-20 pointer-events-none" />
              )}

              {/* CCTV Timestamp & Telemetry HUD */}
              {isVideoCapturingActive && (
                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-xs p-2.5 rounded-lg text-[10px] font-mono text-cyan-300 space-y-0.5 border border-cyan-500/30">
                  <p className="text-white font-bold">ROUTE: 500D (Silk Board ➔ Hebbal)</p>
                  <p>GPS: {activeWaypoint.coords[0]}, {activeWaypoint.coords[1]}</p>
                  <p>SPEED: <span className="text-amber-400 font-bold">{busSpeedKmh} KM/H</span></p>
                  <p className="text-red-400 font-bold">CCTV TIME: {new Date().toLocaleTimeString()}</p>
                </div>
              )}

              {/* Buffer Count HUD */}
              {isVideoCapturingActive && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>CCTV POTHOLE BUFFER: <strong>{capturedPotholeBuffer.length}/3 CAPTURED</strong></span>
                  </div>
                  <span className="text-amber-400 font-bold">AUTO-COLLAGE ACTIVE 🖼️</span>
                </div>
              )}

            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLiveVideoCapturing}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${isVideoCapturingActive ? 'bg-red-600 text-white border-red-600' : 'bg-blue-600 text-white border-blue-600'}`}
                >
                  {isVideoCapturingActive ? <StopCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span>{isVideoCapturingActive ? 'Stop Video Capturing' : 'Start Live Video Capturing'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentWaypointIdx(0)}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Route
                </button>
              </div>

              {/* Manual Snap Button */}
              <button
                type="button"
                onClick={triggerPotholeCctvCapture}
                disabled={!isVideoCapturingActive}
                className="btn-primary text-xs py-2 px-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Pothole Frame 📸</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: GIS Route Map & Collaged Reports Log (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Moving Bus GIS Map */}
          <div className="glass-panel p-5 bg-white shadow-sm rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Bus Route GPS Position: <strong className="text-blue-700">{activeWaypoint.name}</strong>
              </h3>
            </div>

            <MapView 
              selectedLocation={activeWaypoint.coords}
              center={activeWaypoint.coords}
              height="190px"
            />
          </div>

          {/* Collaged Reports Sent to Admin Log */}
          <div className="glass-panel p-5 bg-white shadow-sm rounded-xl space-y-3">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-600" />
                Pothole Collages Sent to Admin ({collagedReports.length})
              </h4>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Admin Sync
              </span>
            </div>

            {/* Live Toast Notice */}
            {lastDispatchedToast && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                <div>
                  <p className="font-bold">Collage Stitched & Sent to Admin! 🖼️</p>
                  <p className="text-[10px] text-amber-700">{lastDispatchedToast.count} Potholes combined into 1 collage at {lastDispatchedToast.location}</p>
                </div>
              </div>
            )}

            {collagedReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                Click **Start Live Video Capturing** above. When potholes are detected in the video stream, the AI stitches them into **One Photo Collage** and sends to Admin.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {collagedReports.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 line-clamp-1">{item.title}</span>
                      <span className="badge badge-priority-p1">P1</span>
                    </div>

                    {/* Collage Image Preview */}
                    <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-300">
                      <img src={item.beforeImage} alt="Collage preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200">
                      <span>Location: <strong className="text-blue-700">{item.address}</strong></span>
                      <span className="text-emerald-700 font-bold">Sent to Admin ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
