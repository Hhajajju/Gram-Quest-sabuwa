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
  ArLEADERBOARD TAB */}

{activeTab === 'ranks' && (

<motion.div

key="ranks-tab"
rowRightLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Tv, 
  User as UserIcon,
  Sun,
  Moon,
  Clock,
  CheckSquare
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

import { BotNotification } from '../database';

import { User, Task, Referral, Withdrawal, SpinHistory, AppSettings } from '../types';


const API_URL = "https://gram-quest-api.raheeumar9.workers.dev";


interface UserPanelProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onSwitchToAdmin: () => void;
}


export default function UserPanel({ currentUser, onUpdateUser, onSwitchToAdmin }: UserPanelProps) {


  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'spin' | 'friends' | 'wallet' | 'ranks'>('home');

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<BotNotification[]>([]);


  // Settings now comes from Cloudflare Worker API
  const [settings, setSettings] = useState<AppSettings | null>(null);


  const [tasks, setTasks] = useState<Task[]>([]);

  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  const [copiedLink, setCopiedLink] = useState(false);

  const [copiedAddress, setCopiedAddress] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);



  // Spin Wheel States
  const [isSpinning, setIsSpinning] = useState(false);

  const [spinResult, setSpinResult] = useState<number | null>(null);

  const [spinAngle, setSpinAngle] = useState(0);

  const [claimableSpinReward, setClaimableSpinReward] = useState<number | null>(null);

  const [isSpinAdCompleted, setIsSpinAdCompleted] = useState(false);

  const [showAdOverlay, setShowAdOverlay] = useState(false);

  const [spinHistory, setSpinHistory] = useState<SpinHistory[]>();



  // Adsgram States
  const [watchingAd, setWatchingAd] = useState<{
    active: boolean;
    taskName: string;
    reward: number;
    isAdOnly: boolean
  } | null>(null);


  const [adSeconds, setAdSeconds] = useState(0);



  // Conversion States
  const [coinsToConvert, setCoinsToConvert] = useState('');

  const [conversionError, setConversionError] = useState('');

  const [conversionSuccess, setConversionSuccess] = useState('');



  // Withdrawal States
  const [tonAddress, setTonAddress] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [withdrawError, setWithdrawError] = useState('');

  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);



  // Referral States
  const [referralsList, setReferralsList] = useState<Referral[]>([]);

  const [dailyReferralCount, setDailyReferralCount] = useState(0);



  // Leaderboard States
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);

  const [countdown, setCountdown] = useState({
    days:29,
    hours:23,
    minutes:59,
    seconds:59
  });



  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

// Load initial data for user
useEffect(() => {

  refreshData();


  // Countdown timer for 30 days
  const timer = setInterval(() => {

    setCountdown(prev => {

      if (prev.seconds > 0) {

        return {
          ...prev,
          seconds: prev.seconds - 1
        };

      } else if (prev.minutes > 0) {

        return {
          ...prev,
          minutes: prev.minutes - 1,
          seconds: 59
        };

      } else if (prev.hours > 0) {

        return {
          ...prev,
          hours: prev.hours - 1,
          minutes: 59,
          seconds: 59
        };

      } else if (prev.days > 0) {

        return {
          ...prev,
          days: prev.days - 1,
          hours: 23,
          minutes: 59,
          seconds: 59
        };

      } else {

        return {
          days:30,
          hours:0,
          minutes:0,
          seconds:0
        };

      }

    });

  },1000);



  return () => clearInterval(timer);


}, [currentUser.telegramId, activeTab]);





const refreshData = async () => {

  try {


    // Get latest user balance from D1
    const userRes = await fetch(
      `${API_URL}/api/user/${currentUser.telegramId}`
    );


    const updatedUser = await userRes.json();


    if(updatedUser && !updatedUser.error){

      onUpdateUser(updatedUser);

    }





    // Get App Settings
    const settingsRes = await fetch(
      `${API_URL}/api/settings`
    );


    const appSettings = await settingsRes.json();


    if(!appSettings.error){

      setSettings(appSettings);

    }





    // Get Tasks
    const tasksRes = await fetch(
      `${API_URL}/api/tasks`
    );


    const taskData = await tasksRes.json();


    setTasks(
      Array.isArray(taskData)
      ? taskData
      : []
    );





    // Get Withdrawals
    const withdrawalsRes = await fetch(
      `${API_URL}/api/withdrawals/${currentUser.telegramId}`
    );


    const withdrawalData = await withdrawalsRes.json();


    setWithdrawals(
      Array.isArray(withdrawalData)
      ? withdrawalData
      : []
    );





    // Get Referrals
    const referralsRes = await fetch(
      `${API_URL}/api/referrals/${currentUser.telegramId}`
    );


    const referralData = await referralsRes.json();


    const userRefs = Array.isArray(referralData)
      ? referralData
      : [];


    setReferralsList(userRefs);





    // Count verified referrals in last 24 hours
    const last24h = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );


    const verifiedLast24h = userRefs.filter(
      (r:any)=>
        r.status === "verified" &&
        r.verifiedAt &&
        new Date(r.verifiedAt) > last24h
    ).length;


    setDailyReferralCount(
      verifiedLast24h
    );





    // Spin History
    const historyRes = await fetch(
      `${API_URL}/api/spin-history/${currentUser.telegramId}`
    );


    const historyData = await historyRes.json();


    setSpinHistory(
      Array.isArray(historyData)
      ? historyData
      : []
    );





    // Leaderboard
    // Waiting for Worker leaderboard endpoint
    setLeaderboardUsers([]);



  } catch(error:any){

    console.error(
      "Refresh data failed:",
      error
    );

  }

};


// 1. Copy referral link
const handleCopyLink = () => {

  const link = `https://t.me/${settings?.botUsername}?startapp=${currentUser.telegramId}`;

  navigator.clipboard.writeText(link);

  setCopiedLink(true);

  setTimeout(() => {
    setCopiedLink(false);
  }, 2000);

};




// 2. Watch Partner Task specifications
const handleStartTask = (task: Task) => {

  if (task.url && task.type === 'normal') {

    window.open(
      task.url,
      '_blank'
    );


    setWatchingAd({

      active:true,

      taskName:task.title,

      reward:task.reward,

      isAdOnly:false

    });


    setAdSeconds(5);

  }

};





// 3. Verify AdsGram reward through Cloudflare Worker
const handleReward = async (event:any) => {


  const blockId = event.detail || "task-38672";


  setIsVerifying(true);


  try {


    const response = await fetch(

      `${API_URL}/api/verify-adsgram-task`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          telegramId:currentUser.telegramId,

          blockId:blockId

        })

      }

    );



    const res = await response.json();



    if(res.success){


      await refreshData();


      alert(

        `🎉 Reward Confirmed! +${res.reward.toLocaleString()} Coins added to your balance.`

      );


    }else{


      alert(res.message);


    }



  }catch(err){


    alert(
      "Network error during backend verification."
    );


  }finally{


    setIsVerifying(false);


  }


};





const handleError = (event:any)=>{


  alert(

    `Adsgram Task Error: Error during loading or render for block ${event.detail}`

  );


};





const handleNotFound = ()=>{


  alert(
    "No task available"
  );


};





const handleTooLongSession = ()=>{


  alert(
    "The session is too long. Please restart the Telegram Mini App."
  );


};





const setAdsgramRef = (element:HTMLElement | null)=>{


  if(element){


    element.removeEventListener(
      'reward',
      handleReward
    );


    element.removeEventListener(
      'onError',
      handleError
    );


    element.removeEventListener(
      'onBannerNotFound',
      handleNotFound
    );


    element.removeEventListener(
      'onTooLongSession',
      handleTooLongSession
    );



    element.addEventListener(
      'reward',
      handleReward
    );


    element.addEventListener(
      'onError',
      handleError
    );


    element.addEventListener(
      'onBannerNotFound',
      handleNotFound
    );


    element.addEventListener(
      'onTooLongSession',
      handleTooLongSession
    );


  }


};


