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
    } 
        else {
  const user = GramQuestDB.loginUser(
    'guest',
    'Telegram User',
    '',
    finalStartParam
  );
  setCurrentUser(user);
        }

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
