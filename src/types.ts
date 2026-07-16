export interface User {
  telegramId: string;
  username: string;
  profilePhoto: string;
  coinBalance: number;
  gramBalance: number;
  referredBy: string | null;
  verifiedReferrals: number;
  blocked: boolean;
  createdAt: string;
}

export interface Earning {
  id: string;
  userId: string; // telegramId
  type: 'task' | 'ad' | 'spin' | 'referral_reward' | 'commission' | 'daily_bonus' | 'referral_daily_bonus';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUsername: string;
  status: 'pending' | 'verified';
  createdAt: string;
  verifiedAt: string | null;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee: number;
  netAmount: number;
  tonAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  createdAt: string;
}

export interface Task {
  taskId: string;
  type: 'normal' | 'adsgram' | 'adsgram_ad';
  title: string;
  reward: number;
  dailyLimit: number;
  active: boolean;
  url?: string;
}

export interface AppSettings {
  conversionRate: number; // e.g. 1000000 Coins = 1 Gram
  minConversion: number;
  maxConversion: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFee: number; // percentage (e.g. 10)
  botApiKey: string;
  botUsername: string;
  welcomeMessage: string;
  dailyTaskLimit: number;
  supportUsername: string;
}

export interface SpinHistory {
  id: string;
  userId: string;
  reward: number;
  createdAt: string;
}

export interface AdminSettings {
  adminPasswordHash: string;
}
