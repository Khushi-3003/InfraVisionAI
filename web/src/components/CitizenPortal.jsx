import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, MapPin, Sparkles, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, Cpu, ArrowRight, Layers, FileText, Check, Navigation, Image as ImageIcon, X, RefreshCw, User, Phone, Loader2, HardHat, FileCheck
} from 'lucide-react';
import { analyzeInfrastructureImage } from '../services/AiDetector';
import MapView from './MapView';
import { detectBBMPWard } from '../data/bengaluruWards';

export default function CitizenPortal({ issues, onSubmitIssue, t }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [citizenFilterStatus, setCitizenFilterStatus] = useState("ALL");

  const tc = t.citizen; // Citizen translation strings

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Location & Ward State (Default: Bellandur, Bengaluru)
  const [coordinates, setCoordinates] = useState([12.9260, 77.6762]);
  const [address, setAddress] = useState("Outer Ring Road, Near Ecospace, Bellandur, Bengaluru");
  const [detectedWard, setDetectedWard] = useState(detectBBMPWard(12.9260, 77.6762));
  
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Separate Reporter Name & Phone fields
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reverse Geocoding helper via OpenStreetMap Nominatim API
  const fetchAddressAndWard = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (response.ok) {
        const data = await response.json();
        const addrObj = data.address || {};
        const road = addrObj.road || addrObj.street || addrObj.pedestrian || "";
        const suburb = addrObj.suburb || addrObj.neighbourhood || addrObj.residential || addrObj.subdistrict || addrObj.city_district || "";
        const city = addrObj.city || addrObj.town || addrObj.county || "Bengaluru";
        const postcode = addrObj.postcode ? ` - ${addrObj.postcode}` : "";

        const fullAddr = [road, suburb, city].filter(Boolean).join(", ") + postcode;
        const ward = detectBBMPWard(lat, lng, suburb || road || city);

        return {
          address: fullAddr || `Geotagged Location (${lat}, ${lng}), ${ward.name}, Bengaluru`,
          ward: ward
        };
      }
    } catch (e) {
      console.warn("Reverse geocoding fetch error:", e);
    }
    
    const ward = detectBBMPWard(lat, lng);
    return {
      address: `GPS Pin (${lat}, ${lng}), Ward ${ward.number} (${ward.name}), ${ward.zone}, Bengaluru`,
      ward: ward
    };
  };

  // Trigger AI Analysis on image change
  const handlePhotoSelect = async (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setPreviewUrl(photoUrl);
    setIsScanning(true);
    setAiAnalysis(null);

    const result = await analyzeInfrastructureImage(photoUrl, coordinates);
    setAiAnalysis(result);
    setIsScanning(false);
  };

  // Custom File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handlePhotoSelect(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Live Web Camera Stream
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Live video stream not available or blocked:", err);
    }
  };

  // Stop Web Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Take Snapshot from Camera
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    stopCamera();
    handlePhotoSelect(dataUrl);
  };

  // Fetch High-Precision Current Geolocation & Real-Time Address
  const handleGetLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        
        setCoordinates([lat, lng]);

        const geoResult = await fetchAddressAndWard(lat, lng);
        setAddress(geoResult.address);
        setDetectedWard(geoResult.ward);

        if (selectedPhoto) {
          const updatedAnalysis = await analyzeInfrastructureImage(selectedPhoto, [lat, lng]);
          setAiAnalysis(updatedAnalysis);
        }

        setIsLocating(false);
      },
      async (err) => {
        console.warn("Geolocation error, using high-accuracy IP fallback:", err);
        const fallbackLat = 12.9260;
        const fallbackLng = 77.6762;
        setCoordinates([fallbackLat, fallbackLng]);
        const geoResult = await fetchAddressAndWard(fallbackLat, fallbackLng);
        setAddress(geoResult.address);
        setDetectedWard(geoResult.ward);
        setIsLocating(false);
      },
      geoOptions
    );
  };

  // Map Picker Callback
  const handleMapLocationSelect = async (coords, ward) => {
    setCoordinates(coords);
    setIsPickerActive(false);

    const geoResult = await fetchAddressAndWard(coords[0], coords[1]);
    setAddress(geoResult.address);
    setDetectedWard(geoResult.ward);

    if (selectedPhoto) {
      const updatedAnalysis = await analyzeInfrastructureImage(selectedPhoto, coords);
      setAiAnalysis(updatedAnalysis);
    }
  };

  // Submit Issue
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aiAnalysis || !selectedPhoto) return;

    setSubmitting(true);

    setTimeout(() => {
      const reporterDisplay = citizenPhone 
        ? `${citizenName || 'Citizen'} (Mob: ${citizenPhone})` 
        : (citizenName || 'Citizen');

      const newIssue = {
        id: `INFRA-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${aiAnalysis.defectName} at ${detectedWard.name}`,
        category: aiAnalysis.category,
        defectName: aiAnalysis.defectName,
        severityScore: aiAnalysis.severityScore,
        hazardLevel: aiAnalysis.hazardLevel,
        priorityCode: aiAnalysis.priorityCode,
        status: "Pending",
        coordinates: coordinates,
        address: address,
        ward: detectedWard,
        beforeImage: selectedPhoto,
        afterImage: null,
        reportedBy: reporterDisplay,
        reporterName: citizenName,
        reporterPhone: citizenPhone,
        createdAt: new Date().toLocaleString(),
        assignedTeam: null,
        workerNotes: null,
        aiDescription: aiAnalysis.aiDescription
      };

      onSubmitIssue(newIssue);
      setSubmitting(false);
      setIsSubmitted(true);
      setCitizenName("");
      setCitizenPhone("");
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setAiAnalysis(null);
      setTimeout(() => setIsSubmitted(false), 4000);
    }, 600);
  };

  // Filter issues for reported list
  const filteredCitizenIssues = issues.filter(i => {
    if (citizenFilterStatus === "ALL") return true;
    return i.status === citizenFilterStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Banner Intro */}
      <div className="glass-panel p-6 border-l-4 border-l-blue-600 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white shadow-sm rounded-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" /> {tc.portalBadge}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{tc.title}</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {tc.desc}
          </p>
        </div>
      </div>

      {/* Main Grid: Upload & AI Analysis | Location & Geotagging */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Photo Upload & AI Vision Diagnosis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 bg-white shadow-sm rounded-xl space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              {tc.step1}
            </h3>

            {/* Capture & Upload Dual Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Live Camera */}
              <button
                type="button"
                onClick={startCamera}
                className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 transition-all flex flex-col items-center justify-center gap-2 text-blue-800 font-bold group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs">{tc.captureCam}</span>
              </button>

              {/* Option B: File Uploader */}
              <label className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 font-bold cursor-pointer group shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs">{tc.uploadFile}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

            </div>

            {/* Photo Display Screen / Upload Dropzone */}
            <div className="relative rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors p-4 flex flex-col items-center justify-center min-h-[280px]">
              
              {previewUrl ? (
                <div className="relative w-full flex flex-col items-center">
                  <img src={previewUrl} alt="Defect preview" className="w-full max-h-72 object-contain rounded-lg shadow-sm bg-white p-2" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPreviewUrl(null);
                      setAiAnalysis(null);
                    }}
                    className="mt-3 btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" /> {tc.removeRetake}
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <ImageIcon className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
                  <p className="text-sm font-bold text-slate-700">{tc.noImage}</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {tc.noImageDesc}
                  </p>
                </div>
              )}

              {/* AI Cybernetic Scan Line Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center">
                  <div className="ai-scan-line" />
                  <div className="ai-target-box top-1/4 left-1/4 w-1/2 h-1/2" />
                  <Cpu className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                  <p className="text-sm font-bold text-slate-900">{tc.analyzing}</p>
                  <p className="text-xs text-slate-600 mt-1 font-mono">{tc.analyzingSub}</p>
                </div>
              )}
            </div>

            {/* AI Vision Diagnosis Output Card */}
            {aiAnalysis && !isScanning && (
              <div className="glass-panel p-5 border border-blue-200 bg-blue-50/40 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{tc.aiConfidence} {aiAnalysis.aiConfidence}</span>
                      <h4 className="text-base font-bold text-slate-900">{aiAnalysis.defectName}</h4>
                    </div>
                  </div>
                  <span className={`badge ${aiAnalysis.priorityCode === 'P1' ? 'badge-priority-p1' : 'badge-priority-p2'}`}>
                    Priority {aiAnalysis.priorityCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">{tc.domain}</span>
                    <span className="font-bold text-blue-700 truncate block">{aiAnalysis.category}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">{tc.severity}</span>
                    <span className="font-extrabold text-amber-600 text-sm">{aiAnalysis.severityScore}%</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">{tc.hazard}</span>
                    <span className="font-extrabold text-red-600 text-sm">{aiAnalysis.hazardLevel}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">{tc.repairWindow}</span>
                    <span className="font-bold text-emerald-700">{aiAnalysis.estimatedRepairHours}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-blue-200/80">
                  <strong className="text-blue-700">{tc.assessmentNote}</strong> {aiAnalysis.aiDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Geotagging & BBMP Ward Detector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 space-y-5 bg-white shadow-sm rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {tc.step2}
            </h3>

            {/* Location buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 shadow-2xs"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <span>{tc.currentGps}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPickerActive(!isPickerActive)}
                className={`btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 shadow-2xs ${isPickerActive ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' : ''}`}
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{isPickerActive ? tc.clickingMap : tc.manualPin}</span>
              </button>
            </div>

            {/* Interactive Leaflet Picker Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>{tc.mapLabel}</span>
                <span className="text-[11px] text-blue-700 font-mono font-bold">{coordinates[0]}, {coordinates[1]}</span>
              </div>
              <MapView 
                selectedLocation={coordinates}
                onLocationSelect={handleMapLocationSelect}
                isPickerActive={isPickerActive}
                center={coordinates}
                height="240px"
              />
            </div>

            {/* Detected BBMP Ward Display Card */}
            <div className="glass-panel p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">{tc.detectedWardLabel}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  BBMP Zone
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Ward {detectedWard.number}: {detectedWard.name}
                </h4>
              </div>
              <p className="text-xs text-blue-800 font-semibold">
                {tc.zone} {detectedWard.zone} ({detectedWard.description})
              </p>
              
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Selected Geotag Address:</span>
                <p className="text-xs text-slate-800 font-medium leading-tight mt-0.5">
                  {address}
                </p>
              </div>
            </div>

            {/* Submit Form with Separate Empty Name & Phone Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field 1: Reporter Name */}
                <div>
                  <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-blue-600" /> {tc.nameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={tc.namePlaceholder}
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Field 2: Reporter Phone */}
                <div>
                  <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> {tc.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    placeholder={tc.phonePlaceholder}
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !aiAnalysis || !selectedPhoto}
                className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> {tc.submitting}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> {tc.submitBtn}
                  </span>
                )}
              </button>

              {isSubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {tc.successMsg}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>

      {/* Live Camera Viewfinder Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 border border-slate-200 bg-white space-y-4 rounded-xl shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Live Camera Viewfinder
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-300">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={captureCameraPhoto}
                className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-md"
              >
                📸 Snap Defect Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="btn-secondary py-3 text-xs"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Citizen Track Submitted Issues & Live Progress Tracker */}
      <div className="glass-panel p-6 space-y-6 bg-white shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {tc.myIssuesTitle} ({issues.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Track real-time progress, assigned maintenance crews, and AI resolution proof
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2">
            {["ALL", "Pending", "In Progress", "Completed"].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setCitizenFilterStatus(statusKey)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${citizenFilterStatus === statusKey ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}`}
              >
                {statusKey === "ALL" ? "All Issues" : statusKey === "Pending" ? "Pending" : statusKey === "In Progress" ? "In Progress" : "Completed"}
              </button>
            ))}
          </div>
        </div>

        {filteredCitizenIssues.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">{tc.noIssuesYet}</p>
            <p className="text-xs text-slate-500 mt-1">{tc.noIssuesSub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCitizenIssues.map((item) => {
              // Calculate progress percentage and step details
              let progressPercent = 25;
              let progressStepText = "Report Received & AI Categorized";
              if (item.status === 'In Progress') {
                progressPercent = 65;
                progressStepText = `Assigned to ${item.assignedTeam || 'Maintenance Crew'}`;
              } else if (item.status === 'Completed') {
                progressPercent = 100;
                progressStepText = "Repair Completed & AI Proof Verified";
              }

              return (
                <div key={item.id} className="glass-panel p-5 space-y-4 border border-slate-200 bg-white hover:border-blue-300 transition-all rounded-xl shadow-2xs">
                  
                  {/* Issue Header & Badges */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${item.status === 'Pending' ? 'badge-pending' : item.status === 'In Progress' ? 'badge-progress' : 'badge-completed'}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-700">{item.id}</span>
                      <span className="text-xs text-slate-500 font-semibold">• {item.category}</span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Severity: <strong className="text-amber-600">{item.severityScore}%</strong></span>
                      <span>Priority: <strong className="text-red-600">{item.priorityCode}</strong></span>
                      <span className="text-slate-400">{item.createdAt}</span>
                    </div>
                  </div>

                  {/* Main Details Grid: Before/After Photos + Info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    
                    {/* Photos (4 Cols) */}
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="w-1/2 h-28 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 relative">
                        <img src={item.beforeImage} alt="Before" className="w-full h-full object-contain p-1" />
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Before</span>
                      </div>

                      <div className="w-1/2 h-28 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 relative">
                        {item.status === 'Completed' && item.afterImage ? (
                          <>
                            <img src={item.afterImage} alt="After" className="w-full h-full object-contain p-1" />
                            <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Resolved Proof</span>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 text-[10px]">
                            <Clock className="w-5 h-5 text-amber-500 mb-1" />
                            <span>Resolution Pending</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description & Ward Info (8 Cols) */}
                    <div className="md:col-span-8 space-y-2">
                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                      
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {item.address} (BBMP Ward {item.ward?.number}: {item.ward?.name})
                      </p>

                      <p className="text-xs text-slate-600">
                        {tc.reporter} <strong className="text-slate-800">{item.reportedBy}</strong>
                      </p>

                      {item.assignedTeam && (
                        <p className="text-xs text-blue-800 font-semibold flex items-center gap-1.5 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                          <HardHat className="w-4 h-4 text-blue-600" />
                          Assigned Maintenance Team: <strong>{item.assignedTeam}</strong>
                        </p>
                      )}

                      {item.workerNotes && (
                        <p className="text-xs text-emerald-900 font-medium bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <strong className="text-emerald-700">Worker Completion Notes:</strong> {item.workerNotes}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Visual 4-Step Resolution Progress Bar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <ActivityProgressIcon status={item.status} /> Status Tracker: <span className="text-blue-700 font-bold">{progressStepText}</span>
                      </span>
                      <span className={`font-mono text-xs ${item.status === 'Completed' ? 'text-emerald-600 font-extrabold' : 'text-blue-600'}`}>
                        {progressPercent}% Completed
                      </span>
                    </div>

                    {/* Progress Track Line */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${item.status === 'Completed' ? 'bg-emerald-600' : item.status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* 4 Steps Indicator Labels */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center pt-1">
                      <span className="text-blue-700 font-bold">1. Reported ✓</span>
                      <span className={item.status === 'In Progress' || item.status === 'Completed' ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                        2. Crew Assigned
                      </span>
                      <span className={item.status === 'In Progress' || item.status === 'Completed' ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                        3. Repair Work
                      </span>
                      <span className={item.status === 'Completed' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>
                        4. Resolved ✨
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Icon helper for progress status
function ActivityProgressIcon({ status }) {
  if (status === 'Completed') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === 'In Progress') return <Clock className="w-4 h-4 text-amber-500 animate-spin" />;
  return <AlertTriangle className="w-4 h-4 text-red-500" />;
}
