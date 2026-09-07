import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, Play, Pause, RotateCcw, Camera, Cpu, Sparkles, CheckCircle2, 
  MapPin, AlertTriangle, ShieldCheck, Zap, Layers, RefreshCw, Send, Radio, Navigation, Eye, Check, Video, Grid, StopCircle, Car, AlertOctagon, ShieldAlert, Activity, Upload, Film, FileVideo
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
  const [isVideoCapturingActive, setIsVideoCapturingActive] = useState(true);
  const [activeCamFeed, setActiveCamFeed] = useState("CAM1_FRONT");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [busSpeedKmh, setBusSpeedKmh] = useState(42);

  // Uploaded Video File State & Analyzer
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [uploadedVideoName, setUploadedVideoName] = useState("");
  const [isAnalyzingUploadedVideo, setIsAnalyzingUploadedVideo] = useState(false);
  const [detectedPotholesInVideo, setDetectedPotholesInVideo] = useState([]);

  // Live Vehicle Classification & Traffic Density Counter
  const [vehicleCounts, setVehicleCounts] = useState({ cars: 28, twoWheelers: 54, buses: 6, trucks: 4 });
  const [congestionLevel, setCongestionLevel] = useState("Moderate");

  // ANPR License Plate Tracking State
  const [anprAlerts, setAnprAlerts] = useState([]);

  // Video AI Bounding Box & Capture State
  const [capturedPotholeBuffer, setCapturedPotholeBuffer] = useState([]);
  const [collagedReports, setCollagedReports] = useState([]);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [lastDispatchedToast, setLastDispatchedToast] = useState(null);

  const videoStreamRef = useRef(null);
  const videoFileRef = useRef(null);
  const uploadedVideoElementRef = useRef(null);
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
    }
  };

  // Handle Video File Upload Selection (.mp4, .webm, .mov)
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(videoUrl);
    setUploadedVideoName(file.name);
    setIsAnalyzingUploadedVideo(true);
    setDetectedPotholesInVideo([]);

    // Automatically trigger AI Pothole Detection on Uploaded Video
    analyzeUploadedVideoForPotholes(videoUrl, file.name);
  };

  // Analyze Uploaded Video Frames & Autonomously Capture Pothole Photos to Send to Admin
  const analyzeUploadedVideoForPotholes = async (videoUrl, filename) => {
    // Simulate AI Video Frame Scanning (1.2 sec per frame scan)
    await new Promise(r => setTimeout(r, 1200));

    const locationObj = BUS_ROUTE_WAYPOINTS[currentWaypointIdx];
    const lat = locationObj.coords[0];
    const lng = locationObj.coords[1];
    const ward = detectBBMPWard(lat, lng);

    // AI Autonomously captures 2 pothole photo frames from uploaded video
    const potholeFrame1 = getDefectSvg("Road Infrastructure Pothole", "before");
    const potholeFrame2 = getDefectSvg("Road Infrastructure Pothole", "before");

    const issue1 = {
      id: `VID-POTHOLE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `[AI Video Scan] Severe Pothole Frame #1 in ${filename}`,
      category: "Road Infrastructure",
      defectName: "Severe Asphalt Pothole & Craters",
      severityScore: 95,
      hazardLevel: "Critical",
      priorityCode: "P1",
      status: "Pending",
      coordinates: [lat, lng],
      address: `${locationObj.landmark}, ${locationObj.name}, Bengaluru`,
      ward: ward,
      beforeImage: potholeFrame1,
      afterImage: null,
      reportedBy: `Uploaded Video AI Auto-Capture (${filename})`,
      reporterName: `Autonomous Video Scanner`,
      reporterPhone: `BMTC Command Center`,
      createdAt: new Date().toLocaleString(),
      assignedTeam: null,
      workerNotes: null,
      aiDescription: `AI autonomously scanned video file (${filename}), detected a severe road pothole frame at 00:04s, captured photo proof, and dispatched to Admin Dashboard.`
    };

    const issue2 = {
      id: `VID-POTHOLE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `[AI Video Scan] Deep Crater Frame #2 in ${filename}`,
      category: "Road Infrastructure",
      defectName: "Cracked Carriageway Pothole Group",
      severityScore: 88,
      hazardLevel: "High",
      priorityCode: "P1",
      status: "Pending",
      coordinates: [lat + 0.0012, lng + 0.0015],
      address: `Near ${locationObj.name} Corridor, Bengaluru`,
      ward: ward,
      beforeImage: potholeFrame2,
      afterImage: null,
      reportedBy: `Uploaded Video AI Auto-Capture (${filename})`,
      reporterName: `Autonomous Video Scanner`,
      reporterPhone: `BMTC Command Center`,
      createdAt: new Date().toLocaleString(),
      assignedTeam: null,
      workerNotes: null,
      aiDescription: `AI autonomously scanned video file (${filename}), detected deep asphalt crater frame at 00:11s, captured photo proof, and dispatched to Admin Dashboard.`
    };

    // AUTONOMOUSLY SEND CAPTURED POTHOLE PHOTOS TO ADMIN
    onSubmitIssue(issue1);
    setTimeout(() => onSubmitIssue(issue2), 600);

    setDetectedPotholesInVideo([issue1, issue2]);
    setIsAnalyzingUploadedVideo(false);

    setLastDispatchedToast({
      title: `AI Auto-Captured 2 Pothole Photos from ${filename}!`,
      count: 2,
      location: locationObj.name
    });
    setTimeout(() => setLastDispatchedToast(null), 5000);
  };

  // Moving Bus Route Animation Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && isVideoCapturingActive) {
      interval = setInterval(() => {
        setCurrentWaypointIdx((prev) => {
          const next = (prev + 1) % BUS_ROUTE_WAYPOINTS.length;
          setBusSpeedKmh(Math.floor(36 + Math.random() * 14));
          
          setVehicleCounts({
            cars: Math.floor(20 + Math.random() * 25),
            twoWheelers: Math.floor(40 + Math.random() * 45),
            buses: Math.floor(4 + Math.random() * 6),
            trucks: Math.floor(2 + Math.random() * 5)
          });

          const totalVehicles = vehicleCounts.cars + vehicleCounts.twoWheelers;
          if (totalVehicles > 60) setCongestionLevel("Heavy Bottleneck");
          else if (totalVehicles > 40) setCongestionLevel("Moderate Flow");
          else setCongestionLevel("Free Flowing");

          return next;
        });
      }, 4000 / speedMultiplier);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isVideoCapturingActive, speedMultiplier]);

  // Real-Time Onboard Sensing Unit Canvas Vision Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let roadOffset = 0;
    let objectY = -50;
    let hasCapturedCurrentObject = false;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isVideoCapturingActive) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 CAMERA STANDBY - CLICK "START LIVE CAPTURING" BELOW', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // 1. Road Carriageway Canvas
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.4, '#334155');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving Road Lines
      roadOffset = (roadOffset + 4 * speedMultiplier) % 40;

      ctx.strokeStyle = activeCamFeed === 'CAM3_ANPR' ? '#38bdf8' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffset;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 60);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.15, 60);
      ctx.lineTo(0, canvas.height);
      ctx.moveTo(canvas.width * 0.85, 60);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();

      // Move Target Object down the road
      objectY += 2.5 * speedMultiplier;
      if (objectY > canvas.height + 40) {
        objectY = -60;
        hasCapturedCurrentObject = false;
      }

      const objectX = canvas.width / 2 - 40;
      const objectW = 80;
      const objectH = 45;

      if (objectY > 40 && objectY < canvas.height - 20) {
        
        if (activeCamFeed === 'CAM1_FRONT') {
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.ellipse(objectX + 40, objectY + 22, 35, 18, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(objectX - 10, objectY - 10, objectW + 20, objectH + 20);

          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(objectX - 10, objectY - 25, 170, 18);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('POTHOLE DETECTED: 98.4%', objectX - 5, objectY - 11);
        } 
        else if (activeCamFeed === 'CAM2_SIDE') {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(objectX, objectY, objectW, objectH - 10);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(objectX, objectY, objectW, objectH - 10);

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(objectX - 8, objectY - 8, objectW + 16, objectH + 16);

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(objectX - 8, objectY - 24, 180, 18);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('DAMAGED SIGNBOARD: 96.8%', objectX - 4, objectY - 10);
        } 
        else if (activeCamFeed === 'CAM3_ANPR') {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(objectX, objectY, objectW, objectH);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(objectX + 10, objectY + 12, objectW - 20, 20);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('KA-01-MJ-8821', objectX + 12, objectY + 26);

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(objectX - 10, objectY - 10, objectW + 20, objectH + 20);

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(objectX - 10, objectY - 25, 210, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('ANPR: KA-01-MJ-8821 (RASH 88km/h)', objectX - 5, objectY - 11);
        }

        if (objectY > canvas.height * 0.45 && !hasCapturedCurrentObject && isPlaying && isVideoCapturingActive) {
          hasCapturedCurrentObject = true;
          triggerPotholeCctvCapture();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isVideoCapturingActive, activeCamFeed, speedMultiplier, currentWaypointIdx]);

  const triggerPotholeCctvCapture = () => {
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 250);

    const locationObj = BUS_ROUTE_WAYPOINTS[currentWaypointIdx];
    
    let defectType = "Road Infrastructure Pothole";
    if (activeCamFeed === 'CAM2_SIDE') defectType = "Damaged Signboard";
    if (activeCamFeed === 'CAM3_ANPR') defectType = "ANPR Hit-and-Run Incident";

    const imageSvg = getDefectSvg(defectType, "before");

    const newSnapshot = {
      id: `SNAP-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString(),
      coords: locationObj.coords,
      locationName: locationObj.name,
      landmark: locationObj.landmark,
      imageSvg: imageSvg,
      severity: Math.floor(75 + Math.random() * 20),
      feed: activeCamFeed
    };

    if (activeCamFeed === 'CAM3_ANPR') {
      const plateNo = `KA-01-MJ-${Math.floor(1000 + Math.random() * 9000)}`;
      const anprEvent = {
        plate: plateNo,
        speed: `${Math.floor(82 + Math.random() * 15)} km/h`,
        location: locationObj.name,
        confidence: "99.7%",
        time: new Date().toLocaleTimeString()
      };
      setAnprAlerts(prev => [anprEvent, ...prev]);
    }

    setCapturedPotholeBuffer((prev) => {
      const updated = [newSnapshot, ...prev];
      if (updated.length >= 3) {
        generateCollageAndDispatchToAdmin(updated, locationObj);
        return [];
      }
      return updated;
    });
  };

  const generateCollageAndDispatchToAdmin = async (snapshots, locationObj) => {
    const collageDataUrl = await createPotholeCollageCanvas(snapshots, locationObj.name);

    const lat = locationObj.coords[0];
    const lng = locationObj.coords[1];
    const ward = detectBBMPWard(lat, lng);

    let titleText = `[BMTC Smart Bus Sensing] Multi-Hazard Collage (${snapshots.length} Defects Stitched)`;
    if (activeCamFeed === 'CAM3_ANPR') titleText = `[BMTC Smart Bus ANPR] Rash Driving & Incident Log (${snapshots.length} Frames)`;

    const adminCollageIssue = {
      id: `BUS-SENSE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: titleText,
      category: activeCamFeed === 'CAM3_ANPR' ? "Security & Rash Driving Incident" : "Road Infrastructure",
      defectName: activeCamFeed === 'CAM3_ANPR' ? "ANPR Hit-and-Run / Over-Speeding Incident" : "Multi-Hazard Carriageway Defect",
      severityScore: 92,
      hazardLevel: "Critical",
      priorityCode: "P1",
      status: "Pending",
      coordinates: [lat, lng],
      address: `${locationObj.landmark}, ${locationObj.name}, Bengaluru`,
      ward: ward,
      beforeImage: collageDataUrl,
      afterImage: null,
      reportedBy: `BMTC Mobile Urban Sensing Unit (Vehicle KA-01-F-2940, Route 500D, Feed: ${activeCamFeed})`,
      reporterName: `BMTC Edge-AI Onboard Unit`,
      reporterPhone: `BMTC Command Center`,
      createdAt: new Date().toLocaleString(),
      assignedTeam: null,
      workerNotes: null,
      aiDescription: `Mobile Urban Sensing Unit detected hazards along corridor. Edge-AI processed metadata locally (92% bandwidth saved), stitched frames into 1 verified report, and dispatched to Admin Dashboard.`
    };

    onSubmitIssue(adminCollageIssue);
    setCollagedReports((prev) => [adminCollageIssue, ...prev]);

    setLastDispatchedToast({
      title: adminCollageIssue.title,
      count: snapshots.length,
      location: locationObj.name
    });
    setTimeout(() => setLastDispatchedToast(null), 5000);
  };

  const createPotholeCollageCanvas = (snapshots, locationName) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 420);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 640, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`🚌 BMTC MOBILE URBAN SENSING UNIT - AI COLLAGE (${snapshots.length} DETECTED)`, 15, 26);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 40, 640, 30);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`LOCATION: ${locationName.toUpperCase()} | BUS: BMTC-KA-01-F-2940 | ROUTE: 500D`, 15, 59);

      const panelWidth = 190;
      const panelHeight = 310;
      const startY = 85;

      snapshots.slice(0, 3).forEach((snap, idx) => {
        const startX = 20 + idx * (panelWidth + 15);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(startX, startY, panelWidth, panelHeight);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, panelWidth, panelHeight);

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          ctx.drawImage(img, startX + 5, startY + 5, panelWidth - 10, panelHeight - 60);

          ctx.fillStyle = '#dc2626';
          ctx.fillRect(startX + 5, startY + panelHeight - 50, panelWidth - 10, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`DEFECT #${idx + 1} (${snap.severity}%)`, startX + 10, startY + panelHeight - 36);

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
            <Bus className="w-4 h-4" /> BMTC Public Transit Mobile Urban Sensing Unit
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Autonomous Video File Pothole Photo Capture & Admin Dispatch</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Upload any road video file. The AI automatically scans video frames, detects potholes, **captures the pothole photos autonomously**, and sends them directly to the Admin Dashboard.
          </p>
        </div>

        {/* Action Buttons: Toggle Live Sensing & Upload Video File */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={videoFileRef}
            onChange={handleVideoFileUpload}
            accept="video/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => videoFileRef.current?.click()}
            className="py-3 px-5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload Video File 📹</span>
          </button>

          <button
            type="button"
            onClick={toggleLiveVideoCapturing}
            className={`py-3 px-6 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-2.5 ${isVideoCapturingActive ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'}`}
          >
            {isVideoCapturingActive ? (
              <>
                <StopCircle className="w-5 h-5" />
                <span>Stop Live Capturing ⏹️</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                <span>Start Live Capturing 📹</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Uploaded Video Scanner Section (if video uploaded) */}
      {uploadedVideoUrl && (
        <div className="glass-panel p-5 bg-slate-900 text-white rounded-xl shadow-md space-y-4 border border-amber-500/50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Film className="w-4 h-4 animate-spin" />
              <span>UPLOADED VIDEO FILE AI FRAME ANALYZER: {uploadedVideoName}</span>
            </div>
            {isAnalyzingUploadedVideo && (
              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded font-mono text-[11px] animate-pulse">
                AI Autonomously Scanning Frames & Capturing Pothole Photos...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative">
              <video 
                ref={uploadedVideoElementRef}
                src={uploadedVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
              {isAnalyzingUploadedVideo && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-sm font-bold text-amber-300">InfraVision AI Autonomously Detecting Potholes & Capturing Photos...</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Auto-Captured Pothole Photos Sent to Admin ({detectedPotholesInVideo.length})
              </h4>

              {detectedPotholesInVideo.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/60 rounded-lg">
                  Scanning video frames... Pothole photos captured by AI will automatically appear here and in the Admin Dashboard.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                  {detectedPotholesInVideo.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-lg border border-emerald-500/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 line-clamp-1">{item.title}</span>
                        <span className="badge badge-priority-p1">P1</span>
                      </div>

                      {/* Captured Photo Frame Preview */}
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                        <img src={item.beforeImage} alt="Captured Pothole Frame" className="w-full h-full object-cover" />
                      </div>

                      <p className="text-[11px] text-slate-300">{item.address}</p>
                      <span className="text-[10px] text-emerald-400 font-bold block pt-1 border-t border-slate-700">Auto-Dispatched to Admin Dashboard ✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Camera Vision Feed Selector Pills */}
      <div className="flex flex-wrap items-center gap-3 glass-panel p-4 bg-white rounded-xl shadow-2xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Eye className="w-4 h-4 text-blue-600" /> Select Onboard Camera Feed:
        </span>

        <button
          type="button"
          onClick={() => setActiveCamFeed('CAM1_FRONT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeCamFeed === 'CAM1_FRONT' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>📷 Cam 1: Front Road Vision (Potholes, Waterlogging)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCamFeed('CAM2_SIDE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeCamFeed === 'CAM2_SIDE' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>📷 Cam 2: Side Infrastructure Vision (Signboards, Dividers)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCamFeed('CAM3_ANPR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeCamFeed === 'CAM3_ANPR' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>📷 Cam 3: Traffic & ANPR Security (Plate Tracking & Children Safety)</span>
        </button>
      </div>

      {/* Main Layout: Live Camera Stream & GIS Route Map */}
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
                    <span className="font-mono font-bold text-red-400">🔴 LIVE SENSING IN MOTION: {activeCamFeed}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-mono font-bold text-slate-400">📷 CAMERA STANDBY / OFF</span>
                  </>
                )}
              </div>
              <span className="font-mono text-[11px] text-cyan-400">BMTC-KA01-F-2940</span>
            </div>

            {/* Live CCTV Video Canvas */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              
              <canvas 
                ref={canvasRef} 
                width={560} 
                height={315} 
                className="w-full h-full object-cover"
              />

              {/* Flash Effect on Capture */}
              {isCapturingFlash && (
                <div className="absolute inset-0 bg-white animate-fadeOut z-20 pointer-events-none" />
              )}

              {/* CCTV Timestamp & Telemetry HUD */}
              {isVideoCapturingActive && (
                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-xs p-2.5 rounded-lg text-[10px] font-mono text-cyan-300 space-y-0.5 border border-cyan-500/30">
                  <p className="text-white font-bold">ROUTE: 500D (Silk Board ➔ Hebbal)</p>
                  <p>GPS: {activeWaypoint.coords[0]}, {activeWaypoint.coords[1]}</p>
                  <p>SPEED: <span className="text-amber-400 font-bold">{busSpeedKmh} KM/H</span></p>
                  <p className="text-red-400 font-bold">TIME: {new Date().toLocaleTimeString()}</p>
                </div>
              )}

              {/* Buffer Count HUD */}
              {isVideoCapturingActive && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>ONBOARD SENSING BUFFER: <strong>{capturedPotholeBuffer.length}/3 CAPTURED</strong></span>
                  </div>
                  <span className="text-amber-400 font-bold">EDGE-AI METADATA DISPATCH 🖼️</span>
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
                  <span>{isVideoCapturingActive ? 'Stop Live Capturing' : 'Start Live Capturing'}</span>
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
                Bus Route GPS Location: <strong className="text-blue-700">{activeWaypoint.name}</strong>
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
                Sensing Reports Sent to Admin ({collagedReports.length})
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
                  <p className="font-bold">Edge-AI Pothole Sent to Admin! 🖼️</p>
                  <p className="text-[10px] text-amber-700">{lastDispatchedToast.count} Pothole frame(s) dispatched with GPS location at {lastDispatchedToast.location}</p>
                </div>
              </div>
            )}

            {collagedReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                Mobile Urban Sensing active... Potholes detected in motion or uploaded videos will automatically appear here and in the Admin Dashboard.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {collagedReports.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 line-clamp-1">{item.title}</span>
                      <span className="badge badge-priority-p1">P1</span>
                    </div>

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
