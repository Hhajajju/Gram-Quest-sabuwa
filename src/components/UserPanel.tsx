import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, 
  Wallet, 
  RotateCw, 
  Users, 
  Trophy, 
  Settings, 
  Bell, 
  HelpCircle, 
  ShieldAlert, 
  TrendingUp, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  ArrowDownLeft, 
  ArrowUpRight,  
  User as UserIcon,
  Sun,
  Moon,
  Clock,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BotNotification } from '../database';
import { User, Task, Referral, Withdrawal, SpinHistory, AppSettings } from '../types';

interface UserPanelProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function UserPanel({ currentUser, onUpdateUser }: UserPanelProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'spin' | 'friends' | 'wallet' | 'ranks'>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<BotNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const adsgramRef = useRef<any>(null);

useEffect(() => {

  let adsgramElement: any;
  let handleAdsgramComplete: any;

  const timer = setTimeout(() => {

    adsgramElement = adsgramRef.current;

    if (!adsgramElement) {
      console.log("AdsGram element not ready");
      return;
    }


    handleAdsgramComplete = async () => {

      try {

        setIsVerifying(true);

        const response = await fetch(
          "https://gram-quest-api.raheeumar9.workers.dev/api/verify-adsgram-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              telegramId: currentUser.telegramId,
              blockId: "task-38672"
            })
          }
        );


        const result = await response.json();


        if (result.success) {

          alert(`🎉 AdsGram completed! +${result.reward} Coins added.`);

          const updatedUser = await fetch(
            `https://gram-quest-api.raheeumar9.workers.dev/api/user/${currentUser.telegramId}`
          );

          const userData = await updatedUser.json();

          onUpdateUser(userData);

        } else {

          alert(result.message);

        }


      } catch(error) {

        console.error("AdsGram error:", error);

      } finally {

        setIsVerifying(false);

      }

    };


    adsgramElement.addEventListener(
      "adsgram:complete",
      handleAdsgramComplete
    );


  }, 1000);


  return () => {

    clearTimeout(timer);

    if (adsgramElement && handleAdsgramComplete) {

      adsgramElement.removeEventListener(
        "adsgram:complete",
        handleAdsgramComplete
      );

    }

  };


}, [currentUser.telegramId, onUpdateUser]);
    
  // Spin Wheel States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const [claimableSpinReward, setClaimableSpinReward] = useState<number | null>(null);
  const [isSpinAdCompleted, setIsSpinAdCompleted] = useState(false);
  const [spinHistory, setSpinHistory] = useState<SpinHistory[]>([]);

  // Conversion States
  const [coinsToConvert, setCoinsToConvert] = useState<string>('');
  const [conversionError, setConversionError] = useState('');
  const [conversionSuccess, setConversionSuccess] = useState('');

  // Withdrawal States
  const [tonAddress, setTonAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Referrals State
  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [dailyReferralCount, setDailyReferralCount] = useState(0);

  // Leaderboard States
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [countdown, setCountdown] = useState({ days: 29, hours: 23, minutes: 59, seconds: 59 });

  // Theme State (Internal to keep styling native)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load initial data for user
  useEffect(() => {
    refreshData();
    // Countdown timer for 30 days
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          return { days: 30, hours: 0, minutes: 0, seconds: 0 }; // reset
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser.telegramId, activeTab]);

  const refreshData = async () => {
  try {
    const settingsRes = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/settings"
);

const appSettings = await settingsRes.json();

console.log("SETTINGS FROM CLOUDFLARE:", appSettings);

setSettings(appSettings);
    // Reload user from Cloudflare D1 to get accurate balances
const userRes = await fetch(
  `https://gram-quest-api.raheeumar9.workers.dev/api/user/${currentUser.telegramId}`
);

const updatedUser = await userRes.json();


    if (updatedUser) {
      onUpdateUser(updatedUser);
    }

    const tasksRes = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/tasks"
);

const loadedTasks = await tasksRes.json();

setTasks(loadedTasks);
    const progressRes = await fetch(
  `https://gram-quest-api.raheeumar9.workers.dev/api/task-progress/${currentUser.telegramId}`
);

const progressData = await progressRes.json();

setCompletedTasksCount(progressData.completed);
setNotifications([]);
    
    // Withdrawals
    const withdrawalsRes = await fetch(
  `https://gram-quest-api.raheeumar9.workers.dev/api/withdrawals/${currentUser.telegramId}`
);

const userWithdrawals = await withdrawalsRes.json();

setWithdrawals(userWithdrawals);

    // Referrals
    const refsRes = await fetch(
  `https://gram-quest-api.raheeumar9.workers.dev/api/referrals/${currentUser.telegramId}`
);

const userRefs = await refsRes.json();

setReferralsList(userRefs);

    // Count verified refs in last 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const verifiedLast24h = userRefs.filter(r => r.status === 'verified' && r.verifiedAt && new Date(r.verifiedAt) > last24h).length;
    setDailyReferralCount(verifiedLast24h);

    // Spin History
    const historyRes = await fetch(
  `https://gram-quest-api.raheeumar9.workers.dev/api/spin-history/${currentUser.telegramId}`
);

const history = await historyRes.json();

setSpinHistory(history);

    // Leaderboard
setLeaderboardUsers([]);

  } catch (error) {
  console.error("Refresh data failed:", error);
  alert("Refresh data failed: " + error.message);
  }
};

  // 1. Copy referral link
  const handleCopyLink = () => {
  if (!settings) return;

  const link = `https://t.me/${settings.botUsername}?startapp=${currentUser.telegramId}`;
  navigator.clipboard.writeText(link);
  setCopiedLink(true);

  setTimeout(() => setCopiedLink(false), 2000);
};
  // 2. Watch Partner Task specifications
  const handleStartTask = async (task: Task) => {

  try {

    const response = await fetch(
      "https://gram-quest-api.raheeumar9.workers.dev/api/complete-task",
      {
        method: "POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          telegramId: currentUser.telegramId,
          taskId: task.taskId
        })
      }
    );


    const result = await response.json();


    if(result.success){

      onUpdateUser(result.user);

      alert(
        `🎉 Task completed! +${result.reward.toLocaleString()} Coins`
      );

      refreshData();

    } else {

      alert(result.message);

    }


  } catch(error){

    alert("Task completion failed");

  }

};

  const handleReward = async (event: any) => {
    const blockId = event.detail || 'task-38736';
    setIsVerifying(true);
    try {
      const response = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/verify-adsgram-task",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      telegramId: currentUser.telegramId,
      blockId: blockId
    })
  }
);

