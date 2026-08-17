import React from 'react';
import { Shield, User, HardHat, Eye, MapPin, Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function Header({ currentRole, setCurrentRole, issues }) {
  const pendingCount = issues.filter(i => i.status === 'Pending').length;
  const progressCount = issues.filter(i => i.status === 'In Progress').length;
  const completedCount = issues.filter(i => i.status === 'Completed').length;

  return (
    <header className="glass-panel border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-8 py-3.5 mb-6 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Eye className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  InfraVision <span className="text-blue-600">AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                AI Defect Detection, Geo-Tagging &amp; Ward Maintenance
              </p>
            </div>
          </div>
        </div>

        {/* Live Issue Stats Ticker */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100/80 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Bengaluru City</span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Open: <strong>{pendingCount}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress: <strong>{progressCount}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solved: <strong>{completedCount}</strong></span>
          </div>
        </div>

        {/* 3 Role Switcher */}
        <div className="role-pill">
          <button
            onClick={() => setCurrentRole('citizen')}
            className={`role-btn ${currentRole === 'citizen' ? 'active' : ''}`}
            title="Report defects and track submitted issues"
          >
            <User className="w-4 h-4" />
            <span>Citizen</span>
          </button>
          
          <button
            onClick={() => setCurrentRole('admin')}
            className={`role-btn ${currentRole === 'admin' ? 'active' : ''}`}
            title="View map analytics and assign maintenance crews"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setCurrentRole('worker')}
            className={`role-btn ${currentRole === 'worker' ? 'active' : ''}`}
            title="Accept tasks and upload resolution proof"
          >
            <HardHat className="w-4 h-4" />
            <span>Worker</span>
          </button>
        </div>

      </div>
    </header>
  );
}
