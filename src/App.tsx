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
    const tgUser = tg?.initDataUnsafe?.user;
const startParam = tg?.initDataUnsafe?.start_param || null;

    // Fallback: Read query parameters for easy testing/simulation (e.g., ?startapp=1001)
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('ref');
    const finalStartParam = startParam || urlStartParam;

    if (tgUser) {
  const user = await GramQuestDB.loginUser(
  tgUser.id.toString(),
  tgUser.username || `tg_user_${tgUser.id}`,
  tgUser.photo_url || '',
  finalStartParam
);

setCurrentUser(user);
} else {
  const user = GramQuestDB.loginUser(
    'guest',
    'Telegram User',
    '',
    finalStartParam
  );
  setCurrentUser(user);
    }
  }, []);
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
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
    <UserPanel
      currentUser={currentUser}
      onUpdateUser={handleUpdateUser}
    />
  </div>
);
    
}