// Simulation timer for partner tasks
useEffect(() => {

  if (watchingAd && adSeconds > 0) {

    const adTimer = setTimeout(() => {

      setAdSeconds(prev => prev - 1);

    },1000);


    return () => clearTimeout(adTimer);

  } 


  else if (watchingAd && adSeconds === 0) {


    const completePartnerTask = async () => {


      try {


        const response = await fetch(

          `${API_URL}/api/complete-task`,

          {

            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },


            body:JSON.stringify({

              telegramId:currentUser.telegramId,

              taskId:watchingAd.taskName

            })

          }

        );



        const res = await response.json();



        if(res.success){


          onUpdateUser(res.user);


          await refreshData();


          alert(

            `🎉 Task completed! +${res.reward.toLocaleString()} Coins`

          );


        }else{


          alert(res.message);


        }



      }catch(error){


        alert(
          "Task completion failed"
        );


      }



    };


    completePartnerTask();


    setWatchingAd(null);


  }


}, [watchingAd, adSeconds]);








// 3. Claim 30 Task Daily Bonus
const handleClaimDailyBonus = async () => {


  try {


    const response = await fetch(

      `${API_URL}/api/daily-bonus`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          telegramId:currentUser.telegramId

        })

      }

    );



    const res = await response.json();



    if(res.success){


      onUpdateUser(res.user);


      await refreshData();


      alert(res.message);


    }else{


      alert(res.message);


    }



  }catch(error){


    alert(
      "Daily bonus failed"
    );


  }


};








// 4. Spin Wheel Animation
const handleSpinWheel = async () => {


  if(isSpinning) return;



  setIsSpinning(true);

  setClaimableSpinReward(null);

  setIsSpinAdCompleted(false);



  try {


    const response = await fetch(

      `${API_URL}/api/spin`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          telegramId:currentUser.telegramId

        })

      }

    );



    const res = await response.json();



    if(res.success){


      const rewardsMap = [
        100,
        500,
        1000,
        2000,
        3000
      ];



      const index = rewardsMap.indexOf(
        res.reward
      );



      const targetAngle =
        3600 + (360 - (index * 72 + 36));



      setSpinAngle(
        targetAngle
      );


      setSpinResult(
        res.reward
      );



      setTimeout(()=>{


        setIsSpinning(false);


        setClaimableSpinReward(
          res.reward
        );


        refreshData();



      },3000);



    }else{


      setIsSpinning(false);


      alert(res.message);


    }



  }catch(error){


    setIsSpinning(false);


    alert(
      "Spin failed"
    );


  }


};

// Watch Gigapubs Spin Ad
const handleWatchSpinAd = () => {

  if (claimableSpinReward === null) return;


  setIsVerifying(true);



  if (typeof (window as any).showGiga === 'function') {


    (window as any).showGiga()

      .then(() => {


        setIsVerifying(false);


        setIsSpinAdCompleted(true);



        alert(
          "🎉 Gigapubs ad completed successfully! Your claim button is now unlocked."
        );


      })


      .catch((err:any)=>{


        setIsVerifying(false);


        alert(
          "Advertisement was not fully completed. Please watch the ad entirely to unlock your reward."
        );


      });



  } else {


    setIsVerifying(false);


    alert(
      "⚠️ Gigapubs Ads SDK is currently loading or blocked by an adblocker. Please disable your adblocker to watch the ad and claim your coins."
    );


  }


};






// Claim Spin Reward
const handleClaimSpinReward = async () => {


  if(claimableSpinReward === null) return;



  if(!isSpinAdCompleted){


    alert(
      "Please watch the advertisement to unlock your winnings first."
    );


    return;

  }



  const wonReward = claimableSpinReward;



  setClaimableSpinReward(null);

  setSpinResult(null);

  setSpinAngle(0);

  setIsSpinAdCompleted(false);



  await refreshData();



  alert(
    `🎉 Successfully claimed ${wonReward.toLocaleString()} Coins! Your balance has been updated immediately.`
  );


};








// 5. Convert Coins
const handleConvertCoins = async (e: React.FormEvent) => {


  e.preventDefault();


  setConversionError('');

  setConversionSuccess('');



  const amount = parseInt(coinsToConvert);



  if(isNaN(amount) || amount <= 0){


    setConversionError(
      "Please enter a valid amount of Coins"
    );


    return;

  }




  try {


    const response = await fetch(

      `${API_URL}/api/convert`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          telegramId:currentUser.telegramId,

          amount:amount

        })

      }

    );



    const res = await response.json();



    if(res.success){


      onUpdateUser(res.user);


      setConversionSuccess(
        res.message
      );


      setCoinsToConvert('');



      await refreshData();



    }else{


      setConversionError(
        res.message
      );


    }



  }catch(error){


    setConversionError(
      "Conversion failed"
    );


  }


};


// 6. Request Withdrawal
const handleRequestWithdrawal = async (e: React.FormEvent) => {


  e.preventDefault();


  setWithdrawError('');

  setWithdrawSuccess('');



  const amount = parseFloat(withdrawAmount);



  if(isNaN(amount) || amount <= 0){


    setWithdrawError(
      "Please enter a valid amount of Gram"
    );


    return;

  }




  if(!tonAddress.trim() || tonAddress.length < 15){


    setWithdrawError(
      "Please enter a valid TON address"
    );


    return;

  }




  try {


    const response = await fetch(

      `${API_URL}/api/withdraw`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          telegramId:currentUser.telegramId,

          amount:amount,

          tonAddress:tonAddress

        })

      }

    );



    const res = await response.json();



    if(res.success){


      setWithdrawSuccess(
        res.message
      );


      setWithdrawAmount('');

      setTonAddress('');



      await refreshData();



    }else{


      setWithdrawError(
        res.message
      );


    }



  }catch(error){


    setWithdrawError(
      "Withdrawal request failed"
    );


  }


};





const simulatedRefLink =
  `https://t.me/${settings.botUsername}?startapp=${currentUser.telegramId}`;



