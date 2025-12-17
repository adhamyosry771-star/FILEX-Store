
export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  bgColor: string; 
  isFeatured?: boolean;
  isAvailable?: boolean; // New field: true = Available, false = Sold Out
  exchangeRate?: number; // How many units per 1 USD (e.g., 1000 Gems)
  unitName?: string; // e.g., "شدة", "ماسة", "دولار"
}

export enum Tab {
  HOME = 'home',
  STORE = 'store',
  ORDERS = 'orders',
  PROFILE = 'profile',
  ADMIN = 'admin',
  NOTIFICATIONS = 'notifications',
}

export type Language = 'ar' | 'en' | 'fr';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  role: 'user' | 'admin' | 'system';
}

export interface SupportSession {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'queued' | 'active' | 'closed';
  adminId?: string; // The admin handling this chat
  adminName?: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface User {
  id: string;
  customId: number; // The 10000+ ID
  name: string;
  email?: string | null;
  phone?: string | null;
  photoURL?: string | null;
  balance: number;
  joinDate: string;
  isAdmin?: boolean;
  permissions?: string[]; // Array of allowed tab IDs (e.g., ['orders', 'support'])
  isBanned?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  dataKey: string;
  bgColor: string;
}

export interface Order {
  id: string;
  userId: string; // The customId (e.g., 10001)
  userName: string;
  productName: string;
  amountUSD: number;
  quantity: number; // Calculated quantity
  gameId: string; // User's Player ID in game
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface NewsItem {
  id: string;
  text: string;
  image: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  image?: string;
  date: string;
  read: boolean;
  type: 'system' | 'official';
  likes?: number;
  likedBy?: string[]; // Array of User IDs
}
