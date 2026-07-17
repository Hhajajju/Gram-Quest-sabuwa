import React, { useState, useEffect } from 'react';
import UserPanel from './components/UserPanel';
import { GramQuestDB } from './database';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  useEffect(() => {
    // 1. Detect Telegram WebApp parameters
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Attempt to read Telegram User details
    let tgUser = tg?.initDataUnsafe?.user;
    let startParam = tg?.initDataUnsafe?.start_param || null;

    // Fallback: Read query parameters for easy testing/simulation (e.g., ?startapp=1001)
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('ref');
    const finalStartParam = startParam || urlStartParam;

    if (tgUser) {
      // Real Telegram identity connected
      const user = GramQuestDB.loginUser(
        tgUser.id.toString(),
        tgUser.username || `tg_user_${tgUser.id}`,
        tgUser.photo_url || '',
        finalStartParam
      );
      setCurrentUser(user);
    } else {
      // Development or simulated profile login
      // Read simulated states from localStorage or defaults
      const storedSim = localStorage.getItem('gq_sim_identity');
      if (storedSim) {
        try {
          const parsed = JSON.parse(storedSim);
          setSimId(parsed.id);
          setSimName(parsed.name);
          setSimPhoto(parsed.photo);
          const user = GramQuestDB.loginUser(parsed.id, parsed.name, parsed.photo, finalStartParam);
          setCurrentUser(user);
          return;
        } catch {
          // ignore
        }
      }

      const user = GramQuestDB.loginUser(simId, simName, simPhoto, finalStartParam);
      setCurrentUser(user);
    }
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Allow switching identities to test Referral systems
  const handleSwitchSimulatedIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simId.trim() || !simName.trim()) {
      alert('Please fill out all identity fields.');
      return;
    }

    // Save configuration
    localStorage.setItem('gq_sim_identity', JSON.stringify({ id: simId, name: simName, photo: simPhoto }));

    // Re-trigger login user
    // Look if any custom query parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    const finalStartParam = urlParams.get('startapp') || urlParams.get('ref') || null;

    const user = GramQuestDB.loginUser(simId, simName, simPhoto, finalStartParam);
    setCurrentUser(user);
    setShowIdentityModal(false);
    alert(`Switched identity successfully! Logged in as @${simName} (ID: ${simId}).`);
    window.location.reload(); // Refresh to clean state & load stats
  };

  const handleResetApp = () => {
    if (confirm('Are you sure you want to reset all data (users, balances, settings, withdrawals, referrals) back to default?')) {
      localStorage.clear();
      alert('All app state reset! Reloading...');
      window.location.reload();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-400">Booting Gram Quest Server Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Dev Controller Floating Bar for AI Studio Interface Verification */}
      <div className="bg-[#121c32]/90 border-b border-blue-500/15 text-xs text-blue-300 px-4 py-2 flex flex-wrap justify-between items-center gap-3 relative z-50">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded font-black text-[9px]">DEV TOOLS</span>
          <span className="opacity-80">Referral/Multi-Identity Emulator</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowIdentityModal(true)}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20 text-[10px] font-bold transition-all"
          >
            👤 Switch Telegram Identity
          </button>
          
          <button 
            onClick={handleResetApp}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded border border-red-500/20 text-[10px] font-bold transition-all"
          >
            🔄 Reset Database (Fresh Start)
          </button>

          <span className="opacity-40">|</span>

          <span className="text-[10px] opacity-80">
            Testing Referrals? Add <code className="bg-black/40 px-1 rounded text-yellow-500 font-mono">?startapp=1001</code> to URL
          </span>
        </div>
      </div>

      {/* Main Container Router */}
      <UserPanel 
  currentUser={currentUser}
  onUpdateUser={handleUpdateUser}
/>

      {/* DEV IDENTITY EMULATOR MODAL */}
      {showIdentityModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSwitchSimulatedIdentity}
            className="w-full max-w-md bg-[#0c1221] border border-blue-500/20 p-6 rounded-2xl shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-sm text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Simulate Telegram Account</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowIdentityModal(false)}
                className="text-gray-500 hover:text-white"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] opacity-75">
              Simulating multiple identities is key to testing the referral structures: register accounts, verify daily task completion, and check lifetime commission logs.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Telegram User ID (Must be numeric/unique)</label>
                <input 
                  type="text" 
                  value={simId}
                  onChange={e => setSimId(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-xl px-4.5 py-3 text-xs text-white"
                  placeholder="e.g. 55627192"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Telegram Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50">@</span>
                  <input 
                    type="text" 
                    value={simName}
                    onChange={e => setSimName(e.target.value.replace(/\s/g, ''))}
                    className="w-full bg-[#11192e] border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-xs text-white"
                    placeholder="QuestMaster"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Avatar Image URL</label>
                <input 
                  type="url" 
                  value={simPhoto}
                  onChange={e => setSimPhoto(e.target.value)}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-xl px-4.5 py-3 text-xs text-white"
                  placeholder="Paste profile photo URL"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-850">
              <button 
                type="button" 
                onClick={() => setShowIdentityModal(false)}
                className="bg-gray-850 hover:bg-gray-800 text-xs px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg shadow-lg"
              >
                Log In Virtual Identity
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// Simple internal X icon for clean look
function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