const res = await response.json();
      if (res.success) {
        refreshData();
        alert(`🎉 Reward Confirmed! +${res.reward.toLocaleString()} Coins added to your balance.`);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Network error during backend verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (event: any) => {
    alert(`Adsgram Task Error: Error during loading or render for block ${event.detail}`);
  };

  const handleNotFound = (event: any) => {
    alert('No task available');
  };

  const handleTooLongSession = () => {
    alert('The session is too long. Please restart the Telegram Mini App.');
  };

  const setAdsgramRef = (element: HTMLElement | null) => {
    if (element) {
      element.removeEventListener('reward', handleReward);
      element.removeEventListener('onError', handleError);
      element.removeEventListener('onBannerNotFound', handleNotFound);
      element.removeEventListener('onTooLongSession', handleTooLongSession);

      element.addEventListener('reward', handleReward);
      element.addEventListener('onError', handleError);
      element.addEventListener('onBannerNotFound', handleNotFound);
      element.addEventListener('onTooLongSession', handleTooLongSession);
    }
  };
      

// 3. Claim 30 Task Daily Bonus
const handleClaimDailyBonus = async () => {
  try {
    const res = await fetch(
      "https://gram-quest-api.raheeumar9.workers.dev/api/daily-bonus",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          telegramId: currentUser.telegramId
        })
      }
    );

    const data = await res.json();

    if (data.success) {
      onUpdateUser(data.user);
      refreshData();
      alert(data.message);
    } else {
      alert(data.message);
    }

  } catch (error) {
    alert("Daily bonus failed");
  }
};

  // 4. Spin Wheel Animation
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setClaimableSpinReward(null);
    setIsSpinAdCompleted(false);

    const response = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/spin",
  {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      telegramId: currentUser.telegramId
    })
  }
);


const res = await response.json();
    if (res.success) {
      // Determine rotation angle
      // Rewards: 100, 500, 1000, 2000, 3000
      // Let's map each reward to an angle range
      const rewardsMap = [100, 500, 1000, 2000, 3000];
      const index = rewardsMap.indexOf(res.reward);
      // Each segment is 72 degrees (360 / 5)
      // To make segment centered perfectly at pointer on land:
      const targetAngle = 3600 + (360 - (index * 72 + 36));

      setSpinAngle(targetAngle);
      setSpinResult(res.reward);

      setTimeout(() => {
        setIsSpinning(false);
        setClaimableSpinReward(res.reward);
      }, 3000); // 3 seconds spin animation
    } else {
      setIsSpinning(false);
      alert(res.message);
    }
  };

  const handleWatchSpinAd = () => {
    if (claimableSpinReward === null) return;
    setIsVerifying(true);

    if (typeof (window as any).showGiga === 'function') {
      (window as any).showGiga()
        .then(() => {
          setIsVerifying(false);
          setIsSpinAdCompleted(true);
          alert("🎉 Gigapubs ad completed successfully! Your claim button is now unlocked.");
        })
        .catch((err: any) => {
          setIsVerifying(false);
          alert("Advertisement was not fully completed. Please watch the ad entirely to unlock your reward.");
        });
    } else {
      setIsVerifying(false);
      alert("⚠️ Gigapubs Ads SDK is currently loading or blocked by an adblocker. Please disable your adblocker to watch the ad and claim your coins.");
    }
  };

  const handleClaimSpinReward = () => {
    if (claimableSpinReward === null) return;
    if (!isSpinAdCompleted) {
      alert("Please watch the advertisement to unlock your winnings first.");
      return;
    }
    
    GramQuestDB.claimSpinReward(currentUser.telegramId, claimableSpinReward);
    const wonReward = claimableSpinReward;
    setClaimableSpinReward(null);
    setSpinResult(null);
    setSpinAngle(0);
    setIsSpinAdCompleted(false);
    refreshData();
    alert(`🎉 Successfully claimed ${wonReward.toLocaleString()} Coins! Your balance has been updated immediately.`);
  };

  // 5. Convert Coins
  const handleConvertCoins = (e: React.FormEvent) => {
    e.preventDefault();
    setConversionError('');
    setConversionSuccess('');

    const amount = parseInt(coinsToConvert);
    if (isNaN(amount) || amount <= 0) {
      setConversionError('Please enter a valid amount of Coins');
      return;
    }

    const response = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/convert",
  {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      telegramId: currentUser.telegramId,
      amount: amount
    })
  }
);

