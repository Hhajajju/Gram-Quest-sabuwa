import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings as SettingsIcon, 
  ListTodo, 
  Banknote, 
  Send, 
  Search, 
  Edit3, 
  Trash2, 
  UserPlus, 
  X, 
  Check, 
  Lock, 
  Bot, 
  Coins, 
  Plus, 
  ShieldAlert, 
  LogOut,
  Sliders,
  DollarSign,
  Tv
} from 'lucide-react';
import { GramQuestDB, BotNotification } from '../database';
import { User, Task, AppSettings, Withdrawal } from '../types';

interface AdminPanelProps {
  onSwitchToUser: () => void;
}

export default function AdminPanel({ onSwitchToUser }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'financial' | 'withdrawals' | 'bot'>('users');

  // Shared Data States
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(GramQuestDB.getSettings());
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [botNotifications, setBotNotifications] = useState<BotNotification[]>([]);

  // User search/edit state
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editCoins, setEditCoins] = useState(0);
  const [editGrams, setEditGrams] = useState(0);

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<Task['type']>('normal');
  const [taskReward, setTaskReward] = useState(1000);
  const [taskDailyLimit, setTaskDailyLimit] = useState(1);
  const [taskUrl, setTaskUrl] = useState('');

  // Rejection Modal State
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Notification Broadcast State
  const [notificationTarget, setNotificationTarget] = useState<string>('all'); // 'all' or specific telegramId
  const [notificationMessage, setNotificationMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Stats Counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalCoins: 0,
    totalGrams: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    const allUsers = GramQuestDB.getUsers();
    const allTasks = GramQuestDB.getTasks();
    const appSettings = GramQuestDB.getSettings();
    const allWithdrawals = GramQuestDB.getWithdrawals();
    const allNotifications = GramQuestDB.getBotNotifications();

    setUsers(allUsers);
    setTasks(allTasks);
    setSettings(appSettings);
    setWithdrawals(allWithdrawals);
    setBotNotifications(allNotifications);

    // Calculate Statistics
    const totalCoins = allUsers.reduce((acc, curr) => acc + curr.coinBalance, 0);
    const totalGrams = allUsers.reduce((acc, curr) => acc + curr.gramBalance, 0);
    const verifiedUsersCount = allUsers.reduce((acc, curr) => acc + (curr.verifiedReferrals > 0 ? 1 : 0), 0);
    const pendingWithdrawalsCount = allWithdrawals.filter(w => w.status === 'pending').length;

    setStats({
      totalUsers: allUsers.length,
      verifiedUsers: verifiedUsersCount,
      totalCoins,
      totalGrams,
      pendingWithdrawals: pendingWithdrawalsCount
    });
  };

  // Admin authentication (standard virtual passcodes)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Try "admin123" for virtual access.');
    }
  };

  // Toggle user block
  const handleToggleBlock = (telegramId: string) => {
    const res = GramQuestDB.toggleUserBlock(telegramId);
    alert(res.message);
    loadData();
  };

  // Edit User Balance modal save
  const handleSaveUserBalances = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = GramQuestDB.editUserBalance(editingUser.telegramId, editCoins, editGrams);
    alert(res.message);
    setEditingUser(null);
    loadData();
  };

  // Open user edit
  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditCoins(user.coinBalance);
    setEditGrams(user.gramBalance);
  };

  // Add or Edit Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || taskReward <= 0 || taskDailyLimit <= 0) {
      alert('Please fill all task fields correctly');
      return;
    }

    if (editingTask) {
      // Edit Task
      GramQuestDB.editTask(editingTask.taskId, {
        title: taskTitle,
        type: taskType,
        reward: taskReward,
        dailyLimit: taskDailyLimit,
        url: taskUrl || undefined
      });
      alert('Task updated successfully!');
    } else {
      // Add Task
      GramQuestDB.addTask({
        title: taskTitle,
        type: taskType,
        reward: taskReward,
        dailyLimit: taskDailyLimit,
        url: taskUrl || undefined,
        active: true
      });
      alert('New task added successfully!');
    }

    // Reset task form
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskTitle('');
    setTaskType('normal');
    setTaskReward(1000);
    setTaskDailyLimit(1);
    setTaskUrl('');
    loadData();
  };

  // Open task edit
  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskType(task.type);
    setTaskReward(task.reward);
    setTaskDailyLimit(task.dailyLimit);
    setTaskUrl(task.url || '');
    setShowTaskForm(true);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      GramQuestDB.deleteTask(taskId);
      loadData();
    }
  };

  // Update Settings (Financial + Bot settings)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    GramQuestDB.saveSettings(settings);
    alert('Financial and bot settings saved successfully!');
    loadData();
  };

  // Withdrawals Approval
  const handleApproveWithdrawal = (id: string) => {
    const res = GramQuestDB.approveWithdrawal(id);
    alert(res.message);
    loadData();
  };

  // Withdrawals Rejection Reason Submission
  const handleRejectWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawalId || !rejectionReason.trim()) return;

    const res = GramQuestDB.rejectWithdrawal(rejectingWithdrawalId, rejectionReason);
    alert(res.message);
    setRejectingWithdrawalId(null);
    setRejectionReason('');
    loadData();
  };

  // Send Admin Announcement
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSuccess('');
    if (!notificationMessage.trim()) return;

    const res = GramQuestDB.sendAdminNotification(notificationTarget, notificationMessage);
    if (res.success) {
      setBroadcastSuccess(`Message successfully sent to ${res.count} user(s).`);
      setNotificationMessage('');
      loadData();
    } else {
      alert('Failed to send notification. Verify telegramId exists.');
    }
  };

  // Filtering users
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.telegramId.includes(searchQuery)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#0c1221] border border-gray-800 rounded-2xl p-6 shadow-2xl text-center space-y-6">
          <div className="bg-blue-600/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-blue-500/25 text-blue-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight">Gram Quest Admin Panel</h2>
            <p className="text-xs text-gray-400">Authorized administrator log in required.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Security Passcode</label>
              <input 
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#11192e] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-600 transition-colors"
                autoFocus
              />
              <p className="text-[10px] text-blue-400/85 font-medium italic mt-1">Hint: Use password <b>admin123</b> to log in.</p>
            </div>

            {authError && <p className="text-xs text-red-500 font-bold">{authError}</p>}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/15"
            >
              Verify Passcode
            </button>
          </form>

          <div className="pt-2 border-t border-gray-800">
            <button 
              onClick={onSwitchToUser}
              className="text-xs text-gray-500 hover:text-gray-300 font-bold transition-colors"
            >
              ← Back to Telegram User App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#0c1221] border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg text-xs font-black">GQ</div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight flex items-center space-x-1.5">
              <span>Gram Quest Admin</span>
              <span className="bg-blue-500/10 text-blue-400 text-[9px] px-1.5 py-0.2 rounded font-black">SUPERADMIN</span>
            </h1>
            <p className="text-[10px] text-gray-400">Connected to Virtual Cloud Storage</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={onSwitchToUser}
            className="bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-blue-400 text-xs px-4 py-2 rounded-xl font-extrabold transition-all"
          >
            📱 Telegram App
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 text-xs p-2 rounded-xl transition-all"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Stats Summary Bento Grid */}
      <section className="p-6 bg-[#0c1221]/40 border-b border-gray-850">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total Users</span>
            <p className="text-xl font-black text-blue-400">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Verified Users</span>
            <p className="text-xl font-black text-green-500">{stats.verifiedUsers}</p>
          </div>
          <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Coins Distributed</span>
            <p className="text-xl font-black text-yellow-500">{stats.totalCoins.toLocaleString()}</p>
          </div>
          <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Grams Outstanding</span>
            <p className="text-xl font-black text-purple-400">{stats.totalGrams.toFixed(2)} Gram</p>
          </div>
          <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl space-y-1 col-span-2 md:col-span-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Pending Payouts</span>
            <p className="text-xl font-black text-orange-400">{stats.pendingWithdrawals}</p>
          </div>
        </div>
      </section>

      {/* Navigation Subheader */}
      <div className="flex border-b border-gray-850 bg-[#0c1221]/20 overflow-x-auto">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'tasks', label: 'Task Management', icon: ListTodo },
          { id: 'financial', label: 'Financial Settings', icon: Sliders },
          { id: 'withdrawals', label: 'Withdrawal Requests', icon: Banknote },
          { id: 'bot', label: 'Bot & Broadcaster', icon: Bot },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 text-xs font-extrabold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#0c1221] border border-gray-800 p-4 rounded-xl">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search users by username or Telegram ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                />
              </div>
              <p className="text-xs text-gray-400 font-semibold">{filteredUsers.length} Users found</p>
            </div>

            {/* Users list table */}
            <div className="bg-[#0c1221] border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#11192e] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">User</th>
                      <th className="p-4">Telegram ID</th>
                      <th className="p-4">Coin Balance</th>
                      <th className="p-4">Gram Balance</th>
                      <th className="p-4">Verified Refs</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map(user => (
                      <tr key={user.telegramId} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-bold">
                          <div className="flex items-center space-x-2.5">
                            <img 
                              src={user.profilePhoto} 
                              alt="" 
                              className="w-8 h-8 rounded-full border border-gray-850 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span>@{user.username}</span>
                              {user.blocked && (
                                <span className="ml-2 bg-red-650 text-red-400 text-[9px] px-1.5 py-0.1 rounded font-black border border-red-500/20 uppercase">
                                  Blocked
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-gray-400">{user.telegramId}</td>
                        <td className="p-4 font-bold text-yellow-500">{user.coinBalance.toLocaleString()}</td>
                        <td className="p-4 font-bold text-blue-400">{user.gramBalance.toFixed(4)} Gram</td>
                        <td className="p-4 text-green-500 font-extrabold">{user.verifiedReferrals} Refs</td>
                        <td className="p-4 space-x-2">
                          <button 
                            onClick={() => openEditUser(user)}
                            className="bg-blue-600/10 hover:bg-blue-650 text-blue-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-blue-500/20 transition-all"
                          >
                            Edit Balances
                          </button>
                          <button 
                            onClick={() => handleToggleBlock(user.telegramId)}
                            className={`${user.blocked ? 'bg-green-600/10 text-green-400 hover:bg-green-650 border-green-500/20' : 'bg-red-600/10 text-red-400 hover:bg-red-650 border-red-500/20'} hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all`}
                          >
                            {user.blocked ? 'Unlock' : 'Block User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASK MANAGEMENT */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0c1221] border border-gray-800 p-4 rounded-xl">
              <div>
                <h3 className="font-extrabold text-sm">Custom Task Repository</h3>
                <p className="text-[10px] text-gray-400">Configure Adsgram and normal partner rewards</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTask(null);
                  setTaskTitle('');
                  setTaskType('normal');
                  setTaskReward(1000);
                  setTaskDailyLimit(1);
                  setTaskUrl('');
                  setShowTaskForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Task</span>
              </button>
            </div>

            {/* Task Form Drawer/Modal */}
            {showTaskForm && (
              <form onSubmit={handleSaveTask} className="bg-[#0c1221] border border-blue-500/25 p-5 rounded-xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">
                    {editingTask ? '✏️ Edit Task Specifications' : '➕ Create New Task specification'}
                  </h4>
                  <button type="button" onClick={() => setShowTaskForm(false)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Task Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Subscribe to YouTube"
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Task Platform Type</label>
                    <select 
                      value={taskType}
                      onChange={e => setTaskType(e.target.value as any)}
                      className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                    >
                      <option value="normal">Normal Partner (with Link redirect)</option>
                      <option value="adsgram">Adsgram Video Advertisement</option>
                      <option value="adsgram_ad">Adsgram Banner / Click Ad</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Reward Coins</label>
                    <input 
                      type="number" 
                      value={taskReward}
                      onChange={e => setTaskReward(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Daily Submission Limit</label>
                    <input 
                      type="number" 
                      value={taskDailyLimit}
                      onChange={e => setTaskDailyLimit(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  {taskType === 'normal' && (
                    <div className="space-y-1 text-left md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Redirect Link URL</label>
                      <input 
                        type="url" 
                        placeholder="https://t.me/examplechannel"
                        value={taskUrl}
                        onChange={e => setTaskUrl(e.target.value)}
                        className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowTaskForm(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg shadow-md"
                  >
                    Save Task Settings
                  </button>
                </div>
              </form>
            )}

            {/* Tasks directory table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => (
                <div 
                  key={task.taskId}
                  className="bg-[#0c1221] border border-gray-850 p-4 rounded-xl flex justify-between items-center"
                >
                  <div className="text-left space-y-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.type === 'adsgram' ? 'bg-purple-500/10 text-purple-400' : task.type === 'adsgram_ad' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {task.type}
                    </span>
                    <h4 className="font-extrabold text-xs mt-1.5">{task.title}</h4>
                    <p className="text-[10px] opacity-70">Reward: <span className="text-yellow-500 font-bold">+{task.reward.toLocaleString()} Coins</span> • Limit: {task.dailyLimit}/day</p>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <button 
                      onClick={() => openEditTask(task)}
                      className="bg-gray-800 hover:bg-gray-750 text-gray-300 p-2 rounded-lg transition-all"
                      title="Edit task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="bg-red-500/10 hover:bg-red-650 text-red-500 hover:text-white p-2 rounded-lg transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL SETTINGS */}
        {activeTab === 'financial' && (
          <form onSubmit={handleSaveSettings} className="bg-[#0c1221] border border-gray-850 p-6 rounded-xl space-y-5 text-left">
            <div>
              <h3 className="font-extrabold text-sm">Financial Core Parameters</h3>
              <p className="text-[10px] text-gray-400">Configure swap conversion metrics, withdrawal commissions, and boundaries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Coins to Gram Rate (Default: 1,000,000)</label>
                <input 
                  type="number" 
                  value={settings.conversionRate}
                  onChange={e => setSettings({ ...settings, conversionRate: parseInt(e.target.value) || 1000000 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Withdrawal Fee Percentage (%)</label>
                <input 
                  type="number" 
                  value={settings.withdrawalFee}
                  onChange={e => setSettings({ ...settings, withdrawalFee: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Minimum Coin Conversion Limit</label>
                <input 
                  type="number" 
                  value={settings.minConversion}
                  onChange={e => setSettings({ ...settings, minConversion: parseInt(e.target.value) || 10000 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Maximum Coin Conversion Limit</label>
                <input 
                  type="number" 
                  value={settings.maxConversion}
                  onChange={e => setSettings({ ...settings, maxConversion: parseInt(e.target.value) || 100000000 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Minimum Gram Withdrawal Limit</label>
                <input 
                  type="number" 
                  value={settings.minWithdrawal}
                  onChange={e => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Maximum Gram Withdrawal Limit</label>
                <input 
                  type="number" 
                  value={settings.maxWithdrawal}
                  onChange={e => setSettings({ ...settings, maxWithdrawal: parseFloat(e.target.value) || 100 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-400">Daily Task Completion Limit per user</label>
                <input 
                  type="number" 
                  value={settings.dailyTaskLimit}
                  onChange={e => setSettings({ ...settings, dailyTaskLimit: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
              >
                Save Financial Rules
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: WITHDRAWAL MANAGEMENT */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="bg-[#0c1221] border border-gray-800 p-4 rounded-xl text-left">
              <h3 className="font-extrabold text-sm">Withdrawal Payout Requests</h3>
              <p className="text-[10px] text-gray-400">Verify user compliance and distribute Grams or issue rejections</p>
            </div>

            {/* Rejection Modal/Form */}
            {rejectingWithdrawalId && (
              <form onSubmit={handleRejectWithdrawal} className="bg-[#0c1221] border border-red-500/20 p-5 rounded-xl space-y-4 shadow-xl text-left">
                <h4 className="font-extrabold text-xs uppercase text-red-500 tracking-wider">Provide Rejection Explanation</h4>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Reason for Rejection (Visible to user)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Account flagged for fake referrals/multiple profiles"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => { setRejectingWithdrawalId(null); setRejectionReason(''); }}
                    className="bg-gray-800 hover:bg-gray-700 text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg"
                  >
                    Confirm Rejection & Return Funds
                  </button>
                </div>
              </form>
            )}

            {/* Withdrawals list */}
            {withdrawals.length === 0 ? (
              <div className="bg-[#0c1221] border border-gray-800 p-8 text-center rounded-xl opacity-60">
                <Banknote className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">No withdrawal requests found in the system history.</p>
              </div>
            ) : (
              <div className="bg-[#0c1221] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#11192e] text-gray-400 font-bold uppercase text-[10px]">
                        <th className="p-4">User</th>
                        <th className="p-4">Requested</th>
                        <th className="p-4">Fee ({settings.withdrawalFee}%)</th>
                        <th className="p-4">Net Payout</th>
                        <th className="p-4">TON Address</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {withdrawals.map(wdr => (
                        <tr key={wdr.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-bold">@{wdr.username}</td>
                          <td className="p-4 font-bold text-yellow-500">{wdr.amount} Gram</td>
                          <td className="p-4 text-red-400">-{wdr.fee} Gram</td>
                          <td className="p-4 font-bold text-green-500">{wdr.netAmount} Gram</td>
                          <td className="p-4 font-mono text-gray-400 text-[10px] max-w-[120px] truncate" title={wdr.tonAddress}>{wdr.tonAddress}</td>
                          <td className="p-4">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black border uppercase ${
                              wdr.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              wdr.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {wdr.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {wdr.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveWithdrawal(wdr.id)}
                                  className="bg-green-600/10 hover:bg-green-650 text-green-400 hover:text-white px-2 py-1 rounded-lg text-[10px] font-bold border border-green-500/20 transition-all"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => setRejectingWithdrawalId(wdr.id)}
                                  className="bg-red-600/10 hover:bg-red-650 text-red-400 hover:text-white px-2 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            ) : wdr.status === 'rejected' && wdr.rejectionReason ? (
                              <span className="text-[10px] text-gray-500 italic max-w-[150px] truncate block" title={wdr.rejectionReason}>
                                {wdr.rejectionReason}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TELEGRAM BOT SETTINGS */}
        {activeTab === 'bot' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Telegram Bot config */}
            <form onSubmit={handleSaveSettings} className="bg-[#0c1221] border border-gray-850 p-5 rounded-xl space-y-4 md:col-span-1 h-fit">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400 border-b pb-2 border-white/5 flex items-center space-x-1.5">
                <Bot className="w-4 h-4" />
                <span>Bot Core Settings</span>
              </h4>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Telegram Bot Username</label>
                <input 
                  type="text" 
                  value={settings.botUsername}
                  onChange={e => setSettings({ ...settings, botUsername: e.target.value })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Telegram Bot API Token Key</label>
                <input 
                  type="password" 
                  value={settings.botApiKey}
                  onChange={e => setSettings({ ...settings, botApiKey: e.target.value })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Support Admin Username</label>
                <input 
                  type="text" 
                  value={settings.supportUsername}
                  onChange={e => setSettings({ ...settings, supportUsername: e.target.value })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Bot Welcome Start Message</label>
                <textarea 
                  value={settings.welcomeMessage}
                  rows={3}
                  onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded-lg transition-all"
              >
                Save Bot Configurations
              </button>
            </form>

            {/* Telegram Bot Notification Broadcast */}
            <form onSubmit={handleBroadcast} className="bg-[#0c1221] border border-gray-850 p-5 rounded-xl space-y-4 md:col-span-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400 border-b pb-2 border-white/5 flex items-center space-x-1.5">
                <Send className="w-4 h-4" />
                <span>Send Push Notifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Target Recipients</label>
                  <select 
                    value={notificationTarget}
                    onChange={e => setNotificationTarget(e.target.value)}
                    className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="all">📢 All Registered App Users ({users.length})</option>
                    {users.map(u => (
                      <option key={u.telegramId} value={u.telegramId}>👤 @{u.username} (ID: {u.telegramId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Notification Message Text</label>
                <textarea 
                  placeholder="Type your simulated Telegram message announcement..."
                  rows={4}
                  value={notificationMessage}
                  onChange={e => setNotificationMessage(e.target.value)}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>

              {broadcastSuccess && <p className="text-xs text-green-500 font-bold">{broadcastSuccess}</p>}

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Notification</span>
                </button>
              </div>

              {/* Bot Message Logs log */}
              <div className="space-y-2.5 pt-4 border-t border-gray-800">
                <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-400">Bot Notification Logs Log</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {botNotifications.slice(0, 15).map(notif => (
                    <div 
                      key={notif.id}
                      className="p-3 bg-[#11192e] border border-gray-850 rounded-lg text-xs flex justify-between items-start"
                    >
                      <div>
                        <span className="text-[10px] font-black text-blue-400">To: @{notif.recipientName} (ID: {notif.recipientId})</span>
                        <p className="mt-1 font-medium opacity-85">{notif.message}</p>
                      </div>
                      <span className="text-[9px] opacity-45">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>

          </div>
        )}

      </main>

      {/* Edit Balances Dialog Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveUserBalances}
            className="w-full max-w-md bg-[#0c1221] border border-gray-800 p-6 rounded-2xl shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-sm tracking-tight text-blue-400 uppercase">
                ✏️ Edit Balances for @{editingUser.username}
              </h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-gray-400">Coin Balance</label>
                <input 
                  type="number" 
                  value={editCoins}
                  onChange={e => setEditCoins(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-gray-400">Gram Balance</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={editGrams}
                  onChange={e => setEditGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#11192e] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
              <button 
                type="button" 
                onClick={() => setEditingUser(null)}
                className="bg-gray-850 hover:bg-gray-800 text-xs px-4 py-2 rounded-lg text-gray-300"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
