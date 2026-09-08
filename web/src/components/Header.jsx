import React, { useState, useEffect } from 'react';
import { Shield, User, HardHat, Eye, MapPin, Sparkles, CheckCircle2, AlertTriangle, Clock, Globe, ChevronDown, Bus, Key, X, Check } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { getGeminiApiKey, setGeminiApiKey } from '../services/AiDetector';

export default function Header({ currentRole, setCurrentRole, currentLang, onLangChange, issues, t }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKeyInput] = useState("");
  const [isGeminiActive, setIsGeminiActive] = useState(false);

  useEffect(() => {
    const key = getGeminiApiKey();
    setIsGeminiActive(!!key);
    if (key) setGeminiApiKeyInput(key);

    const handleKeyChange = () => {
      const k = getGeminiApiKey();
      setIsGeminiActive(!!k);
      if (k) setGeminiApiKeyInput(k);
    };

    const handleOpenModal = () => setKeyModalOpen(true);

    window.addEventListener("infravision_gemini_key_changed", handleKeyChange);
    window.addEventListener("open_gemini_key_modal", handleOpenModal);
    return () => {
      window.removeEventListener("infravision_gemini_key_changed", handleKeyChange);
      window.removeEventListener("open_gemini_key_modal", handleOpenModal);
    };
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGeminiApiKey(geminiApiKey);
    setKeyModalOpen(false);
  };

  const handleClearKey = () => {
    setGeminiApiKey("");
    setGeminiApiKeyInput("");
    setKeyModalOpen(false);
  };

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

        {/* Right Section: Gemini Key Badge + Language Selector + 4 Role Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Gemini AI Key Status Badge */}
          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isGeminiActive
                ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-purple-200 border-purple-500/60 shadow-sm animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Configure Google Gemini Vision API Key"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeminiActive ? 'text-purple-400 animate-spin' : 'text-slate-500'}`} />
            <span>{isGeminiActive ? '✨ Gemini AI Active' : '🔑 Gemini API Key'}</span>
          </button>

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

          {/* 4 Role Switcher */}
          <div className="role-pill flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentRole('citizen')}
              className={`role-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentRole === 'citizen' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              title="Report defects and track submitted issues"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.roles.citizen || "Citizen"}</span>
            </button>
            
            <button
              onClick={() => setCurrentRole('admin')}
              className={`role-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentRole === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              title="View map analytics and assign maintenance crews"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.roles.admin || "Admin"}</span>
            </button>

            <button
              onClick={() => setCurrentRole('worker')}
              className={`role-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentRole === 'worker' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              title="Accept tasks and upload resolution proof"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>{t.roles.worker || "Worker"}</span>
            </button>

            <button
              onClick={() => setCurrentRole('transit')}
              className={`role-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentRole === 'transit' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              title="Simulated BMTC Bus AI Dashcam Road Defect Scanner"
            >
              <Bus className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.roles.transit || "Smart Bus"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Gemini API Key Settings Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Gemini Vision AI</h3>
                  <p className="text-xs text-slate-500">Configure your Gemini API key for high-accuracy vision analysis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gemini API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Obtain your key free from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-600 underline font-semibold">Google AI Studio</a>. Key is securely stored locally in your browser.
                </p>
              </div>

              {isGeminiActive && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Gemini Vision AI is active! Real multimodal AI will analyze all road defect images.</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {isGeminiActive ? (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    Remove Key
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Key</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
