export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
  createdAt: string;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  slug: string;
  creatorId: string; // 'guest' or user.id
  clicks: number;
  createdAt: string;
  lastClickedAt?: string;
  expiresAt?: string | null; // ISO string
  history?: DailyStat[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ClickStat {
  date: string;
  count: number;
}