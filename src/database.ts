import { User, Earning, Referral, Withdrawal, Task, AppSettings, SpinHistory } from './types';

// Initial Seed Data
const DEFAULT_SETTINGS: AppSettings = {
  conversionRate: 1000000, // 1,000,000 Coins = 1 Gram
  minConversion: 50000, // 50,000 Coins minimum
  maxConversion: 100000000,
  minWithdrawal: 10, // 10 Gram minimum
  maxWithdrawal: 1000, // 1000 Gram maximum
  withdrawalFee: 10, // 10% fee
  botApiKey: '7190827361:AAH8a9K_UjdJ0f_pLaK891h2zP9q02LkdEo',
  botUsername: 'GramQuestBot',
  welcomeMessage: 'Welcome to Gram Quest! 🎉 Complete Adsgram tasks, spin the wheel, and refer friends to earn Coins and convert them to withdrawable Gram!',
  dailyTaskLimit: 30,
  supportUsername: 'gramquest_support_admin'
};

const DEFAULT_TASKS: Task[] = [
  { taskId: 'task_1', type: 'adsgram', title: 'Watch Adsgram Premium Video', reward: 1500, dailyLimit: 10, active: true },
  { taskId: 'task_2', type: 'adsgram', title: 'Watch High-Yield Sponsor Ad', reward: 2500, dailyLimit: 5, active: true },
  { taskId: 'task_3', type: 'adsgram_ad', title: 'Click on Adsgram Sponsored Banner', reward: 1000, dailyLimit: 15, active: true },
  { taskId: 'task_4', type: 'normal', title: 'Join Gram Quest Official Telegram Channel', reward: 5000, dailyLimit: 1, active: true, url: 'https://t.me/GramQuestChannel' },
  { taskId: 'task_5', type: 'normal', title: 'Subscribe to TON Developer Community', reward: 7500, dailyLimit: 1, active: true, url: 'https://t.me/toncoin' },
  { taskId: 'task_6', type: 'normal', title: 'Follow Gram Quest on X (Twitter)', reward: 5000, dailyLimit: 1, active: true, url: 'https://twitter.com/GramQuest' }
];

