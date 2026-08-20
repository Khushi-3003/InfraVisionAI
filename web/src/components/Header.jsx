import React, { useState } from 'react';
import { Shield, User, HardHat, Eye, MapPin, Sparkles, CheckCircle2, AlertTriangle, Clock, Globe, ChevronDown } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ currentRole, setCurrentRole, currentLang, onLangChange, issues, t }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const pendingCount = issues.filter(i => i.status === 'Pending').length;
  const progressCount = issues.filter(i => i.status === 'In Progress').length;
  const completedCount = issues.filter(i => i.status === 'Completed').length;

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' }
  ];

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <header className="glass-panel border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-8 py-3.5 mb-6 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Eye className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  {t.appName} <span className="text-blue-600">{t.aiSuffix}</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Live Issue Stats Ticker */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-100/80 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.locationCity}</span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.stats.open}: <strong>{pendingCount}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.stats.inProgress}: <strong>{progressCount}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.stats.solved}: <strong>{completedCount}</strong></span>
          </div>
        </div>

        {/* Right Section: Language Selector + 3 Role Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Multi-Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-2 shadow-2xs transition-colors"
              title="Select Language / ਭਾਸ਼ਾ ਚੁਣੋ / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{currentLangObj.flag} {currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-slate-100 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                <div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLangChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-blue-50 transition-colors ${currentLang === lang.code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'}`}
                    >
                      <span>{lang.name}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 Role Switcher */}
          <div className="role-pill">
            <button
              onClick={() => setCurrentRole('citizen')}
              className={`role-btn ${currentRole === 'citizen' ? 'active' : ''}`}
              title="Report defects and track submitted issues"
            >
              <User className="w-4 h-4" />
              <span>{t.roles.citizen}</span>
            </button>
            
            <button
              onClick={() => setCurrentRole('admin')}
              className={`role-btn ${currentRole === 'admin' ? 'active' : ''}`}
              title="View map analytics and assign maintenance crews"
            >
              <Shield className="w-4 h-4" />
              <span>{t.roles.admin}</span>
            </button>

            <button
              onClick={() => setCurrentRole('worker')}
              className={`role-btn ${currentRole === 'worker' ? 'active' : ''}`}
              title="Accept tasks and upload resolution proof"
            >
              <HardHat className="w-4 h-4" />
              <span>{t.roles.worker}</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
