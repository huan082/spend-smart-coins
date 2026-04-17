import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TxnType = "expense" | "income";
export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  saved: number;
  deadline?: string;
  productUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  notifyOnDrop: boolean;
}

export interface Deal {
  id: string;
  title: string;
  store: string;
  description: string;
  url?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
}

export interface PointEntry {
  id: string;
  reason: string;
  amount: number; // can be negative for redemption
  date: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string; // emoji
}

interface AppState {
  user: User | null;
  weeklyBudget: number; // 0 = not set
  transactions: Transaction[];
  goals: Goal[];
  deals: Deal[];
  points: number;
  pointHistory: PointEntry[];
  notificationsEnabled: boolean;
  budgetAlertEnabled: boolean;

  // auth
  login: (email: string, nickname?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "nickname" | "avatar">>) => void;

  // budget
  setWeeklyBudget: (amount: number) => void;

  // transactions
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // goals
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // deals
  addDeal: (d: Omit<Deal, "id" | "createdAt" | "likes" | "authorId" | "authorName">) => void;
  updateDeal: (id: string, d: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  likeDeal: (id: string) => void;

  // points
  addPoints: (amount: number, reason: string) => void;
  redeemPoints: (amount: number, reason: string) => boolean;

  // settings
  toggleNotifications: () => void;
  toggleBudgetAlert: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      weeklyBudget: 0,
      transactions: [],
      goals: [],
      deals: [
        {
          id: "seed1",
          title: "全聯週末蔬果 85 折",
          store: "全聯",
          description: "週六日全店蔬果 85 折，會員另享紅利雙倍。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 12,
        },
        {
          id: "seed2",
          title: "星巴克買一送一",
          store: "星巴克",
          description: "週三 14:00-20:00 大杯指定飲品買一送一。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 24,
        },
      ],
      points: 0,
      pointHistory: [],
      notificationsEnabled: true,
      budgetAlertEnabled: true,

      login: (email, nickname) =>
        set({
          user: {
            id: uid(),
            email,
            nickname: nickname || email.split("@")[0],
            avatar: "🌿",
          },
        }),
      logout: () => set({ user: null }),
      updateProfile: (data) =>
        set((s) => (s.user ? { user: { ...s.user, ...data } } : s)),

      setWeeklyBudget: (amount) => set({ weeklyBudget: amount }),

      addTransaction: (t) =>
        set((s) => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] })),
      updateTransaction: (id, t) =>
        set((s) => ({
          transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addGoal: (g) => set((s) => ({ goals: [{ ...g, id: uid() }, ...s.goals] })),
      updateGoal: (id, g) =>
        set((s) => ({ goals: s.goals.map((x) => (x.id === id ? { ...x, ...g } : x)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((x) => x.id !== id) })),

      addDeal: (d) => {
        const { user } = get();
        set((s) => ({
          deals: [
            {
              ...d,
              id: uid(),
              createdAt: new Date().toISOString(),
              likes: 0,
              authorId: user?.id || "anon",
              authorName: user?.nickname || "匿名",
            },
            ...s.deals,
          ],
        }));
        // 分享優惠 +20 積分
        get().addPoints(20, `分享優惠：${d.title}`);
      },
      updateDeal: (id, d) =>
        set((s) => ({ deals: s.deals.map((x) => (x.id === id ? { ...x, ...d } : x)) })),
      deleteDeal: (id) => set((s) => ({ deals: s.deals.filter((x) => x.id !== id) })),
      likeDeal: (id) =>
        set((s) => ({
          deals: s.deals.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)),
        })),

      addPoints: (amount, reason) =>
        set((s) => ({
          points: Math.max(0, s.points + amount),
          pointHistory: [
            { id: uid(), amount, reason, date: new Date().toISOString() },
            ...s.pointHistory,
          ],
        })),
      redeemPoints: (amount, reason) => {
        const { points } = get();
        if (points < amount) return false;
        set((s) => ({
          points: s.points - amount,
          pointHistory: [
            { id: uid(), amount: -amount, reason, date: new Date().toISOString() },
            ...s.pointHistory,
          ],
        }));
        return true;
      },

      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      toggleBudgetAlert: () =>
        set((s) => ({ budgetAlertEnabled: !s.budgetAlertEnabled })),
    }),
    { name: "money-app-store" }
  )
);

// helpers
export function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 sun
  const diff = day === 0 ? -6 : 1 - day; // monday start
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}