const SEED_USERS: User[] = [
  { telegramId: '1001', username: 'Durov_Pavel', profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', coinBalance: 4500000, gramBalance: 12.5, referredBy: null, verifiedReferrals: 45, blocked: false, createdAt: '2026-07-01T12:00:00Z' },
  { telegramId: '1002', username: 'TON_whale', profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', coinBalance: 3200000, gramBalance: 8.4, referredBy: null, verifiedReferrals: 32, blocked: false, createdAt: '2026-07-02T14:30:00Z' },
  { telegramId: '1003', username: 'CryptoNinja', profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', coinBalance: 2800000, gramBalance: 5.2, referredBy: null, verifiedReferrals: 28, blocked: false, createdAt: '2026-07-03T09:15:00Z' },
  { telegramId: '1004', username: 'Miners_Quest', profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', coinBalance: 1900000, gramBalance: 3.1, referredBy: null, verifiedReferrals: 19, blocked: false, createdAt: '2026-07-04T18:45:00Z' },
  { telegramId: '1005', username: 'SpinKing', profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', coinBalance: 1200000, gramBalance: 1.2, referredBy: null, verifiedReferrals: 12, blocked: false, createdAt: '2026-07-05T11:20:00Z' }
];

export interface BotNotification {
  id: string;
  recipientId: string; // telegramId or 'all'
  recipientName: string;
  message: string;
  timestamp: string;
}

export class GramQuestDB {
  private static getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setStorageItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Collections state
  static getUsers(): User[] {
    return this.getStorageItem<User[]>('gq_users', SEED_USERS);
  }

  static saveUsers(users: User[]): void {
    this.setStorageItem('gq_users', users);
  }

  static getEarnings(): Earning[] {
    return this.getStorageItem<Earning[]>('gq_earnings', []);
  }

  static saveEarnings(earnings: Earning[]): void {
    this.setStorageItem('gq_earnings', earnings);
  }

  static getReferrals(): Referral[] {
    return this.getStorageItem<Referral[]>('gq_referrals', []);
  }

  static saveReferrals(referrals: Referral[]): void {
    this.setStorageItem('gq_referrals', referrals);
  }

  static getWithdrawals(): Withdrawal[] {
    return this.getStorageItem<Withdrawal[]>('gq_withdrawals', []);
  }

  static saveWithdrawals(withdrawals: Withdrawal[]): void {
    this.setStorageItem('gq_withdrawals', withdrawals);
  }

  static getTasks(): Task[] {
    return this.getStorageItem<Task[]>('gq_tasks', DEFAULT_TASKS);
  }

  static saveTasks(tasks: Task[]): void {
    this.setStorageItem('gq_tasks', tasks);
  }

  static getSettings(): AppSettings {
    return this.getStorageItem<AppSettings>('gq_settings', DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    this.setStorageItem('gq_settings', settings);
  }

  static getSpinHistory(): SpinHistory[] {
    return this.getStorageItem<SpinHistory[]>('gq_spin_history', []);
  }

  static saveSpinHistory(history: SpinHistory[]): void {
    this.setStorageItem('gq_spin_history', history);
  }

  // Simulated Telegram Bot Notifications log
  static getBotNotifications(): BotNotification[] {
    return this.getStorageItem<BotNotification[]>('gq_bot_notifications', []);
  }

  static saveBotNotifications(notifications: BotNotification[]): void {
    this.setStorageItem('gq_bot_notifications', notifications);
  }

  // Daily task completed counters (keyed by telegramId)
  static getUserDailyTaskCount(telegramId: string): number {
    const counts = this.getStorageItem<Record<string, number>>('gq_user_daily_task_counts', {});
    return counts[telegramId] || 0;
  }

  static setUserDailyTaskCount(telegramId: string, count: number): void {
    const counts = this.getStorageItem<Record<string, number>>('gq_user_daily_task_counts', {});
    counts[telegramId] = count;
    this.setStorageItem('gq_user_daily_task_counts', counts);
  }

  // Quick helper to log notification
  static logBotNotification(recipientId: string, recipientName: string, message: string) {
    const notifications = this.getBotNotifications();
    const newNotif: BotNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      recipientId,
      recipientName,
      message,
      timestamp: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    this.saveBotNotifications(notifications);

    // Custom browser alert or notification fallback for visual validation
    console.log(`[Telegram Bot to ${recipientName} (${recipientId})]: ${message}`);
  }

  // --- CORE LOGIC OPERATIONS ---

  // 1. User login (or creation)
  static loginUser(telegramId: string, username: string, profilePhoto: string, refId: string | null): User {
    const users = this.getUsers();
    let user = users.find(u => u.telegramId === telegramId);

    if (!user) {
      // Create user account
      let referrerId: string | null = null;
      if (refId && refId !== telegramId) {
        // Verify if referrer exists
        const referrer = users.find(u => u.telegramId === refId);
        if (referrer) {
          referrerId = refId;
        }
      }

      user = {
        telegramId,
        username,
        profilePhoto: profilePhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        coinBalance: 0,
        gramBalance: 0,
        referredBy: referrerId,
        verifiedReferrals: 0,
        blocked: false,
        createdAt: new Date().toISOString()
      };

      users.push(user);
      this.saveUsers(users);

      // Save referral record
      if (referrerId) {
        const referrals = this.getReferrals();
        const refUser = users.find(u => u.telegramId === referrerId);
        referrals.push({
          id: 'ref_' + Math.random().toString(36).substr(2, 9),
          referrerId,
          referredUserId: telegramId,
          referredUsername: username,
          status: 'pending',
          createdAt: new Date().toISOString(),
          verifiedAt: null
        });
        this.saveReferrals(referrals);

        // Notify referrer that someone joined via their link
        this.logBotNotification(
          referrerId,
          refUser?.username || referrerId,
          `👥 A new user @${username} joined using your referral link. Complete their first 30 daily tasks to unlock your 100,000 Coins bonus!`
        );
      }
    } else {
      // If user exists but photo/username updated
      let updated = false;
      if (user.username !== username) {
        user.username = username;
        updated = true;
      }
      if (profilePhoto && user.profilePhoto !== profilePhoto) {
        user.profilePhoto = profilePhoto;
        updated = true;
      }
      if (updated) {
        this.saveUsers(users);
      }
    }

    return user;
  }

  // 2. Add Earnings with 10% commission flow to Referrer
  static addCoinsToUser(telegramId: string, amount: number, earningType: Earning['type'], description: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user || user.blocked) return;

    user.coinBalance += amount;
    this.saveUsers(users);

    // Save earning history
    const earnings = this.getEarnings();
    earnings.unshift({
      id: 'earn_' + Math.random().toString(36).substr(2, 9),
      userId: telegramId,
      type: earningType,
      amount,
      description,
      createdAt: new Date().toISOString()
    });
    this.saveEarnings(earnings);

    // Lifetime referral commission: Referrer gets 10% of ALL earnings forever
    if (user.referredBy && earningType !== 'commission' && earningType !== 'referral_reward') {
      const referrerAmount = Math.floor(amount * 0.10);
      if (referrerAmount > 0) {
        const referrer = users.find(u => u.telegramId === user.referredBy);
        if (referrer && !referrer.blocked) {
          referrer.coinBalance += referrerAmount;
          this.saveUsers(users);

          earnings.unshift({
            id: 'earn_' + Math.random().toString(36).substr(2, 9),
            userId: user.referredBy,
            type: 'commission',
            amount: referrerAmount,
            description: `10% commission from @${user.username}'s ${earningType}`,
            createdAt: new Date().toISOString()
          });
          this.saveEarnings(earnings);

          // Simulated notification
          this.logBotNotification(
            referrer.telegramId,
            referrer.username,
            `💰 You earned ${referrerAmount.toLocaleString()} Coins commission from @${user.username}!`
          );
        }
      }
    }
  }

  // 3. Complete Task
  static completeTask(telegramId: string, taskId: string): { success: boolean; reward: number; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, reward: 0, message: 'User not found' };
    if (user.blocked) return { success: false, reward: 0, message: 'Account blocked' };

    const tasks = this.getTasks();
    const task = tasks.find(t => t.taskId === taskId);
    if (!task || !task.active) return { success: false, reward: 0, message: 'Task not active or not found' };

    // Increment user daily progress count
    const currentProgress = this.getUserDailyTaskCount(telegramId);
    const limit = this.getSettings().dailyTaskLimit;

    // Check if task completed fits limit, or just increase progress
    this.setUserDailyTaskCount(telegramId, currentProgress + 1);

    // Add coin balance
    this.addCoinsToUser(telegramId, task.reward, 'task', `Completed task: ${task.title}`);

    return {
      success: true,
      reward: task.reward,
      message: `Task "${task.title}" completed successfully! +${task.reward} Coins added.`
    };
  }

  // 4. Claim 30 Daily Task Bonus (including Referral verification trigger)
  static claimDailyBonus(telegramId: string): { success: boolean; reward: number; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, reward: 0, message: 'User not found' };
    if (user.blocked) return { success: false, reward: 0, message: 'Account blocked' };

    const currentProgress = this.getUserDailyTaskCount(telegramId);
    if (currentProgress < 30) {
      return { success: false, reward: 0, message: 'You need 30 completed tasks to claim the daily bonus' };
    }

    // Reward amount
    const reward = 30000;

    // Award reward
    this.addCoinsToUser(telegramId, reward, 'daily_bonus', 'Completed 30 Daily Tasks Bonus');

    // Reset task progress
    this.setUserDailyTaskCount(telegramId, 0);

    // VERIFIED REFERRAL TRIGGER
    // A verified referral is when the referred user completes and claims their first 30/30 daily bonus.
    if (user.referredBy) {
      const referrals = this.getReferrals();
      const refRecord = referrals.find(r => r.referredUserId === telegramId && r.status === 'pending');

      if (refRecord) {
        refRecord.status = 'verified';
        refRecord.verifiedAt = new Date().toISOString();
        this.saveReferrals(referrals);

        // Update referrer statistics and grant verified referral reward
        const referrer = users.find(u => u.telegramId === user.referredBy);
        if (referrer && !referrer.blocked) {
          referrer.verifiedReferrals += 1;
          this.saveUsers(users);

          // Referrer receives 100,000 Coins only once per verified referral
          const refReward = 100000;
          this.addCoinsToUser(referrer.telegramId, refReward, 'referral_reward', `Verified referral: @${user.username}`);

          // Bot notification
          this.logBotNotification(
            referrer.telegramId,
            referrer.username,
            `Congratulations 🎉 You received 100,000 Coins from a verified referral (@${user.username}).`
          );

          // Check Daily Referral Bonus: 10 verified referrals in 24 hours. Reward: 200,000 Coins.
          // Let's count verified referrals in last 24h for referrer
          const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const refsIn24h = referrals.filter(r => 
            r.referrerId === referrer.telegramId && 
            r.status === 'verified' && 
            r.verifiedAt && 
            new Date(r.verifiedAt) > last24h
          );

          if (refsIn24h.length % 10 === 0 && refsIn24h.length > 0) {
            // Give Daily Referral Bonus: 200,000 Coins
            const dailyBonusReward = 200000;
            this.addCoinsToUser(referrer.telegramId, dailyBonusReward, 'referral_daily_bonus', `Daily Referral Bonus (10 verified refs in 24h)`);
            
            this.logBotNotification(
              referrer.telegramId,
              referrer.username,
              `🏆 Spectacular! You achieved 10 verified referrals in 24 hours! You received a 200,000 Coins bonus!`
            );
          }
        }
      }
    }

    return {
      success: true,
      reward,
      message: 'Successfully claimed your 30,000 Coins daily bonus!'
    };
  }

  // 5. Spin Wheel and Claim
  static spinWheel(telegramId: string): { success: boolean; reward: number; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, reward: 0, message: 'User not found' };
    if (user.blocked) return { success: false, reward: 0, message: 'Account blocked' };

    // Possible rewards
    const rewards = [100, 500, 1000, 2000, 3000];
    const winningReward = rewards[Math.floor(Math.random() * rewards.length)];

    return {
      success: true,
      reward: winningReward,
      message: `You won ${winningReward} Coins!`
    };
  }

  static claimSpinReward(telegramId: string, reward: number): void {
    const spinHistory = this.getSpinHistory();
    spinHistory.unshift({
      id: 'spin_' + Math.random().toString(36).substr(2, 9),
      userId: telegramId,
      reward,
      createdAt: new Date().toISOString()
    });
    this.saveSpinHistory(spinHistory);

    // Add reward
    this.addCoinsToUser(telegramId, reward, 'spin', 'Spin wheel reward');
  }

  // 6. Convert Coins to Gram
  static convertCoins(telegramId: string, coinsToConvert: number): { success: boolean; message: string; gramEarned: number } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, message: 'User not found', gramEarned: 0 };
    if (user.blocked) return { success: false, message: 'Account blocked', gramEarned: 0 };

    const settings = this.getSettings();
    if (coinsToConvert < settings.minConversion) {
      return { success: false, message: `Minimum conversion is ${settings.minConversion.toLocaleString()} Coins`, gramEarned: 0 };
    }
    if (coinsToConvert > settings.maxConversion) {
      return { success: false, message: `Maximum conversion is ${settings.maxConversion.toLocaleString()} Coins`, gramEarned: 0 };
    }
    if (user.coinBalance < coinsToConvert) {
      return { success: false, message: 'Insufficient coin balance', gramEarned: 0 };
    }

    // Convert
    const gramEarned = coinsToConvert / settings.conversionRate;
    user.coinBalance -= coinsToConvert;
    user.gramBalance += gramEarned;
    this.saveUsers(users);

    return {
      success: true,
      message: `Successfully converted ${coinsToConvert.toLocaleString()} Coins to ${gramEarned.toFixed(4)} Gram!`,
      gramEarned
    };
  }

  // 7. Withdraw Gram
  static requestWithdrawal(telegramId: string, amount: number, tonAddress: string): { success: boolean; message: string; withdrawal?: Withdrawal } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, message: 'User not found' };
    if (user.blocked) return { success: false, message: 'Account blocked' };

    const settings = this.getSettings();
    if (amount < settings.minWithdrawal) {
      return { success: false, message: `Minimum withdrawal is ${settings.minWithdrawal} Gram` };
    }
    if (amount > settings.maxWithdrawal) {
      return { success: false, message: `Maximum withdrawal is ${settings.maxWithdrawal} Gram` };
    }
    if (user.gramBalance < amount) {
      return { success: false, message: 'Insufficient Gram balance' };
    }

    // Deduct balance immediately
    user.gramBalance -= amount;
    this.saveUsers(users);

    // Save withdrawal
    const fee = (amount * settings.withdrawalFee) / 100;
    const netAmount = amount - fee;

    const withdrawals = this.getWithdrawals();
    const withdrawal: Withdrawal = {
      id: 'wdr_' + Math.random().toString(36).substr(2, 9),
      userId: telegramId,
      username: user.username,
      amount,
      fee,
      netAmount,
      tonAddress,
      status: 'pending',
      rejectionReason: null,
      createdAt: new Date().toISOString()
    };
    withdrawals.unshift(withdrawal);
    this.saveWithdrawals(withdrawals);

    this.logBotNotification(
      telegramId,
      user.username,
      `⏳ Your withdrawal request of ${amount} Gram to address ${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)} has been submitted. Status: Pending.`
    );

    return {
      success: true,
      message: `Withdrawal request for ${amount} Gram submitted. Est. payout: ${netAmount} Gram.`,
      withdrawal
    };
  }

  // --- ADMIN OPERATIONS ---

  // 8. Approve Withdrawal
  static approveWithdrawal(withdrawalId: string): { success: boolean; message: string } {
    const withdrawals = this.getWithdrawals();
    const wdr = withdrawals.find(w => w.id === withdrawalId);
    if (!wdr) return { success: false, message: 'Withdrawal not found' };
    if (wdr.status !== 'pending') return { success: false, message: 'Withdrawal is already processed' };

    wdr.status = 'approved';
    this.saveWithdrawals(withdrawals);

    // Notify user
    this.logBotNotification(
      wdr.userId,
      wdr.username,
      `Your withdrawal has been approved. Received: ${wdr.netAmount} Gram (after ${wdr.fee} Gram fee).`
    );

    return { success: true, message: 'Withdrawal approved successfully' };
  }

  // 9. Reject Withdrawal
  static rejectWithdrawal(withdrawalId: string, reason: string): { success: boolean; message: string } {
    const withdrawals = this.getWithdrawals();
    const wdr = withdrawals.find(w => w.id === withdrawalId);
    if (!wdr) return { success: false, message: 'Withdrawal not found' };
    if (wdr.status !== 'pending') return { success: false, message: 'Withdrawal is already processed' };

    wdr.status = 'rejected';
    wdr.rejectionReason = reason;
    this.saveWithdrawals(withdrawals);

    // Refund Gram to user
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === wdr.userId);
    if (user) {
      user.gramBalance += wdr.amount;
      this.saveUsers(users);
    }

    // Notify user
    this.logBotNotification(
      wdr.userId,
      wdr.username,
      `Your withdrawal was rejected: ${reason}`
    );

    return { success: true, message: 'Withdrawal rejected, funds returned to user' };
  }

  // 10. Edit User Balances
  static editUserBalance(telegramId: string, coinBalance: number, gramBalance: number): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, message: 'User not found' };

    user.coinBalance = coinBalance;
    user.gramBalance = gramBalance;
    this.saveUsers(users);

    return { success: true, message: `Successfully updated user balances.` };
  }

  // 11. Block/Unlock User
  static toggleUserBlock(telegramId: string): { success: boolean; blocked: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.telegramId === telegramId);
    if (!user) return { success: false, blocked: false, message: 'User not found' };

    user.blocked = !user.blocked;
    this.saveUsers(users);

    return {
      success: true,
      blocked: user.blocked,
      message: `User is now ${user.blocked ? 'BLOCKED' : 'UNLOCKED'}`
    };
  }

  // 12. Add/Edit/Delete Tasks
  static addTask(task: Omit<Task, 'taskId'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      taskId: 'task_' + Math.random().toString(36).substr(2, 9)
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  static editTask(taskId: string, updatedFields: Partial<Omit<Task, 'taskId'>>): { success: boolean } {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.taskId === taskId);
    if (taskIndex === -1) return { success: false };

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updatedFields
    };
    this.saveTasks(tasks);
    return { success: true };
  }

  static deleteTask(taskId: string): { success: boolean } {
    const tasks = this.getTasks();
    const updated = tasks.filter(t => t.taskId !== taskId);
    this.saveTasks(updated);
    return { success: true };
  }

  // 13. Send Bot Notification manually
  static sendAdminNotification(recipientId: string, message: string): { success: boolean; count: number } {
    const users = this.getUsers();
    if (recipientId === 'all') {
      users.forEach(u => {
        this.logBotNotification(u.telegramId, u.username, `📢 Message from Admin: ${message}`);
      });
      return { success: true, count: users.length };
    } else {
      const u = users.find(user => user.telegramId === recipientId);
      if (u) {
        this.logBotNotification(u.telegramId, u.username, `📢 Message from Admin: ${message}`);
        return { success: true, count: 1 };
      }
    }
    return { success: false, count: 0 };
  }
}