return (

  <div 
    className={`min-h-screen ${
      theme === 'dark'
      ? 'bg-[#0b0f19] text-white'
      : 'bg-gray-50 text-gray-900'
    } pb-24 font-sans transition-colors duration-300`}
  >

      
      {/* Simulation Banner / Fast Tester Panel */}
      <div className="bg-gradient-to-r from-blue-700 to-[#1253a4] px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-xs text-white shadow-md space-y-2 sm:space-y-0">

        <div className="flex items-center space-x-2">

          <span className="bg-yellow-400 text-black px-2 py-0.5 rounded font-bold">
            LIVE TELEGRAM SDK MODE
          </span>

          <span className="opacity-90">
            Connected ID: <b>{currentUser.telegramId}</b>
          </span>

        </div>


        <div className="flex items-center space-x-3">

          <button 
            onClick={onSwitchToAdmin}
            className="bg-black/40 hover:bg-black/60 text-white px-3 py-1 rounded-full font-semibold flex items-center transition-all border border-white/20"
          >
            🛠️ Admin Panel Dashboard
          </button>

        </div>

      </div>
{/* Main Header */}
<header 
  className={`px-4 pt-5 pb-4 flex justify-between items-center ${
    theme === 'dark'
    ? 'bg-[#101726]/60 border-b border-gray-800'
    : 'bg-white border-b border-gray-200'
  } sticky top-0 z-40 backdrop-blur-md`}
>

  <div className="flex items-center space-x-3">

    <img 
      src={currentUser.profilePhoto}
      alt={currentUser.username}
      className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shadow-inner"
      referrerPolicy="no-referrer"
    />


    <div>

      <div className="flex items-center space-x-1">

        <span className="font-bold text-sm tracking-tight">
          @{currentUser.username}
        </span>


        {currentUser.verifiedReferrals >= 10 && (

          <span className="bg-blue-600 text-[10px] px-1.5 py-0.2 rounded text-white font-extrabold uppercase scale-90">
            PRO
          </span>

        )}

      </div>


      <span 
        className={`text-[10px] ${
          theme === 'dark'
          ? 'text-gray-400'
          : 'text-gray-500'
        }`}
      >
        ID: {currentUser.telegramId}
      </span>

    </div>

  </div>




  <div className="flex items-center space-x-2">


    {/* Theme Toggle */}
    <button

      onClick={() => 
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }

      className={`p-2 rounded-full ${
        theme === 'dark'
        ? 'bg-gray-800 text-yellow-400 hover:bg-gray-750'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-all`}

      title="Toggle theme"

    >

      {theme === 'dark'
      ? <Sun className="w-4 h-4" />
      : <Moon className="w-4 h-4" />
      }

    </button>




    {/* Support Link */}
    <a

      href={`https://t.me/${settings.supportUsername}`}

      target="_blank"

      rel="noopener noreferrer"

      className={`p-2 rounded-full ${
        theme === 'dark'
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-all`}

      title="Support"

    >

      <HelpCircle className="w-4 h-4"/>

    </a>





    {/* Notifications */}

    <button

      onClick={() => {

        setShowNotifications(!showNotifications);

        if(!showNotifications){

          refreshData();

        }

      }}

      className={`p-2 rounded-full relative ${
        theme === 'dark'
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-all`}

    >

      <Bell className="w-4 h-4"/>


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

<div 
className={`p-4 rounded-2xl relative overflow-hidden shadow-lg border ${
theme === 'dark'
? 'bg-[#10172a] border-gray-800'
: 'bg-white border-gray-100'
} transition-all hover:scale-[1.01]`}
>


<div className="absolute top-0 right-0 p-3 opacity-10">

<Coins className="w-20 h-20 text-yellow-500"/>

</div>



<p className={`text-[11px] font-medium tracking-wider uppercase ${
theme === 'dark'
? 'text-gray-400'
: 'text-gray-500'
}`}>

Coin Balance

</p>



<div className="flex items-baseline space-x-1.5 mt-2">

<span className="text-2xl font-black text-yellow-500 tracking-tight">

{currentUser.coinBalance.toLocaleString()}

</span>


<span className="text-xs font-bold text-yellow-500/80">

COINS

</span>


</div>



<p className="text-[10px] mt-1.5 text-blue-400/80 font-medium">

Earned from Ads, Wheel & Tasks

</p>


</div>

// Gram Balance Card

<div 
className={`p-4 rounded-2xl relative overflow-hidden shadow-lg border ${
theme === 'dark'
? 'bg-[#10172a] border-gray-800'
: 'bg-white border-gray-100'
} transition-all hover:scale-[1.01]`}
>


<div className="absolute top-0 right-0 p-3 opacity-10">

<Wallet className="w-20 h-20 text-blue-500" />

</div>



<p className={`text-[11px] font-medium tracking-wider uppercase ${
theme === 'dark'
? 'text-gray-400'
: 'text-gray-500'
}`}>

Gram Balance

</p>




<div className="flex items-baseline space-x-1.5 mt-2">

<span className="text-2xl font-black text-blue-500 tracking-tight">

{Number(currentUser.gramBalance || 0).toFixed(4)}

</span>


<span className="text-xs font-bold text-blue-500/80">

GRAM

</span>


</div>




<button

onClick={() => setActiveTab('wallet')}

className="text-[10px] mt-1.5 text-blue-400 hover:underline font-bold flex items-center space-x-0.5"

>

<span>
Withdraw & Swap
</span>

<ExternalLink className="w-2.5 h-2.5" />


</button>


</div>


</div>

</section>





{/* Outer Notifications Drawer Overlay */}

<AnimatePresence>

{showNotifications && (


<motion.div

initial={{opacity:0}}

animate={{opacity:1}}

exit={{opacity:0}}

className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"

onClick={() => setShowNotifications(false)}

>



<motion.div

initial={{x:'100%'}}

animate={{x:0}}

exit={{x:'100%'}}

transition={{
type:'spring',
damping:25,
stiffness:200
}}

className={`w-full max-w-md h-full ${
theme === 'dark'
? 'bg-[#0f1423]'
: 'bg-white'
} p-5 flex flex-col shadow-2xl overflow-y-auto`}


onClick={(e)=>e.stopPropagation()}

>



<div className="flex justify-between items-center mb-6">


<h3 className="font-extrabold text-lg flex items-center space-x-2">

<Bell className="w-5 h-5 text-blue-500"/>

<span>
Bot Notifications
</span>

</h3>




<button

onClick={()=>setShowNotifications(false)}

className={`px-3 py-1 rounded-full text-xs font-bold ${
theme === 'dark'
? 'bg-gray-800 text-white'
: 'bg-gray-200 text-black'
}`}

>

Close

</button>


</div>






{notifications.length === 0 ? (



<div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">


<Bell className="w-12 h-12 text-gray-400 mb-2"/>


<p className="text-sm">

No new bot messages received.

</p>


</div>




) : (



<div className="space-y-3 flex-1">


{notifications.map((notif)=>(


<div

key={notif.id}

className={`p-3.5 rounded-xl border ${
theme === 'dark'
? 'bg-gray-900 border-gray-800'
: 'bg-gray-50 border-gray-200'
} text-xs`}

>


<div className="flex justify-between items-center mb-1.5">


<span className="font-semibold text-blue-400 text-[10px]">

🤖 Telegram Notification

</span>



<span className="text-[10px] opacity-60">

{new Date(notif.timestamp).toLocaleTimeString()}

</span>


</div>




<p className={`font-medium ${
theme === 'dark'
? 'text-gray-200'
: 'text-gray-800'
}`}>

{notif.message}

</p>


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

initial={{opacity:0,y:10}}

animate={{opacity:1,y:0}}

exit={{opacity:0,y:-10}}

className="space-y-6"

>



{/* 30 ADSGRAM DAILY BONUS SECTION */}

<section 
className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-gradient-to-br from-[#10172e] to-[#0d1222] border-gray-800'
: 'bg-white border-gray-200'
} shadow-md`}
>



<div className="flex justify-between items-center mb-3">


<div>


<h3 className="font-extrabold text-sm tracking-tight flex items-center space-x-1.5">

<span className="text-yellow-500">
🏆
</span>


<span>
30 AdsGram Daily Bonus
</span>


</h3>



<p className={`text-[10px] ${
theme === 'dark'
? 'text-gray-400'
: 'text-gray-500'
}`}>

Complete AdsGram tasks to unlock daily reward

</p>


</div>



<span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2.5 py-0.5 rounded-full font-black">

+30,000 COINS

</span>



</div>





{/* Progress Bar */}

<div className="space-y-2 mt-4">


<div className="flex justify-between items-center text-xs font-bold">


<span className="text-blue-400">

Progress

</span>



<span className="opacity-80">

{completedTasksCount}/30 Ads

</span>


</div>





<div 
className={`w-full h-3 rounded-full overflow-hidden ${
theme === 'dark'
? 'bg-gray-800'
: 'bg-gray-200'
}`}
>


<div

className="bg-gradient-to-r from-blue-500 to-yellow-500 h-full rounded-full transition-all duration-500"


style={{
width:`${Math.min(
100,
(completedTasksCount / 30) * 100
)}%`
}}


/>


</div>





<div className="flex justify-between items-center text-[10px] opacity-60">


<span>

{Math.round(
(completedTasksCount / 30) * 100
)}% Completed

</span>



<span>

Daily Reset

</span>


</div>



</div>






<div className="mt-4 pt-1">


<button


disabled={completedTasksCount < 30}


onClick={handleClaimDailyBonus}



className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
completedTasksCount >= 30

?

'bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white shadow-lg scale-[1.01] active:scale-[0.99]'

:

`${theme === 'dark'
? 'bg-gray-800'
: 'bg-gray-200'
} text-gray-400 cursor-not-allowed`

}`}


>



{
completedTasksCount >= 30

?

'CLAIM 30,000 COINS BONUS 🎉'

:

'COMPLETE 30 ADSGRAM TASKS TO CLAIM'

}


</button>



</div>



</section>







{/* RULES SUMMARY BOX */}


<section

className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-gray-900/60 border-gray-800'
: 'bg-gray-100/60 border-gray-200'
}`}

>


<div className="flex items-center space-x-2 mb-3">


<ShieldAlert className="w-4 h-4 text-red-500"/>



<h4 className="font-extrabold text-xs text-red-500 uppercase tracking-wider">

Gram Quest Security Rules

</h4>


</div>




<ul className="space-y-2 text-[11px] opacity-80 text-left list-disc list-inside">


<li>
Fake task completion or auto-bots are strictly forbidden.
</li>


<li>
Fake referrals will result in account restrictions.
</li>


<li>
One user is allowed only one account.
</li>


<li>
AdsGram tasks must be completed manually.
</li>


<li>
Withdrawals may be reviewed before approval.
</li>



</ul>


</section>



</motion.div>


)}



</AnimatePresence>


</main>

{/* TASKS TAB */}

{activeTab === 'tasks' && (

<motion.div

key="tasks-tab"

initial={{opacity:0,y:10}}

animate={{opacity:1,y:0}}

exit={{opacity:0,y:-10}}

className="space-y-6 text-left"

>


{/* TITLE */}

<div className="text-left px-1">


<h2 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">

<span>
🎯
</span>

<span>
Gram Quest Ads Center
</span>

</h2>



<p className={`text-[11px] ${
theme === 'dark'
? 'text-gray-400'
: 'text-gray-500'
}`}>

Complete AdsGram verification tasks to earn Coins

</p>


</div>







{/* OFFICIAL ADSGRAM CARD */}

<div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-br from-[#10172e] to-[#0d1222] rounded-2xl border border-blue-500/10 space-y-4 text-center">



<div>

<h4 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider mb-1">

Official AdsGram Reward Center

</h4>



<p className="text-[10px] text-gray-400 max-w-xs mx-auto">

Complete AdsGram tasks. Rewards are securely verified by Cloudflare Worker backend.

</p>


</div>






{isVerifying ? (



<div className="flex flex-col items-center justify-center p-6 space-y-3">


<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>



<p className="text-xs text-blue-400 font-bold animate-pulse">

Verifying reward...

</p>



</div>




) : (



<div className="w-full flex justify-center py-2">


{React.createElement('adsgram-task',{

ref:setAdsgramRef,

'data-block-id':"task-38672",

'data-debug':"false",

'data-debug-console':"false",

className:"task"

})}



</div>



)}







<div className="text-[10px] text-gray-400 flex flex-wrap gap-2 items-center justify-center bg-black/20 px-3 py-1.5 rounded-lg border border-gray-800/40">


<span>

<span className="font-semibold text-gray-500">
Block ID:
</span>


<code className="text-blue-400 font-mono">

task-38672

</code>

</span>




<span>
•
</span>




<span>

<span className="font-semibold text-gray-500">

Daily limit:

</span>


<span className="text-yellow-500 font-bold">

30

</span>


</span>




<span>
•
</span>




<span>

<span className="font-semibold text-gray-500">

Yield:

</span>


<span className="text-yellow-400 font-bold">

+3,000 Coins

</span>


</span>


</div>



</div>





{/* Partner Tasks Removed */}

<section className="space-y-3">


<div className="flex justify-between items-center px-1">


<h3 className="font-black text-xs tracking-tight uppercase text-blue-400 flex items-center space-x-1.5">

<span>
🛡️
</span>

<span>
AdsGram Tasks Only
</span>


</h3>


</div>




<div className="text-center py-6 text-xs text-gray-500 bg-[#101726]/40 rounded-xl border border-gray-800">

AdsGram is currently the only available earning task.

</div>


</section>



</motion.div>

)}

{/* SPIN WHEEL TAB */}

{activeTab === 'spin' && (

<motion.div

key="spin-tab"

initial={{opacity:0,y:10}}

animate={{opacity:1,y:0}}

exit={{opacity:0,y:-10}}

className="space-y-6 flex flex-col items-center"

>



<div className="text-center space-y-1">


<h3 className="font-extrabold text-lg tracking-tight">

Lucky Spin Wheel

</h3>



<p className={`text-xs ${
theme === 'dark'
? 'text-gray-400'
: 'text-gray-500'
}`}>

Spin the wheel to win dynamic coin rewards!

</p>


</div>





{/* Spin Wheel Visual */}

<div className="relative w-72 h-72 my-4">


{/* Pointer */}

<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-40">


<div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-lg"/>


<div className="w-3 h-3 rounded-full bg-white absolute top-[-26px] left-[-6px] shadow-sm animate-ping"/>


</div>





<div className="w-full h-full rounded-full p-2 bg-[#121824] shadow-2xl relative flex items-center justify-center">


{/* Outer lights */}


{[...Array(12)].map((_,idx)=>(


<div

key={idx}

className="absolute w-2 h-2 rounded-full bg-yellow-300 z-30"

style={{

top:'50%',

left:'50%',

transform:
`translate(-50%,-50%) rotate(${idx*30}deg) translateY(-134px)`

}}


/>


))}







<motion.div


className="w-full h-full rounded-full border-4 border-[#1c2438] overflow-hidden relative"


style={{

background:
'conic-gradient(#3b82f6 0deg 72deg,#10b981 72deg 144deg,#8b5cf6 144deg 216deg,#ec4899 216deg 288deg,#fbbf24 288deg 360deg)',


transform:`rotate(${spinAngle}deg)`

}}


animate={{

rotate:spinAngle

}}


transition={{

duration:isSpinning ? 0 : 1.5,

ease:"easeOut"

}}



>






{/* Divider Lines */}


{[0,1,2,3,4].map(i=>(


<div

key={i}

className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-white/20 origin-bottom"

style={{

transform:
`translateX(-50%) rotate(${i*72}deg)`

}}


/>


))}







{/* Rewards */}


{[100,500,1000,2000,3000].map((reward,i)=>{


const angle=i*72+36;


return (


<div

key={reward}

className="absolute top-0 left-0 w-full h-full flex flex-col items-center pt-6 text-white font-black"

style={{

transform:`rotate(${angle}deg)`

}}

>


<Coins className="w-5 h-5 text-white"/>


<span className="text-[13px] font-black">

{reward}

</span>



</div>


)


})}







{/* Center Button */}


<div className="absolute inset-0 m-auto w-16 h-16 bg-[#111726] rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-lg">


<span className="text-[10px] font-black text-yellow-400">

QUEST

</span>


</div>





</motion.div>



</div>


</div>

const handleSpinWheel = async () => {

  if (isSpinning) return;

  setIsSpinning(true);
  setClaimableSpinReward(null);
  setIsSpinAdCompleted(false);


  try {

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


    const data = await response.json();



    if(data.success){


      const rewards = [
        100,
        500,
        1000,
        2000,
        3000
      ];


      const index = rewards.indexOf(data.reward);


      const targetAngle =
        3600 + (360 - (index * 72 + 36));



      setSpinAngle(targetAngle);

      setSpinResult(data.reward);



      setTimeout(()=>{

        setIsSpinning(false);

        setClaimableSpinReward(data.reward);


      },3000);



    }else{


      alert(data.message);

      setIsSpinning(false);

    }



  }catch(error){


    alert("Spin failed");

    setIsSpinning(false);


  }

};

{/* SPIN HISTORY SECTION */}
<div className="w-full max-w-sm space-y-2.5 pt-4">
  <h4 className="font-extrabold text-xs text-left">
    Your Recent Spin History
  </h4>

  {spinHistory.length === 0 ? (
    <p className="text-xs opacity-60 text-left py-2">
      No spins registered yet.
    </p>
  ) : (
    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
      {spinHistory.slice(0, 10).map((hist) => (
        <div
          key={hist.id}
          className={`flex justify-between items-center p-2.5 rounded-lg text-xs ${
            theme === 'dark'
              ? 'bg-[#101726]/60 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />

            <span className="opacity-70">
              {new Date(hist.createdAt).toLocaleDateString()}
            </span>
          </div>

          <span className="font-bold text-yellow-500">
            +{hist.reward.toLocaleString()} Coins
          </span>
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
  initial={{ opacity:0, y:10 }}
  animate={{ opacity:1, y:0 }}
  exit={{ opacity:0, y:-10 }}
  className="space-y-6 text-left"
>

{/* Header */}
<div className="flex justify-between items-center">

  <div>
    <h3 className="font-extrabold text-lg tracking-tight">
      Refer & Earn
    </h3>

    <p className={`text-xs ${
      theme === 'dark'
      ? 'text-gray-400'
      : 'text-gray-500'
    }`}>
      Invite users and earn referral rewards
    </p>
  </div>


  <div className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full ${
    theme === 'dark'
    ? 'bg-gray-800'
    : 'bg-gray-200'
  }`}>

    <Users className="w-3.5 h-3.5 text-blue-400"/>

    <span className="font-semibold">
      {referralsList.length} Referrals
    </span>

  </div>

</div>



{/* Referral Link Card */}
<section className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-[#10172e] border-gray-800'
: 'bg-white border-gray-200'
}`}>

<h4 className="font-black text-sm mb-2">
🔗 Your Referral Link
</h4>


<div className="flex items-center space-x-2">

<input
readOnly
value={simulatedRefLink}
className={`flex-1 text-[11px] px-3 py-2 rounded-lg outline-none ${
theme === 'dark'
? 'bg-black/30 text-gray-300'
: 'bg-gray-100 text-gray-700'
}`}
/>


<button
onClick={handleCopyLink}
className="bg-blue-600 text-white p-2 rounded-lg"
>

{copiedLink 
? <Check className="w-4 h-4"/>
: <Copy className="w-4 h-4"/>
}

</button>

</div>

</section>



{/* Referral Stats */}

<section className={`grid grid-cols-2 gap-3`}>

<div className={`p-3 rounded-xl border ${
theme === 'dark'
?'bg-[#101726] border-gray-800'
:'bg-white border-gray-200'
}`}>

<p className="text-[10px] opacity-60">
Verified Referrals
</p>

<p className="text-xl font-black text-blue-400">
{currentUser.verifiedReferrals}
</p>

</div>



<div className={`p-3 rounded-xl border ${
theme === 'dark'
?'bg-[#101726] border-gray-800'
:'bg-white border-gray-200'
}`}>

<p className="text-[10px] opacity-60">
Today's Verified
</p>

<p className="text-xl font-black text-yellow-500">
{dailyReferralCount}
</p>

</div>


</section>


{/* Progress bar */}
<div className="space-y-2 mt-4">
  <div className="flex justify-between items-center text-xs font-bold">
    <span className="text-blue-400">Progress</span>
    <span className="opacity-80">
      {dailyReferralCount}/10 Verified Referrals
    </span>
  </div>

  <div className={`w-full h-3 rounded-full overflow-hidden ${
    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
  }`}>
    <div
      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-500"
      style={{
        width: `${Math.min(100, (dailyReferralCount / 10) * 100)}%`
      }}
    />
  </div>

  <div className="flex justify-between items-center text-[10px] opacity-60">
    <span>
      {Math.round((dailyReferralCount / 10) * 100)}% Completed
    </span>
    <span>Resets every 24h</span>
  </div>
</div>


{/* Referral Link Box */}
<div className={`p-4 rounded-xl border ${
  theme === 'dark'
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200'
} space-y-2.5`}>

  <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">
    Your Referral Link
  </span>

  <div className="flex space-x-2">

    <input
      type="text"
      readOnly
      value={`https://t.me/${settings.botUsername}?start=${currentUser.telegramId}`}
      className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
        theme === 'dark'
          ? 'bg-gray-850 border-gray-750 text-blue-400'
          : 'bg-gray-50 border-gray-250 text-blue-600'
      } font-medium truncate`}
    />

    <button
      onClick={handleCopyLink}
      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0"
    >
      {
        copiedLink
          ? <Check className="w-4 h-4 text-green-300" />
          : <Copy className="w-4 h-4" />
      }
    </button>

  </div>

</div>


{/* Referral Stats */}
<div className="grid grid-cols-2 gap-4">

  <div className={`p-3.5 rounded-xl border text-center ${
    theme === 'dark'
      ? 'bg-[#101726]/60 border-gray-800'
      : 'bg-white border-gray-200'
  }`}>
    <p className="text-[10px] opacity-60 font-semibold uppercase">
      Total Referrals
    </p>

    <p className="text-xl font-extrabold mt-1">
      {referralsList.length}
    </p>
  </div>


  <div className={`p-3.5 rounded-xl border text-center ${
    theme === 'dark'
      ? 'bg-[#101726]/60 border-gray-800'
      : 'bg-white border-gray-200'
  }`}>

    <p className="text-[10px] opacity-60 font-semibold uppercase">
      Verified Referrals
    </p>

    <p className="text-xl font-extrabold mt-1 text-green-500">
      {
        referralsList.filter(
          r => r.status === 'verified'
        ).length
      }
    </p>

  </div>

</div>


{/* Referral History */}
<div className="space-y-2.5">

<h4 className="font-extrabold text-xs">
  Referral History
</h4>


{
referralsList.length === 0 ? (

<p className="text-xs opacity-60 py-2">
 No referred users yet. Share your referral link to start earning.
</p>

) : (

<div className="space-y-2 max-h-64 overflow-y-auto pr-1">

{
referralsList.map((ref)=> (

<div
key={ref.id}
className={`p-3 rounded-lg border ${
 theme === 'dark'
 ? 'bg-[#101726]/60 border-gray-800'
 : 'bg-white border-gray-200'
}`}
>


<div className="flex justify-between items-center">


<div className="flex items-center space-x-2">

<Users className="w-4 h-4 text-blue-400"/>


<div>

<span className="font-bold text-xs">
@{ref.referredUsername}
</span>


<p className="text-[9px] opacity-60">
ID: {ref.referredId || 'Pending'}
</p>


<p className="text-[9px] opacity-50">
Joined {new Date(ref.createdAt).toLocaleDateString()}
</p>


</div>

</div>



<div>

{
ref.status === 'verified'
?

<span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] px-2 py-0.5 rounded-full font-extrabold">
VERIFIED
</span>

:

<span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] px-2 py-0.5 rounded-full font-extrabold">
PENDING
</span>

}

</div>


</div>


</div>

))

}

</div>

)

}


</div>

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
  <h3 className="font-extrabold text-lg tracking-tight">
    Convert & Withdraw
  </h3>

  <p className={`text-xs ${
    theme === 'dark'
    ? 'text-gray-400'
    : 'text-gray-500'
  }`}>
    Convert your Coins into Gram balance and withdraw through TON wallet.
  </p>
</div>



{/* WALLET BALANCE CARD */}
<section
className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-gradient-to-br from-[#10172e] to-[#0d1222] border-gray-800'
: 'bg-white border-gray-200'
}`}
>

<div className="flex justify-between items-center">

<div>
<p className="text-[10px] uppercase opacity-60 font-bold">
Current Gram Balance
</p>

<h2 className="text-2xl font-black text-blue-500 mt-1">
{currentUser.gramBalance.toFixed(4)} GRAM
</h2>

</div>


<Wallet className="w-10 h-10 text-blue-500 opacity-70"/>

</div>

</section>




{/* COIN CONVERSION SECTION */}
<section
className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-[#10172e] border-gray-800'
: 'bg-white border-gray-200'
} shadow-sm space-y-4`}
>


<h4 className="font-extrabold text-xs flex items-center space-x-1.5 border-b pb-2 border-white/5">

<ArrowRightLeft className="w-4 h-4 text-blue-400"/>

<span>
Coin Conversion Calculator
</span>

</h4>



<div className="text-xs space-y-2">


<div className="flex justify-between opacity-80">

<span>
Exchange Rate
</span>

<span className="font-bold text-yellow-500">
1,000,000 Coins = 1 Gram
</span>

</div>



<div className="flex justify-between opacity-80">

<span>
Minimum Conversion
</span>

<span className="font-bold">
{settings.minConversion.toLocaleString()} Coins
</span>

</div>



<div className="flex justify-between opacity-80">

<span>
Maximum Conversion
</span>

<span className="font-bold">
{settings.maxConversion.toLocaleString()} Coins
</span>

</div>


</div>




<form
onSubmit={handleConvertCoins}
className="space-y-3"
>


<div>

<label className="block text-[10px] opacity-60 font-semibold mb-1">
Coins To Convert
</label>


<div className="flex space-x-2">


<input
type="number"
placeholder={`Min ${settings.minConversion}`}
value={coinsToConvert}
onChange={(e)=>setCoinsToConvert(e.target.value)}

className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
theme === 'dark'
? 'bg-gray-850 border-gray-750 text-white'
: 'bg-gray-50 border-gray-250 text-black'
}`}

/>



<button
type="button"
onClick={() =>
setCoinsToConvert(
Math.min(
currentUser.coinBalance,
settings.maxConversion
).toString()
)
}

className={`px-3 rounded-lg text-xs font-bold border ${
theme === 'dark'
? 'border-gray-700 hover:bg-gray-800 text-gray-300'
: 'border-gray-300 hover:bg-gray-200 text-black'
}`}
>

MAX

</button>


</div>

</div>




{/* Conversion Preview */}

{coinsToConvert && (

<div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">

<span className="text-blue-400 font-black">

{
Number(coinsToConvert)
?
(
Number(coinsToConvert) /
settings.conversionRate
).toFixed(4)

:
"0.0000"
}

GRAM

</span>


<p className="text-[10px] opacity-70 mt-1">
Estimated Gram received
</p>


</div>

)}




{
conversionError &&
<p className="text-[10px] text-red-500 font-bold">
{conversionError}
</p>
}



{
conversionSuccess &&
<p className="text-[10px] text-green-500 font-bold">
{conversionSuccess}
</p>
}




<button
type="submit"

className="
w-full
bg-blue-600
hover:bg-blue-700
text-white
font-extrabold
text-xs
py-2.5
rounded-xl
transition-all
active:scale-95
"
>

Convert Coins To Gram Balance

</button>


</form>


</section>

{/* WITHDRAW GRAM SECTION */}

<section
className={`p-4 rounded-2xl border ${
theme === 'dark'
? 'bg-[#10172e] border-gray-800'
: 'bg-white border-gray-200'
} shadow-sm space-y-4`}
>


<h4 className="font-extrabold text-xs flex items-center space-x-1.5 border-b pb-2 border-white/5">

<ArrowUpRight className="w-4 h-4 text-purple-400"/>

<span>
Withdraw Gram To TON Wallet
</span>

</h4>



{/* Withdrawal Rules */}

<div className="text-xs space-y-2">


<div className="flex justify-between opacity-80">

<span>
Withdrawal Fee
</span>

<span className="font-bold text-purple-400">
{settings.withdrawalFee}%
</span>

</div>



<div className="flex justify-between opacity-80">

<span>
Minimum Withdrawal
</span>

<span className="font-bold">
{settings.minWithdrawal} GRAM
</span>

</div>



<div className="flex justify-between opacity-80">

<span>
Maximum Withdrawal
</span>

<span className="font-bold">
{settings.maxWithdrawal} GRAM
</span>

</div>



<div className="flex justify-between opacity-80">

<span>
Available Balance
</span>

<span className="font-bold text-blue-400">
{currentUser.gramBalance.toFixed(4)} GRAM
</span>

</div>


</div>





<form
onSubmit={handleRequestWithdrawal}
className="space-y-3"
>


{/* TON Address */}

<div>

<label className="block text-[10px] opacity-60 font-semibold mb-1">
TON Wallet Address
</label>


<input

type="text"

placeholder="EQxxxxxx or UQxxxxxx"

value={tonAddress}

onChange={(e)=>setTonAddress(e.target.value)}

className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none ${
theme === 'dark'
? 'bg-gray-850 border-gray-750 text-white'
: 'bg-gray-50 border-gray-250 text-black'
}`}

/>

</div>





{/* Amount */}

<div>

<label className="block text-[10px] opacity-60 font-semibold mb-1">
Withdrawal Amount (GRAM)
</label>



<div className="flex space-x-2">


<input

type="number"

step="0.0001"

placeholder={`Minimum ${settings.minWithdrawal} Gram`}

value={withdrawAmount}

onChange={(e)=>setWithdrawAmount(e.target.value)}

className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
theme === 'dark'
? 'bg-gray-850 border-gray-750 text-white'
: 'bg-gray-50 border-gray-250 text-black'
}`}

/>




<button

type="button"

onClick={()=>{

setWithdrawAmount(
Math.min(
currentUser.gramBalance,
settings.maxWithdrawal
).toString()
)

}}

className={`px-3 rounded-lg text-xs font-bold border ${
theme === 'dark'
? 'border-gray-700 hover:bg-gray-800 text-gray-300'
: 'border-gray-300 hover:bg-gray-200 text-black'
}`}

>

MAX

</button>


</div>

</div>






{/* Withdrawal Preview */}

{
withdrawAmount && Number(withdrawAmount) > 0 && (

<div
className="
p-3
rounded-lg
bg-purple-500/10
border
border-purple-500/20
text-xs
space-y-2
"
>


<div className="flex justify-between">

<span className="opacity-70">
Requested
</span>

<span>
{Number(withdrawAmount).toFixed(4)} GRAM
</span>

</div>




<div className="flex justify-between">

<span className="opacity-70">
Fee ({settings.withdrawalFee}%)
</span>


<span className="text-red-400">

-
{(
Number(withdrawAmount)
*
settings.withdrawalFee
/
100
).toFixed(4)}

GRAM

</span>


</div>





<div
className="
flex
justify-between
font-extrabold
border-t
border-purple-500/20
pt-2
text-purple-400
"
>

<span>
You Receive
</span>


<span>

{(
Number(withdrawAmount)
*
(100-settings.withdrawalFee)
/
100
).toFixed(4)}

GRAM

</span>


</div>


</div>

)

}




{
withdrawError &&
<p className="text-[10px] text-red-500 font-bold">
{withdrawError}
</p>
}




{
withdrawSuccess &&
<p className="text-[10px] text-green-500 font-bold">
{withdrawSuccess}
</p>
}






<button

type="submit"

className="
w-full
bg-gradient-to-r
from-purple-600
to-blue-600
hover:from-purple-700
hover:to-blue-700
text-white
font-extrabold
text-xs
py-2.5
rounded-xl
transition-all
shadow-md
active:scale-95
"

>

Submit Withdrawal Request

</button>



</form>


</section>

{/* WITHDRAWAL HISTORY */}

<div className="space-y-2.5">

<h4 className="font-extrabold text-xs">
Withdrawal History
</h4>


{
withdrawals.length === 0 ? (

<p className="text-xs opacity-60 py-2">
No withdrawal requests yet.
</p>

) : (

<div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">


{
withdrawals.map((w)=>(

<div

key={w.id}

className={`p-3.5 rounded-xl border space-y-2 ${
theme === 'dark'
? 'bg-[#101726]/60 border-gray-800'
: 'bg-white border-gray-200'
}`}

>


<div className="flex justify-between items-center">


<span className="font-bold text-xs">
{w.amount} GRAM
</span>



<span
className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
w.status === 'approved'
?
'bg-green-500/10 text-green-500 border border-green-500/20'
:
w.status === 'rejected'
?
'bg-red-500/10 text-red-500 border border-red-500/20'
:
'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
}`}
>

{w.status.toUpperCase()}

</span>


</div>





<div className="text-[10px] opacity-75 space-y-1">


<div className="flex justify-between">

<span>
TON Wallet
</span>

<span className="font-mono text-[9px]">

{w.tonAddress
? `${w.tonAddress.slice(0,8)}...${w.tonAddress.slice(-6)}`
: 'N/A'}

</span>

</div>




<div className="flex justify-between">

<span>
Requested
</span>

<span>
{new Date(w.createdAt).toLocaleString()}
</span>

</div>




{
w.status === 'rejected' &&
w.rejectionReason && (

<div className="
p-2
rounded
bg-red-500/5
text-red-400
font-semibold
border
border-red-500/10
">

Reason: {w.rejectionReason}

</div>

)

}


</div>


</div>


))

}


</div>

)

}

</div>

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
        <h3 className="font-extrabold text-lg tracking-tight">
          🏆 Verified Referral Leaderboard
        </h3>

        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Top verified referrers will receive Gram rewards
        </p>
      </div>
    </div>


    {/* 30 Day Tournament Countdown */}
    <div className="bg-gradient-to-r from-blue-900/30 via-black/40 to-blue-900/30 p-3.5 rounded-2xl border border-blue-500/20 text-center space-y-1.5">

      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
        Referral Season Countdown
      </span>


      <div className="flex justify-center space-x-3 text-sm font-black text-white">

        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
          <span className="text-base text-yellow-500">
            {countdown?.days || 0}
          </span>
          <p className="text-[9px] opacity-60">
            Days
          </p>
        </div>


        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
          <span className="text-base text-yellow-500">
            {(countdown?.hours || 0).toString().padStart(2,'0')}
          </span>
          <p className="text-[9px] opacity-60">
            Hours
          </p>
        </div>


        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
          <span className="text-base text-yellow-500">
            {(countdown?.minutes || 0).toString().padStart(2,'0')}
          </span>
          <p className="text-[9px] opacity-60">
            Minutes
          </p>
        </div>


        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 min-w-[50px]">
          <span className="text-base text-yellow-500">
            {(countdown?.seconds || 0).toString().padStart(2,'0')}
          </span>
          <p className="text-[9px] opacity-60">
            Seconds
          </p>
        </div>

      </div>
    </div>



    {/* TOP 3 PODIUM */}
    {leaderboardUsers?.length > 0 && (

    <div className="grid grid-cols-3 gap-3 pt-3 text-center items-end">


      {/* SECOND PLACE */}
      {leaderboardUsers[1] && (
        <div className={`p-3 rounded-2xl border flex flex-col items-center space-y-1 
        ${theme === 'dark'
          ? 'bg-[#101726]/60 border-gray-800'
          : 'bg-white border-gray-200'
        }`}>

          <span className="text-2xl">
            🥈
          </span>


          <img
            src={
              leaderboardUsers[1].profilePhoto ||
              "https://telegram.org/img/t_logo.png"
            }
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-400"
          />


          <p className="font-bold text-[10px] truncate w-full">
            @{leaderboardUsers[1].username || "User"}
          </p>


          <span className="text-[10px] text-gray-400 font-bold">
            {leaderboardUsers[1].verifiedReferrals || 0} Verified
          </span>


          <span className="bg-gray-400/20 text-gray-300 font-black text-[9px] px-2 py-1 rounded">
            15 GRAM
          </span>

        </div>
      )}




      {/* FIRST PLACE */}
      {leaderboardUsers[0] && (
        <div className="p-3.5 rounded-2xl border-2 border-yellow-500/40 
        bg-yellow-500/5 flex flex-col items-center space-y-1 relative -top-2">


          <span className="absolute -top-4 text-3xl">
            👑
          </span>


          <span className="text-2xl mt-2">
            🥇
          </span>


          <img
            src={
              leaderboardUsers[0].profilePhoto ||
              "https://telegram.org/img/t_logo.png"
            }
            className="w-11 h-11 rounded-full object-cover border-2 border-yellow-500"
          />


          <p className="font-black text-[11px] text-yellow-400 truncate w-full">
            @{leaderboardUsers[0].username || "User"}
          </p>


          <span className="text-[10px] text-yellow-400 font-bold">
            {leaderboardUsers[0].verifiedReferrals || 0} Verified
          </span>


          <span className="bg-yellow-500 text-black font-black text-[9px] px-2 py-1 rounded">
            25 GRAM
          </span>


        </div>
      )}




      {/* THIRD PLACE */}
      {leaderboardUsers[2] && (
        <div className={`p-3 rounded-2xl border flex flex-col items-center space-y-1 
        ${theme === 'dark'
          ? 'bg-[#101726]/60 border-gray-800'
          : 'bg-white border-gray-200'
        }`}>

          <span className="text-2xl">
            🥉
          </span>


          <img
            src={
              leaderboardUsers[2].profilePhoto ||
              "https://telegram.org/img/t_logo.png"
            }
            className="w-9 h-9 rounded-full object-cover border-2 border-orange-500"
          />


          <p className="font-bold text-[10px] truncate w-full">
            @{leaderboardUsers[2].username || "User"}
          </p>


          <span className="text-[10px] text-gray-400 font-bold">
            {leaderboardUsers[2].verifiedReferrals || 0} Verified
          </span>


          <span className="bg-orange-500/20 text-orange-400 font-black text-[9px] px-2 py-1 rounded">
            10 GRAM
          </span>


        </div>
      )}


    </div>

    )}


{/* LEADERBOARD LIST TABLE */}
<div className="space-y-2">

  <h4 className="font-extrabold text-xs">
    Top Verified Referrers Ranking
  </h4>


  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">

    {!leaderboardUsers || leaderboardUsers.length === 0 ? (

      <div className="text-center py-6 text-xs text-gray-500 bg-[#101726]/40 rounded-xl border border-gray-800">
        No verified referrals leaderboard data yet.
      </div>

    ) : (

      leaderboardUsers
        .slice(0, 50)
        .map((user, idx) => (

        <div
          key={user.telegramId || idx}
          className={`
            p-2.5 rounded-lg border flex justify-between items-center text-xs

            ${
              user.telegramId === currentUser?.telegramId

              ? 'border-blue-500/40 bg-blue-500/5'

              : theme === 'dark'

                ? 'bg-[#101726]/60 border-gray-800'

                : 'bg-white border-gray-200'
            }
          `}
        >


          {/* USER INFO */}
          <div className="flex items-center space-x-2.5">


            {/* Rank */}
            <span className="font-black text-gray-400 text-[10px] w-5 text-center">
              #{idx + 1}
            </span>



            {/* Avatar */}
            <img
              src={
                user.profilePhoto ||
                "https://telegram.org/img/t_logo.png"
              }
              alt="profile"
              className="w-7 h-7 rounded-full object-cover border border-white/10"
            />



            {/* Username */}
            <div>

              <span
                className={`font-bold ${
                  user.telegramId === currentUser?.telegramId
                    ? 'text-blue-400'
                    : ''
                }`}
              >

                @{user.username || "Unknown"}

                {
                  user.telegramId === currentUser?.telegramId &&
                  " (You)"
                }

              </span>


              <p className="text-[9px] text-gray-500">
                ID: {user.telegramId}
              </p>


            </div>


          </div>




          {/* REFERRAL STATS */}
          <div className="flex items-center space-x-3">


            <span className="font-semibold text-gray-400 text-[11px]">
              {user.verifiedReferrals || 0} Verified
            </span>



            <span className="font-black text-blue-400 text-[10px]">

              {
                idx === 0 
                ? '25'

                : idx === 1
                ? '15'

                : idx === 2
                ? '10'

                : idx < 10
                ? '5'

                : idx < 30
                ? '1.5'

                : '0.5'
              }

              {' '}Gram

            </span>


          </div>


        </div>

      ))

    )}

  </div>

</div>


        </motion.div>
      )}

    </AnimatePresence>

  </main>

{/* ADSGRAM VERIFICATION OVERLAY */}
<AnimatePresence>

  {watchingAd && (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}

      className="
        fixed inset-0 
        bg-black/95 
        z-50 
        flex flex-col 
        items-center 
        justify-center 
        p-6 
        text-center 
        space-y-5
      "
    >


      {/* AdsGram Icon */}
      <div className="
        bg-blue-600/10 
        p-5 
        rounded-full 
        border 
        border-blue-500/30 
        animate-pulse 
        text-blue-400
      ">
        <Tv className="w-12 h-12" />
      </div>




      {/* Header */}
      <div className="space-y-2 max-w-md">


        <h3 className="
          font-black 
          text-base 
          text-white 
          tracking-tight
        ">
          AdsGram Task Verification
        </h3>



        <p className="
          text-xs 
          text-yellow-500 
          font-bold
        ">
          {watchingAd?.taskName || "AdsGram Premium Task"}
        </p>



        <p className="
          text-xs 
          text-gray-400
        ">
          Your task completion is being verified securely through Gram Quest backend.
        </p>


      </div>





      {/* Verification Timer */}
      <div className="
        space-y-3 
        w-full 
        max-w-xs 
        pt-4
      ">


        <div className="
          flex 
          justify-between 
          items-center 
          text-xs
        ">

          <span className="
            text-gray-400 
            font-semibold
          ">
            Cloudflare Verification
          </span>



          <span className="
            text-blue-400 
            font-black
          ">
            {adSeconds}s Remaining
          </span>


        </div>





        {/* Progress Bar */}
        <div className="
          w-full 
          h-3 
          rounded-full 
          bg-gray-800 
          overflow-hidden
        ">


          <div

            className="
              bg-gradient-to-r 
              from-blue-500 
              to-yellow-500 
              h-full 
              rounded-full 
              transition-all 
              duration-1000
            "


            style={{
              width: `${Math.min(
                100,
                ((60 - adSeconds) / 60) * 100
              )}%`
            }}

          />


        </div>



        <p className="
          text-[10px] 
          text-gray-500
        ">
          Please keep this page open until verification completes.
        </p>


      </div>





      {/* Backend Status */}
      <div className="
        px-4 
        py-2 
        rounded-xl 
        bg-blue-500/10 
        border 
        border-blue-500/20
      ">

        <p className="
          text-[10px] 
          text-blue-400 
          font-bold
        ">
          🔒 Checking AdsGram completion • Reward will be added automatically
        </p>

      </div>



    </motion.div>

  )}

</AnimatePresence>


{/* GIGAPUB REWARD VERIFICATION OVERLAY */}
<AnimatePresence>

  {showAdOverlay && (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}

      className="
        fixed 
        inset-0 
        bg-black/90 
        z-50 
        flex 
        flex-col 
        items-center 
        justify-center 
        p-6 
        text-center 
        space-y-5
      "
    >


      {/* Icon */}
      <div className="
        bg-yellow-500/10 
        p-5 
        rounded-full 
        border 
        border-yellow-500/20 
        text-yellow-500
      ">

        <Coins className="
          w-12 
          h-12 
          animate-bounce
        "/>

      </div>




      {/* Text */}
      <div className="space-y-2">

        <h3 className="
          font-black 
          text-sm 
          text-white
        ">
          Gigapub Reward Verification
        </h3>


        <p className="
          text-[11px] 
          text-yellow-500 
          font-bold
        ">
          Checking advertisement completion...
        </p>


        <p className="
          text-[10px] 
          text-gray-400
        ">
          Please wait while your spin reward is being unlocked.
        </p>


      </div>





      {/* Loading Animation */}
      <div className="
        w-40 
        h-2 
        rounded-full 
        bg-gray-800 
        overflow-hidden
      ">

        <div 
          className="
            bg-gradient-to-r 
            from-yellow-500 
            to-orange-500 
            h-full 
            w-full 
            animate-pulse
          "
        />

      </div>





      <p className="
        text-[10px] 
        text-gray-500
      ">
        Do not close this window. Reward will be credited automatically.
      </p>



    </motion.div>

  )}

</AnimatePresence>




{/* Bottom Sticky Native Navigation Bar */}

<nav 
className={`
  fixed 
  bottom-0 
  left-0 
  right-0 
  h-16 
  border-t 
  backdrop-blur-md 
  flex 
  justify-around 
  items-center 
  px-1 
  z-40

  ${
    theme === 'dark'
    ? 'bg-[#0b0f19]/95 border-gray-800 text-gray-400'
    : 'bg-white/95 border-gray-200 text-gray-500'
  }
`}
>


{/* HOME */}

<button

onClick={()=>{
  setActiveTab('home');
  refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'home'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<Coins className="w-5 h-5"/>

<span className="text-[9px]">
Home
</span>

</button>





{/* TASKS */}

<button

onClick={()=>{
 setActiveTab('tasks');
 refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'tasks'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<CheckSquare className="w-5 h-5"/>

<span className="text-[9px]">
Tasks
</span>

</button>






{/* SPIN */}

<button

onClick={()=>{
 setActiveTab('spin');
 refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'spin'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<RotateCw className="w-5 h-5"/>

<span className="text-[9px]">
Spin
</span>

</button>







{/* FRIENDS */}

<button

onClick={()=>{
 setActiveTab('friends');
 refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'friends'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<Users className="w-5 h-5"/>

<span className="text-[9px]">
Friends
</span>

</button>







{/* WALLET */}

<button

onClick={()=>{
 setActiveTab('wallet');
 refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'wallet'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<Wallet className="w-5 h-5"/>

<span className="text-[9px]">
Wallet
</span>

</button>







{/* RANKS */}

<button

onClick={()=>{
 setActiveTab('ranks');
 refreshData();
}}

className={`
flex flex-col items-center justify-center
space-y-1 w-14 h-full transition-all

${
activeTab === 'ranks'
? 'text-blue-500 font-bold'
: 'hover:text-blue-400'
}

`}
>

<Trophy className="w-5 h-5"/>

<span className="text-[9px]">
Ranks
</span>

</button>



</nav>

</div>
  );
}

me rahina Umaru 