const res = await response.json();
    if (res.success) {
      setConversionSuccess(res.message);
      setCoinsToConvert('');
      refreshData();
    } else {
      setConversionError(res.message);
    }
  };

  // 6. Request Withdrawal
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid amount of Gram');
      return;
    }

    if (!tonAddress.trim() || tonAddress.length < 15) {
      setWithdrawError('Please enter a valid TON address');
      return;
    }

    const response = await fetch(
  "https://gram-quest-api.raheeumar9.workers.dev/api/withdraw",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      telegramId: currentUser.telegramId,
      amount: amount,
      tonAddress: tonAddress
    })
  }
);

const res = await response.json();
    if (res.success) {
      setWithdrawSuccess(res.message);
      setWithdrawAmount('');
      setTonAddress('');
      refreshData();
    } else {
      setWithdrawError(res.message);
    }
  };
  if (!currentUser) {
  return <div className="p-5 text-white">No user found</div>;
  }
if (!settings) {
  return (
    <div className="p-5 text-white">
      Loading settings...
    </div>
  );
                   }

return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'} pb-24 font-sans transition-colors duration-300`}>
      
    

      {/* Main Header */}
      <header className={`px-4 pt-5 pb-4 flex justify-between items-center ${theme === 'dark' ? 'bg-[#101726]/60 border-b border-gray-800' : 'bg-white border-b border-gray-200'} sticky top-0 z-40 backdrop-blur-md`}>
        <div className="flex items-center space-x-3">
          <img 
            src={currentUser.profilePhoto} 
            alt={currentUser.username} 
            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shadow-inner"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-sm tracking-tight">@{currentUser.username}</span>
              {currentUser.verifiedReferrals >= 10 && (
                <span className="bg-blue-600 text-[10px] px-1.5 py-0.2 rounded text-white font-extrabold uppercase scale-90">PRO</span>
              )}
            </div>
            <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ID: {currentUser.telegramId}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-yellow-400 hover:bg-gray-750' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all`}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Support Link */}
          <a 
            href={settings ? `https://t.me/${settings.supportUsername}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-750' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all`}
            title="Support"
          >
            <HelpCircle className="w-4 h-4" />
          </a>

          {/* Notification bell */}
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) refreshData();
            }}
            className={`p-2 rounded-full relative ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-750' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all`}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] text-white font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Stats Display Area */}
      <section className="px-4 py-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Coin Balance Card */}
          <div className={`p-4 rounded-2xl relative overflow-hidden shadow-lg border ${theme === 'dark' ? 'bg-[#10172a] border-gray-800' : 'bg-white border-gray-100'} transition-all hover:scale-[1.01]`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Coins className="w-20 h-20 text-yellow-500" />
            </div>
            <p className={`text-[11px] font-medium tracking-wider uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Coin Balance</p>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-yellow-500 tracking-tight">{currentUser.coinBalance.toLocaleString()}</span>
              <span className="text-xs font-bold text-yellow-500/80">COINS</span>
            </div>
            <p className="text-[10px] mt-1.5 text-blue-400/80 font-medium">Earned from Ads, Wheel & Tasks</p>
          </div>

          {/* Gram Balance Card */}
          <div className={`p-4 rounded-2xl relative overflow-hidden shadow-lg border ${theme === 'dark' ? 'bg-[#10172a] border-gray-800' : 'bg-white border-gray-100'} transition-all hover:scale-[1.01]`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Wallet className="w-20 h-20 text-blue-500" />
            </div>
            <p className={`text-[11px] font-medium tracking-wider uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gram Balance</p>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-blue-500 tracking-tight">{currentUser.gramBalance.toFixed(4)}</span>
              <span className="text-xs font-bold text-blue-500/80">GRAM</span>
            </div>
            <button 
              onClick={() => setActiveTab('wallet')}
              className="text-[10px] mt-1.5 text-blue-400 hover:underline font-bold flex items-center space-x-0.5"
            >
              <span>Withdraw & Swap</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Outer Notifications Drawer Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-w-md h-full ${theme === 'dark' ? 'bg-[#0f1423]' : 'bg-white'} p-5 flex flex-col shadow-2xl overflow-y-auto`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-lg flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <span>Bot Notifications</span>
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750 text-white' : 'bg-gray-200 hover:bg-gray-350 text-black'}`}
                >
                  Close
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <Bell className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm">No new bot messages received.</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-250'} text-xs`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-blue-400 text-[10px]">🤖 Telegram Notification</span>
                        <span className="text-[10px] opacity-60">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs Navigation Body */}
      <main className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 30 TASK DAILY BONUS SECTION */}
              <section className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#10172e] to-[#0d1222] border-gray-800' : 'bg-white border-gray-150'} shadow-md`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight flex items-center space-x-1.5">
                      <span className="text-yellow-500">🏆</span>
                      <span>30-Task Daily Bonus</span>
                    </h3>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Complete Adsgram and normal tasks to unlock</p>
                  </div>
                  <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                    +30,000 COINS
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-blue-400">Progress</span>
                    <span className="opacity-80">{completedTasksCount}/30 Tasks</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (completedTasksCount / 30) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] opacity-60">
                    <span>{Math.round((completedTasksCount / 30) * 100)}% Completed</span>
                    <span>Resets on claim</span>
                  </div>
                </div>

                <div className="mt-4 pt-1">
                  <button 
                    disabled={completedTasksCount < 30}
                    onClick={handleClaimDailyBonus}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                      completedTasksCount >= 30 
                        ? 'bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white shadow-lg scale-[1.01] active:scale-[0.99]' 
                        : `${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} text-gray-400 cursor-not-allowed`
                    }`}
                  >
                    {completedTasksCount >= 30 ? 'CLAIM 30,000 COINS BONUS 🎉' : 'COMPLETE 30 TASKS TO CLAIM'}
                  </button>
                </div>
              </section>

              {/* RULES SUMMARY BOX */}
              <section className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900/60 border-gray-850' : 'bg-gray-100/60 border-gray-200'}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h4 className="font-extrabold text-xs text-red-500 uppercase tracking-wider">Gram Quest Security Rules</h4>
                </div>
                <ul className="space-y-2 text-[11px] opacity-80 text-left list-disc list-inside">
                  <li>Fake task completion or auto-bots is strictly forbidden.</li>
                  <li>Fake referrals will result in balance deducted and account ban.</li>
                  <li>One user is allowed only one account. No multiple-account farming.</li>
                  <li>Users must properly join channels and open bots when requested for the Adsgram task.</li>
                  <li>Failure to adhere properly can lead to admin rejection of withdrawals.</li>
                </ul>
              </section>
            </motion.div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* TITLE & HEADER */}
              <div className="text-left px-1">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Gram Quest Quest-Board</span>
                </h2>
                <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Complete verification assignments below to claim massive Coin distributions
                </p>
              </div>
{/* OFFICIAL ADSGRAM SECURE TASK CARD */}
<div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-br from-[#10172e] to-[#0d1222] rounded-2xl border border-blue-500/10 space-y-4 text-center">
  <div className="text-center">
    <h4 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider mb-1">
      Official Adsgram Reward Center
    </h4>

    <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
      Complete tasks served directly by the official Adsgram SDK. Your reward will be verified securely through our Cloudflare Worker backend.
    </p>
  </div>


  {isVerifying ? (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-blue-400 font-bold animate-pulse">
        Contacting Cloudflare Worker...
      </p>
    </div>
  ) : (
    <div className="w-full flex justify-center py-2">

      {React.createElement('adsgram-task', {
        ref: adsgramRef,
        'data-block-id': "task-38672",
        'data-debug': "false",
        'data-debug-console': "false",
        class: "task"
      })}

    </div>
  )}


  <div className="text-[10px] text-gray-400 flex flex-wrap gap-2 items-center justify-center bg-black/20 px-3 py-1.5 rounded-lg border border-gray-800/40">

    <span className="flex items-center space-x-1">
      <span className="font-semibold text-gray-500">
        Block ID:
      </span>

      <code className="text-blue-400 font-mono">
        task-38736
      </code>
    </span>


    <span>•</span>


    <span className="flex items-center space-x-1">
      <span className="font-semibold text-gray-500">
        Daily limit:
      </span>

      <span className="text-yellow-500 font-bold">
        {settings.adsgramDailyLimit || 30}
      </span>
    </span>


    <span>•</span>


    <span className="flex items-center space-x-1">
      <span className="font-semibold text-gray-500">
        Yield:
      </span>

      <span className="text-yellow-400 font-bold">
        +{(settings.adsgramReward || 3000).toLocaleString()} Coins
      </span>
    </span>

  </div>

</div>               {/* ACTIVE PARTNER TASKS LIST */}
              <section className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-xs tracking-tight uppercase text-blue-400 flex items-center space-x-1.5">
                    <span>🔗</span>
                    <span>Verified Partner Tasks</span>
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {tasks.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 bg-[#101726]/40 rounded-xl border border-gray-800">
                      No partner tasks available.
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.taskId}
                        className={`p-3.5 rounded-xl border transition-all hover:border-blue-500/30 flex items-center justify-between ${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3 max-w-[70%]">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-xs tracking-tight truncate text-white">{task.title}</p>
                            <span className="text-[9px] opacity-65 flex items-center space-x-1 mt-0.5">
                              <span className="capitalize font-semibold text-blue-400">{task.type}</span>
                              <span>•</span>
                              <span>Limit: {task.dailyLimit} per day</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-black text-yellow-500">
                            +{task.reward.toLocaleString()}
                          </span>
                          <button 
                            onClick={() => handleStartTask(task)}
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-[10px] px-3.5 py-1.5 rounded-lg font-black transition-all active:scale-95"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* SPIN WHEEL TAB */}
          {activeTab === 'spin' && (
            <motion.div 
              key="spin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 flex flex-col items-center"
            >
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-lg tracking-tight">Lucky Spin Wheel</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Spin the wheel to win dynamic coin jackpots!</p>
              </div>

              {/* Spin wheel visual wrapper */}
              <div className="relative w-72 h-72 my-4">
                {/* Pointer marker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-40">
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-white absolute top-[-26px] left-[-6px] shadow-sm animate-ping" />
                </div>

                {/* Animated Rotating Wheel with Gold Rim Bulbs */}
                <div className="w-full h-full rounded-full p-2 bg-[#121824] shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative flex items-center justify-center">
                  
                  {/* Outer gold bulbs */}
                  {[...Array(12)].map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#fcd34d] z-30 transition-all duration-300"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${idx * 30}deg) translateY(-134px)`
                      }}
                    />
                  ))}

                  <motion.div 
                    className="w-full h-full rounded-full border-4 border-[#1c2438] relative overflow-hidden ring-2 ring-yellow-400/10 shadow-inner"
                    style={{ 
                      background: 'conic-gradient(#3b82f6 0deg 72deg, #10b981 72deg 144deg, #8b5cf6 144deg 216deg, #ec4899 216deg 288deg, #fbbf24 288deg 360deg)',
                      transform: `rotate(${spinAngle}deg)` 
                    }}
                    animate={isSpinning ? {} : { rotate: spinAngle }}
                    transition={isSpinning ? { duration: 0 } : { type: 'spring', damping: 20 }}
                  >
                    {/* Divider lines between segments */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-white/20 origin-bottom"
                        style={{ transform: `translateX(-50%) rotate(${i * 72}deg)` }}
                      />
                    ))}

                    {/* Wheel segments */}
                    {[100, 500, 1000, 2000, 3000].map((reward, i) => {
                      const angle = i * 72 + 36;
                      return (
                        <div 
                          key={i}
                          className="absolute top-0 left-0 w-full h-full origin-center flex flex-col items-center pt-6 text-white font-black"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <div className="text-center space-y-0.5">
                            <Coins className="w-5 h-5 text-white mx-auto drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.6)]" />
                            <span className="text-white text-[13px] font-extrabold drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.6)] tracking-tight">
                              {reward}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Centered logo spinner button */}
                    <div className="absolute inset-0 m-auto w-16 h-16 bg-[#111726] rounded-full border-4 border-yellow-400 flex flex-col items-center justify-center shadow-lg z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping absolute" />
                      <span className="text-[10px] font-black tracking-tighter text-yellow-400 uppercase">QUEST</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-sm space-y-3">
                {claimableSpinReward === null ? (
                  <button 
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL NOW'}</span>
                  </button>
                ) : (
                  <div className={`p-4 rounded-2xl border text-center space-y-4 ${theme === 'dark' ? 'bg-[#121c35] border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                    <p className="text-xs opacity-90">Congratulations! You landed on</p>
                    <div className="text-3xl font-black text-yellow-400 flex justify-center items-center space-x-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      <span>{claimableSpinReward.toLocaleString()}</span>
                      <span className="text-sm font-bold text-yellow-500">COINS</span>
                    </div>
                    
                    <div className="border-t border-dashed border-blue-500/20 pt-3.5 space-y-3.5">
                      <p className="text-[11px] opacity-75">
                        This reward is pending. You must watch advertisement to unlock the Claim Reward button.
                      </p>

                      <div className="grid grid-cols-1 gap-2.5">
                        {/* Step 1: Watch Ad Button */}
                        <button 
                          onClick={handleWatchSpinAd}
                          disabled={isSpinAdCompleted || isVerifying}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                            isSpinAdCompleted 
                              ? 'bg-green-600 text-white cursor-default'
                              : isVerifying
                                ? 'bg-blue-600/50 text-white/50 cursor-wait'
                                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                          }`}
                        >
                          {isSpinAdCompleted ? (
                            <>
                              <span>✅ AD COMPLETED</span>
                            </>
                          ) : isVerifying ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>WATCHING AD...</span>
                            </>
                          ) : (
                            <>
                              <span>📺 WATCH AD TO UNLOCK</span>
                            </>
                          )}
                        </button>

                        {/* Step 2: Claim Reward Button */}
                        <button 
                          onClick={handleClaimSpinReward}
                          disabled={!isSpinAdCompleted}
                          className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 ${
                            isSpinAdCompleted
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black shadow-md scale-[1.01] active:scale-[0.99]'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span>{isSpinAdCompleted ? '🎁 CLAIM MY COINS NOW!' : '🔒 CLAIM REWARD (LOCKED)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SPIN HISTORY SECTION */}
              <div className="w-full max-w-sm space-y-2.5 pt-4">
                <h4 className="font-extrabold text-xs text-left">Your Recent Spin History</h4>
                {spinHistory.length === 0 ? (
                  <p className="text-xs opacity-60 text-left py-2">No spins registered yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {spinHistory.slice(0, 10).map((hist) => (
                      <div 
                        key={hist.id}
                        className={`flex justify-between items-center p-2.5 rounded-lg text-xs ${theme === 'dark' ? 'bg-[#101726]/60 border border-gray-800' : 'bg-white border border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                          <span className="opacity-70">{new Date(hist.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-yellow-500">+{hist.reward.toLocaleString()} Coins</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REFERRAL TAB */}
          {activeTab === 'friends' && (
            <motion.div 
              key="friends-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* Daily countdown / reset details */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Refer & Earn Commission</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Earn 10% commission on referrals forever!</p>
                </div>
                <div className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold opacity-80">Reset in 24h</span>
                </div>
              </div>

              {/* Verified referral guide */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 to-yellow-500/5 border border-blue-500/15 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Verified Referral Reward</span>
                  <span className="bg-yellow-500 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full">
                    100,000 COINS
                  </span>
                </div>
                <p className="text-[11px] opacity-80">
                  Refer a friend. Once they complete and claim their first <b>30/30 daily tasks bonus</b>, they become a <b>Verified Referral</b>, unlocking your 100,000 Coin reward!
                </p>
              </div>

              {/* Daily Referral Challenge */}
              <section className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#10172e] to-[#0d1222] border-gray-800' : 'bg-white border-gray-150'} shadow-md`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight flex items-center space-x-1.5">
                      <span className="text-yellow-500">🔥</span>
                      <span>Daily Challenge: 10 Verified Refs</span>
                    </h3>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Get verified referrals in 24h to claim</p>
                  </div>
                  <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                    +200,000 COINS
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-blue-400">Progress</span>
                    <span className="opacity-80">{dailyReferralCount}/10 Verified Referrals</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyReferralCount / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] opacity-60">
                    <span>{Math.round((dailyReferralCount / 10) * 100)}% Completed</span>
                    <span>Resets every 24h</span>
                  </div>
                </div>
              </section>

              {/* Referral Link Box */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} space-y-2.5`}>
                <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Your Referral Link</span>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={simulatedRefLink}
                    className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${theme === 'dark' ? 'bg-gray-850 border-gray-750 text-blue-400' : 'bg-gray-50 border-gray-250 text-blue-600'} font-medium truncate`}
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3.5 rounded-xl border text-center ${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <p className="text-[10px] opacity-60 font-semibold uppercase">Total Referrals</p>
                  <p className="text-xl font-extrabold mt-1">{referralsList.length}</p>
                </div>
                <div className={`p-3.5 rounded-xl border text-center ${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <p className="text-[10px] opacity-60 font-semibold uppercase">Verified Referrals</p>
                  <p className="text-xl font-extrabold mt-1 text-green-500">
                    {referralsList.filter(r => r.status === 'verified').length}
                  </p>
                </div>
              </div>

              {/* Referrals list */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-xs">Referral History</h4>
                {referralsList.length === 0 ? (
                  <p className="text-xs opacity-60 py-2">No referred users yet. Share your referral link above to get started!</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {referralsList.map((ref) => (
                      <div 
                        key={ref.id}
                        className={`p-3 rounded-lg border flex justify-between items-center text-xs ${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="font-bold">@{ref.referredUsername}</span>
                            <p className="text-[9px] opacity-55">Joined {new Date(ref.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div>
                          {ref.status === 'verified' ? (
                            <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] px-2 py-0.5 rounded-full font-extrabold">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] px-2 py-0.5 rounded-full font-extrabold">
                              PENDING
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* WALLET & CONVERSION TAB */}
          {activeTab === 'wallet' && (
            <motion.div 
              key="wallet-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">Convert & Withdraw</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Convert Coins to withdrawable Gram and cashout to TON</p>
              </div>

              {/* COIN CONVERSION SECTION */}
              <section className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#10172e] border-gray-800' : 'bg-white border-gray-200'} shadow-sm space-y-4`}>
                <h4 className="font-extrabold text-xs flex items-center space-x-1.5 border-b pb-2 border-white/5">
                  <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                  <span>Coin Conversion Calculator</span>
                </h4>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between opacity-80">
                    <span>Exchange Rate:</span>
                    <span className="font-bold text-yellow-500">1,000,000 Coins = 1 Gram</span>
                  </div>
                  <div className="flex justify-between opacity-80">
                    <span>Limits:</span>
                    <span>Min: {settings.minConversion.toLocaleString()} Coins</span>
                  </div>
                </div>

                <form onSubmit={handleConvertCoins} className="space-y-3">
                  <div>
                    <label className="block text-[10px] opacity-60 font-semibold mb-1">Coins to Convert</label>
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        placeholder={`Min: ${settings.minConversion}`}
                        value={coinsToConvert}
                        onChange={e => setCoinsToConvert(e.target.value)}
                        className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${theme === 'dark' ? 'bg-gray-850 border-gray-750 text-white' : 'bg-gray-50 border-gray-250 text-black'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setCoinsToConvert(Math.min(currentUser.coinBalance, settings.maxConversion).toString())}
                        className={`text-xs px-3 rounded-lg font-bold border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-250 hover:bg-gray-200 text-black'}`}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {coinsToConvert && (
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-xs border border-blue-500/20 text-center">
                      <span className="font-bold text-blue-400">
                        {parseInt(coinsToConvert) ? (parseInt(coinsToConvert) / settings.conversionRate).toFixed(4) : 0} Grams
                      </span>
                      <span className="opacity-70"> you will receive</span>
                    </div>
                  )}

                  {conversionError && <p className="text-[10px] text-red-500 font-bold">{conversionError}</p>}
                  {conversionSuccess && <p className="text-[10px] text-green-500 font-bold">{conversionSuccess}</p>}

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Convert Coins to Gram Balance
                  </button>
                </form>
              </section>

              {/* WITHDRAW GRAM SECTION */}
              <section className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#10172e] border-gray-800' : 'bg-white border-gray-200'} shadow-sm space-y-4`}>
                <h4 className="font-extrabold text-xs flex items-center space-x-1.5 border-b pb-2 border-white/5">
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                  <span>Withdraw Gram to TON Address</span>
                </h4>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between opacity-80">
                    <span>Withdrawal Fee:</span>
                    <span className="font-bold text-purple-400">{settings.withdrawalFee}%</span>
                  </div>
                  <div className="flex justify-between opacity-80">
                    <span>Withdraw Limits:</span>
                    <span>Min: {settings.minWithdrawal} Gram • Max: {settings.maxWithdrawal} Gram</span>
                  </div>
                </div>

                <form onSubmit={handleRequestWithdrawal} className="space-y-3">
                  <div>
                    <label className="block text-[10px] opacity-60 font-semibold mb-1">TON Wallet Address</label>
                    <input 
                      type="text" 
                      placeholder="EQD... or UQD..."
                      value={tonAddress}
                      onChange={e => setTonAddress(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none ${theme === 'dark' ? 'bg-gray-850 border-gray-750 text-white' : 'bg-gray-50 border-gray-250 text-black'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] opacity-60 font-semibold mb-1">Amount in Grams</label>
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder={`Min: ${settings.minWithdrawal} Gram`}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${theme === 'dark' ? 'bg-gray-850 border-gray-750 text-white' : 'bg-gray-50 border-gray-250 text-black'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setWithdrawAmount(Math.min(currentUser.gramBalance, settings.maxWithdrawal).toString())}
                        className={`text-xs px-3 rounded-lg font-bold border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-250 hover:bg-gray-200 text-black'}`}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {withdrawAmount && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-xs border border-purple-500/20 space-y-1">
                      <div className="flex justify-between">
                        <span className="opacity-75">Requested:</span>
                        <span>{parseFloat(withdrawAmount)} Gram</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Fee ({settings.withdrawalFee}%):</span>
                        <span className="text-red-400">-{((parseFloat(withdrawAmount) || 0) * settings.withdrawalFee / 100).toFixed(4)} Gram</span>
                      </div>
                      <div className="flex justify-between font-extrabold border-t border-purple-500/10 pt-1 text-purple-400">
                        <span>You will receive:</span>
                        <span>{((parseFloat(withdrawAmount) || 0) * (100 - settings.withdrawalFee) / 100).toFixed(4)} Gram</span>
                      </div>
                    </div>
                  )}

                  {withdrawError && <p className="text-[10px] text-red-500 font-bold">{withdrawError}</p>}
                  {withdrawSuccess && <p className="text-[10px] text-green-500 font-bold">{withdrawSuccess}</p>}

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Submit Withdrawal Request
                  </button>
                </form>
              </section>

              {/* WITHDRAWAL HISTORY */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-xs">Withdrawal Cashout History</h4>
                {withdrawals.length === 0 ? (
                  <p className="text-xs opacity-60 py-2">No withdrawals requested yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {withdrawals.map((w) => (
                      <div 
                        key={w.id}
                        className={`p-3.5 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{w.amount} Gram</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                            w.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            w.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {w.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-[10px] opacity-75 space-y-1">
                          <div className="flex justify-between">
                            <span>TON Address:</span>
                            <span className="font-mono text-[9px]">{w.tonAddress.slice(0, 10)}...{w.tonAddress.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{new Date(w.createdAt).toLocaleString()}</span>
                          </div>
                          {w.status === 'rejected' && w.rejectionReason && (
                            <div className="p-2 mt-1 rounded bg-red-500/5 text-red-400 font-semibold border border-red-500/10">
                              Reason: {w.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'ranks' && (
            <motion.div 
              key="ranks-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* Leaderboard Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Referrals Leaderboard</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Top referrers share a 100 Gram prize pool!</p>
                </div>
              </div>

              {/* Real-time ticking 30-day Countdown Timer */}
              <div className="bg-gradient-to-r from-blue-900/30 via-black/40 to-blue-900/30 p-3.5 rounded-2xl border border-blue-500/20 text-center space-y-1.5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Tournament Countdown Clock</span>
                <div className="flex justify-center space-x-3 text-sm font-black text-white">
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
                    <span className="text-base text-yellow-500">{countdown.days}</span>
                    <p className="text-[9px] font-normal opacity-60">Days</p>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
                    <span className="text-base text-yellow-500">{countdown.hours.toString().padStart(2, '0')}</span>
                    <p className="text-[9px] font-normal opacity-60">Hours</p>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
                    <span className="text-base text-yellow-500">{countdown.minutes.toString().padStart(2, '0')}</span>
                    <p className="text-[9px] font-normal opacity-60">Mins</p>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
                    <span className="text-base text-yellow-500">{countdown.seconds.toString().padStart(2, '0')}</span>
                    <p className="text-[9px] font-normal opacity-60">Secs</p>
                  </div>
                </div>
              </div>

              {/* TOP 3 PODIUM */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center items-end">
                {/* 2nd Place */}
                {leaderboardUsers[1] && (
                  <div className={`p-3 rounded-2xl border flex flex-col items-center space-y-1 bg-gradient-to-t from-gray-800/10 to-transparent ${theme === 'dark' ? 'border-gray-850' : 'border-gray-200'}`}>
                    <span className="text-2xl">🥈</span>
                    <img 
                      src={leaderboardUsers[1].profilePhoto} 
                      alt="2nd" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-gray-400"
                    />
                    <p className="font-extrabold text-[10px] truncate w-full">@{leaderboardUsers[1].username}</p>
                    <span className="text-[10px] text-gray-400 font-bold">{leaderboardUsers[1].verifiedReferrals} Refs</span>
                    <span className="bg-gray-400/25 text-gray-300 font-black text-[9px] px-1.5 py-0.2 rounded mt-1">15 GRAM</span>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboardUsers[0] && (
                  <div className="p-3.5 rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-t from-yellow-500/5 to-transparent flex flex-col items-center space-y-1 relative -top-2">
                    <span className="absolute -top-3.5 text-2xl">👑</span>
                    <span className="text-2xl mt-1">🥇</span>
                    <img 
                      src={leaderboardUsers[0].profilePhoto} 
                      alt="1st" 
                      className="w-11 h-11 rounded-full object-cover border-2 border-yellow-500"
                    />
                    <p className="font-extrabold text-[11px] truncate w-full text-yellow-400">@{leaderboardUsers[0].username}</p>
                    <span className="text-[10px] text-yellow-400 font-bold">{leaderboardUsers[0].verifiedReferrals} Refs</span>
                    <span className="bg-yellow-500 text-black font-black text-[9px] px-1.5 py-0.2 rounded mt-1">25 GRAM</span>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboardUsers[2] && (
                  <div className={`p-3 rounded-2xl border flex flex-col items-center space-y-1 bg-gradient-to-t from-orange-800/10 to-transparent ${theme === 'dark' ? 'border-gray-850' : 'border-gray-200'}`}>
                    <span className="text-2xl">🥉</span>
                    <img 
                      src={leaderboardUsers[2].profilePhoto} 
                      alt="3rd" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-orange-500/50"
                    />
                    <p className="font-extrabold text-[10px] truncate w-full">@{leaderboardUsers[2].username}</p>
                    <span className="text-[10px] text-gray-400 font-bold">{leaderboardUsers[2].verifiedReferrals} Refs</span>
                    <span className="bg-orange-600/25 text-orange-400 font-black text-[9px] px-1.5 py-0.2 rounded mt-1">10 GRAM</span>
                  </div>
                )}
              </div>

              {/* LEADERBOARD LIST TABLE */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs">Top Verified Referrers List</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {leaderboardUsers.slice(0, 50).map((user, idx) => (
                    <div 
                      key={user.telegramId}
                      className={`p-2.5 rounded-lg border flex justify-between items-center text-xs ${
                        user.telegramId === currentUser.telegramId 
                          ? 'border-blue-500/40 bg-blue-500/5' 
                          : `${theme === 'dark' ? 'bg-[#101726]/60 border-gray-800' : 'bg-white border-gray-200'}`
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-black text-gray-400 text-[10px] w-5 text-center">#{idx + 1}</span>
                        <img 
                          src={user.profilePhoto} 
                          alt="" 
                          className="w-7.5 h-7.5 rounded-full object-cover"
                        />
                        <span className={`font-bold ${user.telegramId === currentUser.telegramId ? 'text-blue-400' : ''}`}>
                          @{user.username} {user.telegramId === currentUser.telegramId && '(You)'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-400 text-[11px]">{user.verifiedReferrals} Refs</span>
                        <span className="font-black text-blue-400 text-[10px]">
                          {idx === 0 ? '25' : idx === 1 ? '15' : idx === 2 ? '10' : idx < 10 ? '5' : idx < 30 ? '1.5' : '0.5'} Gram
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      
      {/* GIGAPUB SPONSOR OVERLAY */}
      <AnimatePresence>
        {showAdOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center space-y-4"
          >
            <div className="bg-yellow-500/10 p-4 rounded-full border border-yellow-500/20 text-yellow-500">
              <Coins className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Ad Verification Partner</h3>
              <p className="text-[11px] text-yellow-500 font-bold">Verifying spin results...</p>
            </div>
            <div className="w-32 h-1 rounded-full bg-gray-800 overflow-hidden">
              <div className="bg-yellow-500 h-full w-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sticky Native Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t ${theme === 'dark' ? 'bg-[#0b0f19]/90 border-gray-850 text-gray-400' : 'bg-white/90 border-gray-200 text-gray-500'} backdrop-blur-md flex justify-around items-center px-1 z-40`}>
        <button 
          onClick={() => { setActiveTab('home'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'home' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[9px]">Home</span>
        </button>

        <button 
          onClick={() => { setActiveTab('tasks'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'tasks' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[9px]">Tasks</span>
        </button>

        <button 
          onClick={() => { setActiveTab('spin'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'spin' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <RotateCw className="w-5 h-5" />
          <span className="text-[9px]">Spin</span>
        </button>

        <button 
          onClick={() => { setActiveTab('friends'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'friends' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px]">Friends</span>
        </button>

        <button 
          onClick={() => { setActiveTab('wallet'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'wallet' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[9px]">Wallet</span>
        </button>

        <button 
          onClick={() => { setActiveTab('ranks'); refreshData(); }}
          className={`flex flex-col items-center justify-center space-y-1 w-14 h-full transition-all ${activeTab === 'ranks' ? 'text-blue-500 font-bold' : 'hover:text-blue-400/80'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px]">Ranks</span>
        </button>
      </nav>

    </div>
  );
}
