import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TxnType = "expense" | "income";
export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  category: string;
  store?: string;
  note: string;
  photo?: string; // base64 data URL
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
  photo?: string; // base64 data URL
  lat?: number;
  lng?: number;
  address?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
}

export interface PointEntry {
  id: string;
  reason: string;
  amount: number;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  enabled: boolean;
  category?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
}

interface AppState {
  user: User | null;
  weeklyBudget: number;
  transactions: Transaction[];
  goals: Goal[];
  deals: Deal[];
  points: number;
  pointHistory: PointEntry[];

  // categories & stores (user-customizable)
  expenseCategories: { name: string; emoji: string }[];
  incomeCategories: { name: string; emoji: string }[];
  stores: string[];
  bills: Bill[];

  // settings
  budgetAlertEnabled: boolean;
  ledgerReminderEnabled: boolean;
  ledgerReminderTime: string; // HH:mm
  goalDropAlertEnabled: boolean;
  dealRecommendEnabled: boolean;
  abnormalSpendAlertEnabled: boolean;
  billReminderEnabled: boolean;

  // auth
  login: (email: string, nickname?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "nickname" | "avatar">>) => void;

  setWeeklyBudget: (amount: number) => void;

  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addDeal: (d: Omit<Deal, "id" | "createdAt" | "likes" | "authorId" | "authorName">) => void;
  updateDeal: (id: string, d: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  likeDeal: (id: string) => void;

  addPoints: (amount: number, reason: string) => void;
  redeemPoints: (amount: number, reason: string) => boolean;

  // categories / stores
  addExpenseCategory: (name: string, emoji?: string) => void;
  removeExpenseCategory: (name: string) => void;
  addIncomeCategory: (name: string, emoji?: string) => void;
  removeIncomeCategory: (name: string) => void;
  addStore: (name: string) => void;
  removeStore: (name: string) => void;

  // bills
  addBill: (b: Omit<Bill, "id">) => void;
  updateBill: (id: string, b: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // settings toggles
  toggleBudgetAlert: () => void;
  toggleLedgerReminder: () => void;
  setLedgerReminderTime: (t: string) => void;
  toggleGoalDropAlert: () => void;
  toggleDealRecommend: () => void;
  toggleAbnormalSpendAlert: () => void;
  toggleBillReminder: () => void;

  // data management
  clearAllData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_EXPENSE_CATS = [
  { name: "餐飲", emoji: "🍱" },
  { name: "交通", emoji: "🚌" },
  { name: "購物", emoji: "🛍️" },
  { name: "娛樂", emoji: "🎮" },
  { name: "居家", emoji: "🏠" },
  { name: "醫療", emoji: "💊" },
  { name: "教育", emoji: "📚" },
  { name: "其他", emoji: "🌿" },
];
const DEFAULT_INCOME_CATS = [
  { name: "薪資", emoji: "💼" },
  { name: "獎金", emoji: "🎁" },
  { name: "投資", emoji: "📈" },
  { name: "其他", emoji: "✨" },
];
const DEFAULT_STORES = ["全聯", "7-11", "全家", "星巴克", "麥當勞", "蝦皮", "momo"];

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
          lat: 25.0478,
          lng: 121.5319,
          address: "台北市中正區忠孝西路一段 49 號",
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
          lat: 25.0418,
          lng: 121.5450,
          address: "台北市信義區市府路 45 號",
        },
        {
          id: "seed3",
          title: "麥當勞甜心卡",
          store: "麥當勞",
          description: "出示甜心卡享指定餐點優惠。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 8,
          lat: 25.0330,
          lng: 121.5654,
          address: "台北市信義區松壽路 12 號",
        },
      ],
      points: 0,
      pointHistory: [],

      expenseCategories: DEFAULT_EXPENSE_CATS,
      incomeCategories: DEFAULT_INCOME_CATS,
      stores: DEFAULT_STORES,
      bills: [
        { id: "b1", name: "電信費", amount: 599, dueDay: 10, enabled: true, category: "居家" },
        { id: "b2", name: "電費", amount: 1200, dueDay: 25, enabled: true, category: "居家" },
      ],

      budgetAlertEnabled: true,
      ledgerReminderEnabled: true,
      ledgerReminderTime: "20:00",
      goalDropAlertEnabled: true,
      dealRecommendEnabled: true,
      abnormalSpendAlertEnabled: true,
      billReminderEnabled: true,

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

      addExpenseCategory: (name, emoji = "🌿") =>
        set((s) =>
          s.expenseCategories.some((c) => c.name === name)
            ? s
            : { expenseCategories: [...s.expenseCategories, { name, emoji }] }
        ),
      removeExpenseCategory: (name) =>
        set((s) => ({ expenseCategories: s.expenseCategories.filter((c) => c.name !== name) })),
      addIncomeCategory: (name, emoji = "✨") =>
        set((s) =>
          s.incomeCategories.some((c) => c.name === name)
            ? s
            : { incomeCategories: [...s.incomeCategories, { name, emoji }] }
        ),
      removeIncomeCategory: (name) =>
        set((s) => ({ incomeCategories: s.incomeCategories.filter((c) => c.name !== name) })),
      addStore: (name) =>
        set((s) => (s.stores.includes(name) ? s : { stores: [...s.stores, name] })),
      removeStore: (name) =>
        set((s) => ({ stores: s.stores.filter((x) => x !== name) })),

      addBill: (b) => set((s) => ({ bills: [{ ...b, id: uid() }, ...s.bills] })),
      updateBill: (id, b) =>
        set((s) => ({ bills: s.bills.map((x) => (x.id === id ? { ...x, ...b } : x)) })),
      deleteBill: (id) => set((s) => ({ bills: s.bills.filter((x) => x.id !== id) })),

      toggleBudgetAlert: () => set((s) => ({ budgetAlertEnabled: !s.budgetAlertEnabled })),
      toggleLedgerReminder: () =>
        set((s) => ({ ledgerReminderEnabled: !s.ledgerReminderEnabled })),
      setLedgerReminderTime: (t) => set({ ledgerReminderTime: t }),
      toggleGoalDropAlert: () =>
        set((s) => ({ goalDropAlertEnabled: !s.goalDropAlertEnabled })),
      toggleDealRecommend: () =>
        set((s) => ({ dealRecommendEnabled: !s.dealRecommendEnabled })),
      toggleAbnormalSpendAlert: () =>
        set((s) => ({ abnormalSpendAlertEnabled: !s.abnormalSpendAlertEnabled })),
      toggleBillReminder: () =>
        set((s) => ({ billReminderEnabled: !s.billReminderEnabled })),

      clearAllData: () =>
        set({
          transactions: [],
          goals: [],
          points: 0,
          pointHistory: [],
          weeklyBudget: 0,
          expenseCategories: DEFAULT_EXPENSE_CATS,
          incomeCategories: DEFAULT_INCOME_CATS,
          stores: DEFAULT_STORES,
          bills: [],
        }),
    }),
    { name: "money-app-store" }
  )
);

// helpers
export function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
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

// 取得本月待繳帳單（dueDay 還沒到的 enabled 帳單）
export function getUpcomingBills(bills: Bill[], today = new Date()) {
  const day = today.getDate();
  return bills
    .filter((b) => b.enabled && b.dueDay >= day)
    .sort((a, b) => a.dueDay - b.dueDay);
}
