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
  priority?: "need" | "want"; // 必要 / 想要
  category?: string; // 例如 旅遊、3C、教育...
  photo?: string; // base64
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
  gender?: "male" | "female" | "other" | "";
  birthday?: string; // YYYY-MM-DD
  phone?: string;
  monthlyIncome?: number;
  savingTarget?: number;
  bio?: string;
}

export interface CarrierLink {
  id: string;
  type: "mobile_barcode" | "easycard" | "credit_card";
  label: string;
  account: string; // 載具號碼 / 卡號末四碼
  enabled: boolean; // 是否啟用自動記帳
  linkedAt: string;
}

export interface AutoTxnLog {
  id: string;
  source: string; // 載具名稱
  amount: number;
  store: string;
  category: string;
  date: string;
  imported: boolean; // 是否已匯入記帳
}

export type AppTheme = "morandi" | "ocean" | "sakura" | "midnight" | "forest";
export type AppMode = "normal" | "savage" | "gentle" | "cheer" | "zen";

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

  // 各類別週預算
  categoryBudgets: Record<string, number>;
  // 預算超支警告觸發百分比 (e.g. 80 = 80%)
  budgetAlertThreshold: number;

  // settings
  budgetAlertEnabled: boolean;
  ledgerReminderEnabled: boolean;
  ledgerReminderTime: string; // HH:mm
  goalDropAlertEnabled: boolean;
  dealRecommendEnabled: boolean;
  abnormalSpendAlertEnabled: boolean;
  billReminderEnabled: boolean;
  biometricEnabled: boolean;

  // 連動 / 自動記帳
  carriers: CarrierLink[];
  autoTxnEnabled: boolean;
  autoTxnLogs: AutoTxnLog[];

  // 收藏優惠 & 主題
  favoriteDealIds: string[];
  favoriteStores: string[];
  ownedThemes: AppTheme[];
  ownedModes: AppMode[];
  ownedAvatars: string[];
  currentTheme: AppTheme;
  currentMode: AppMode;

  // auth
  login: (email: string, nickname?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  // 連動 / 自動記帳
  addCarrier: (c: Omit<CarrierLink, "id" | "linkedAt">) => void;
  updateCarrier: (id: string, c: Partial<CarrierLink>) => void;
  removeCarrier: (id: string) => void;
  toggleAutoTxn: () => void;
  importAutoTxn: (id: string) => void;
  ignoreAutoTxn: (id: string) => void;
  simulateAutoTxn: () => void;

  // 收藏 & 主題
  toggleFavoriteDeal: (id: string) => void;
  toggleFavoriteStore: (name: string) => void;
  setTheme: (t: AppTheme) => void;
  setMode: (m: AppMode) => void;
  unlockTheme: (t: AppTheme) => void;
  unlockMode: (m: AppMode) => void;
  unlockAvatar: (a: string) => void;

  setWeeklyBudget: (amount: number) => void;
  setCategoryBudget: (category: string, amount: number) => void;
  setBudgetAlertThreshold: (pct: number) => void;
  toggleBiometric: () => void;

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
        // ===== 優惠貼文（社群分享） =====
        {
          id: "post1",
          title: "蝦皮 11.11 跨店滿千折百",
          store: "蝦皮",
          description: "全站跨店滿 1000 折 100，再加碼運費補助，記得先領券！",
          url: "https://shopee.tw",
          authorId: "system",
          authorName: "省錢達人 Annie",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes: 42,
        },
        {
          id: "post2",
          title: "Uniqlo 感謝祭 全館 9 折",
          store: "Uniqlo",
          description: "限時三天，加入會員再享生日禮 100 元。換季衣物超划算。",
          authorId: "system",
          authorName: "穿搭小編",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          likes: 31,
        },
        {
          id: "post3",
          title: "誠品書店會員日 9 折",
          store: "誠品",
          description: "每月最後一個週四，全館書籍 9 折，文具 95 折。",
          authorId: "system",
          authorName: "閱讀控",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          likes: 18,
        },
        {
          id: "post4",
          title: "momo 中元購物節",
          store: "momo",
          description: "指定 3C 折 1500，家電下殺 5 折，刷指定信用卡再 9 折。",
          url: "https://www.momoshop.com.tw",
          authorId: "system",
          authorName: "家電哥",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
          likes: 27,
        },
        {
          id: "post5",
          title: "瓦城慶生月 89 折",
          store: "瓦城",
          description: "壽星本人到店出示證件，當月用餐全桌 89 折！",
          authorId: "system",
          authorName: "美食情報",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          likes: 15,
        },

        // ===== 好康地圖（實體店家位置） =====
        {
          id: "map_pxmart",
          title: "全聯週末蔬果 85 折",
          store: "全聯",
          description: "週六日全店蔬果 85 折，會員 PX Pay 結帳再享回饋。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 12,
          lat: 25.0478,
          lng: 121.5319,
          address: "台北市中正區忠孝西路一段 49 號",
        },
        {
          id: "map_711",
          title: "7-11 City Cafe 第二杯半價",
          store: "7-11",
          description: "整周大杯美式、拿鐵第二杯半價，OPEN POINT 會員加碼集點。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 33,
          lat: 25.0455,
          lng: 121.5170,
          address: "台北市中正區館前路 6 號",
        },
        {
          id: "map_familymart",
          title: "全家鮮食買 2 送 1",
          store: "全家",
          description: "指定鮮食、飯糰、便當買 2 送 1，限會員 App 出示載具。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 21,
          lat: 25.0421,
          lng: 121.5360,
          address: "台北市大安區忠孝東路四段 55 號",
        },
        {
          id: "map_hilife",
          title: "萊爾富指定飲料 39 元",
          store: "萊爾富",
          description: "Hi-Café 中杯拿鐵 39 元起，搭配 Hi 點折抵更划算。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 9,
          lat: 25.0510,
          lng: 121.5280,
          address: "台北市中山區南京西路 18 號",
        },
        {
          id: "map_starbucks",
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
          id: "map_mcd",
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
        {
          id: "map_watsons",
          title: "屈臣氏寵 i 會員雙倍 e 點",
          store: "屈臣氏",
          description: "指定保養品、口罩第二件 6 折，會員 e 點雙倍累積。",
          authorId: "system",
          authorName: "小編",
          createdAt: new Date().toISOString(),
          likes: 14,
          lat: 25.0392,
          lng: 121.5500,
          address: "台北市大安區敦化南路一段 200 號",
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

      categoryBudgets: {},
      budgetAlertThreshold: 80,

      budgetAlertEnabled: true,
      ledgerReminderEnabled: true,
      ledgerReminderTime: "20:00",
      goalDropAlertEnabled: true,
      dealRecommendEnabled: true,
      abnormalSpendAlertEnabled: true,
      billReminderEnabled: true,
      biometricEnabled: false,

      carriers: [],
      autoTxnEnabled: false,
      autoTxnLogs: [],

      favoriteDealIds: [],
      favoriteStores: [],
      ownedThemes: ["morandi"],
      ownedModes: ["normal"],
      ownedAvatars: ["🌿", "🌸", "🌻", "🍃", "🌙", "⭐", "🐱", "🐰", "🦊", "🐻", "🍀", "☁️"],
      currentTheme: "morandi",
      currentMode: "normal",

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
      setCategoryBudget: (category, amount) =>
        set((s) => {
          const next = { ...s.categoryBudgets };
          if (amount > 0) next[category] = amount;
          else delete next[category];
          return { categoryBudgets: next };
        }),
      setBudgetAlertThreshold: (pct) =>
        set({ budgetAlertThreshold: Math.max(0, Math.min(100, pct)) }),
      toggleBiometric: () => set((s) => ({ biometricEnabled: !s.biometricEnabled })),

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

      // 連動 / 自動記帳
      addCarrier: (c) =>
        set((s) => ({
          carriers: [
            { ...c, id: uid(), linkedAt: new Date().toISOString() },
            ...s.carriers,
          ],
        })),
      updateCarrier: (id, c) =>
        set((s) => ({
          carriers: s.carriers.map((x) => (x.id === id ? { ...x, ...c } : x)),
        })),
      removeCarrier: (id) =>
        set((s) => ({ carriers: s.carriers.filter((x) => x.id !== id) })),
      toggleAutoTxn: () => set((s) => ({ autoTxnEnabled: !s.autoTxnEnabled })),
      importAutoTxn: (id) => {
        const log = get().autoTxnLogs.find((l) => l.id === id);
        if (!log) return;
        get().addTransaction({
          type: "expense",
          amount: log.amount,
          category: log.category,
          store: log.store,
          note: `[自動] ${log.source}`,
          date: log.date,
        });
        set((s) => ({
          autoTxnLogs: s.autoTxnLogs.map((l) =>
            l.id === id ? { ...l, imported: true } : l
          ),
        }));
      },
      ignoreAutoTxn: (id) =>
        set((s) => ({ autoTxnLogs: s.autoTxnLogs.filter((l) => l.id !== id) })),
      simulateAutoTxn: () => {
        const samples = [
          { store: "全聯", category: "餐飲", amount: 245 },
          { store: "7-11", category: "餐飲", amount: 89 },
          { store: "星巴克", category: "餐飲", amount: 165 },
          { store: "蝦皮", category: "購物", amount: 590 },
          { store: "麥當勞", category: "餐飲", amount: 130 },
        ];
        const carriers = get().carriers.filter((c) => c.enabled);
        const source = carriers[0]?.label || "手機載具";
        const pick = samples[Math.floor(Math.random() * samples.length)];
        set((s) => ({
          autoTxnLogs: [
            {
              id: uid(),
              source,
              ...pick,
              date: new Date().toISOString(),
              imported: false,
            },
            ...s.autoTxnLogs,
          ],
        }));
      },

      // 收藏 & 主題
      toggleFavoriteDeal: (id) =>
        set((s) => ({
          favoriteDealIds: s.favoriteDealIds.includes(id)
            ? s.favoriteDealIds.filter((x) => x !== id)
            : [...s.favoriteDealIds, id],
        })),
      toggleFavoriteStore: (name) =>
        set((s) => ({
          favoriteStores: s.favoriteStores.includes(name)
            ? s.favoriteStores.filter((x) => x !== name)
            : [...s.favoriteStores, name],
        })),
      setTheme: (t) => set({ currentTheme: t }),
      setMode: (m) => set({ currentMode: m }),
      unlockTheme: (t) =>
        set((s) =>
          s.ownedThemes.includes(t) ? s : { ownedThemes: [...s.ownedThemes, t] }
        ),
      unlockMode: (m) =>
        set((s) =>
          s.ownedModes.includes(m) ? s : { ownedModes: [...s.ownedModes, m] }
        ),
      unlockAvatar: (a) =>
        set((s) =>
          s.ownedAvatars.includes(a) ? s : { ownedAvatars: [...s.ownedAvatars, a] }
        ),

      clearAllData: () =>
        set({
          transactions: [],
          goals: [],
          points: 0,
          pointHistory: [],
          weeklyBudget: 0,
          categoryBudgets: {},
          expenseCategories: DEFAULT_EXPENSE_CATS,
          incomeCategories: DEFAULT_INCOME_CATS,
          stores: DEFAULT_STORES,
          bills: [],
          carriers: [],
          autoTxnLogs: [],
          favoriteDealIds: [],
          favoriteStores: [],
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
