import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CitizenPortal from './components/CitizenPortal';
import AdminPortal from './components/AdminPortal';
import WorkerPortal from './components/WorkerPortal';
import { getStoredIssues, addIssue, updateIssueStatus } from './services/StorageService';
import { TRANSLATIONS } from './data/translations';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('citizen'); // 'citizen' | 'admin' | 'worker'
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("infravision_lang") || "en");
  const [issues, setIssues] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Active translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Persist language change
  const handleLangChange = (langKey) => {
    setCurrentLang(langKey);
    localStorage.setItem("infravision_lang", langKey);
  };

  // Load issues on mount and subscribe to real-time storage updates
  useEffect(() => {
    setIssues(getStoredIssues());

    const handleDataChange = () => {
      setIssues(getStoredIssues());
    };

    window.addEventListener("infravision_data_changed", handleDataChange);
    return () => window.removeEventListener("infravision_data_changed", handleDataChange);
  }, []);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Submit new issue from Citizen role
  const handleSubmitIssue = (newIssue) => {
    const updated = addIssue(newIssue);
    setIssues(updated);
    showToast(`Issue ${newIssue.id} submitted! Geotagged at Ward ${newIssue.ward?.number} (${newIssue.ward?.name}).`);
  };

  // Assign worker team from Admin role
  const handleAssignTeam = (issueId, teamName) => {
    const updated = updateIssueStatus(issueId, {
      assignedTeam: teamName,
      status: "In Progress"
    });
    setIssues(updated);
    showToast(`Assigned ${teamName} to ${issueId}. Status updated to In Progress.`);
  };

  // Mark task completed from Worker role
  const handleCompleteTask = (issueId, completionData) => {
    const updated = updateIssueStatus(issueId, completionData);
    setIssues(updated);
    showToast(`Task ${issueId} completed with photo proof! Issue marked Resolved.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-12">
      
      {/* Persistent Navigation Header & Role & Language Selector */}
      <Header 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole} 
        currentLang={currentLang}
        onLangChange={handleLangChange}
        issues={issues} 
        t={t}
      />

      {/* Main Content Area based on Active Role */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 flex-1 w-full">
        {currentRole === 'citizen' && (
          <CitizenPortal 
            issues={issues} 
            onSubmitIssue={handleSubmitIssue} 
            t={t}
          />
        )}

        {currentRole === 'admin' && (
          <AdminPortal 
            issues={issues} 
            onAssignTeam={handleAssignTeam} 
            onUpdateStatus={updateIssueStatus} 
            t={t}
          />
        )}

        {currentRole === 'worker' && (
          <WorkerPortal 
            issues={issues} 
            onCompleteTask={handleCompleteTask} 
            t={t}
          />
        )}
      </main>

      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-3 border border-blue-300 bg-white/95 text-slate-800 text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 {t.appName} {t.aiSuffix} • Smart Municipal Infrastructure Monitoring (Bengaluru BBMP Module)</p>
        <p className="text-slate-600 font-mono">Languages: English | ಕನ್ನಡ | हिंदी</p>
      </footer>

    </div>
  );
}
