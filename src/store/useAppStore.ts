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
  type: "mobile_barcode";
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

// 從各家店家官網「爬蟲」取得的優惠（demo：寫死資料 + 可手動重新整理）
export interface ScrapedDeal {
  id: string;
  store: string;
  title: string;
  description: string;
  url?: string;
  address: string;
  lat: number;
  lng: number;
  source: string; // 例：全聯官網
  fetchedAt: string;
}

export type AppTheme = "morandi" | "ocean" | "sakura" | "midnight" | "forest";
export type AppMode = "normal" | "savage" | "gentle" | "cheer" | "zen";

interface AppState {
  hasHydrated: boolean;
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

  // 好康地圖：爬蟲取得的店家優惠
  scrapedDeals: ScrapedDeal[];
  scrapedFetchedAt: string | null;

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

  // 爬蟲
  refreshScrapedDeals: () => Promise<void>;

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
  setHasHydrated: (value: boolean) => void;
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

// 從各家店家官網「爬蟲」取得的優惠（demo seed）
const SEED_SCRAPED_DEALS: ScrapedDeal[] = [
  {
    id: "sc_pxmart_1",
    store: "全聯",
    title: "週末蔬果 85 折",
    description: "週六日全店蔬果 85 折，PX Pay 結帳再回饋 1%。",
    url: "https://www.pxmart.com.tw/",
    address: "高雄市岡山區岡山路 100 號",
    lat: 22.7980,
    lng: 120.2950,
    source: "全聯實業 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_pxmart_2",
    store: "全聯",
    title: "御茶園 任 2 件 8 折",
    description: "指定茶飲品任 2 件 8 折，限週間。",
    url: "https://www.pxmart.com.tw/",
    address: "高雄市楠梓區楠梓路 220 號",
    lat: 22.7300,
    lng: 120.3050,
    source: "全聯實業 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_711_1",
    store: "7-11",
    title: "City Cafe 第二杯半價",
    description: "整周大杯美式、拿鐵第二杯半價。",
    url: "https://www.7-11.com.tw/",
    address: "高雄市燕巢區義大路 8 號",
    lat: 22.7400,
    lng: 120.3700,
    source: "7-ELEVEN 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_711_2",
    store: "7-11",
    title: "鮮食 39 元起",
    description: "指定御飯糰、三明治 39 元起，OPEN POINT 加碼集點。",
    url: "https://www.7-11.com.tw/",
    address: "高雄市大社區中山路 50 號",
    lat: 22.7300,
    lng: 120.3450,
    source: "7-ELEVEN 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_familymart_1",
    store: "全家",
    title: "鮮食買 2 送 1",
    description: "指定鮮食、便當買 2 送 1，App 出示載具。",
    url: "https://www.family.com.tw/",
    address: "高雄市岡山區介壽西路 60 號",
    lat: 22.7950,
    lng: 120.2880,
    source: "全家便利商店 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_familymart_2",
    store: "全家",
    title: "Let's Café 大杯 49 元",
    description: "週四限定 大杯拿鐵 49 元。",
    url: "https://www.family.com.tw/",
    address: "高雄市楠梓區土庫路 120 號",
    lat: 22.7250,
    lng: 120.3000,
    source: "全家便利商店 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_hilife_1",
    store: "萊爾富",
    title: "Hi-Café 中杯拿鐵 39 元",
    description: "Hi 點折抵更划算。",
    url: "https://www.hilife.com.tw/",
    address: "高雄市燕巢區安招路 200 號",
    lat: 22.7920,
    lng: 120.3600,
    source: "萊爾富 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_starbucks_1",
    store: "星巴克",
    title: "週三買一送一",
    description: "週三 14:00-20:00 大杯指定飲品買一送一。",
    url: "https://www.starbucks.com.tw/",
    address: "高雄市岡山區岡燕路 18 號",
    lat: 22.7880,
    lng: 120.3200,
    source: "星巴克 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_mcd_1",
    store: "麥當勞",
    title: "甜心卡優惠",
    description: "出示甜心卡享指定餐點優惠。",
    url: "https://www.mcdonalds.com/tw/",
    address: "高雄市大社區三民路 150 號",
    lat: 22.7280,
    lng: 120.3500,
    source: "麥當勞 官網",
    fetchedAt: new Date().toISOString(),
  },
  {
    id: "sc_watsons_1",
    store: "屈臣氏",
    title: "寵 i 會員第二件 6 折",
    description: "指定保養品、口罩第二件 6 折，e 點雙倍累積。",
    url: "https://www.watsons.com.tw/",
    address: "高雄市楠梓區後昌路 300 號",
    lat: 22.7200,
    lng: 120.3100,
    source: "屈臣氏 官網",
    fetchedAt: new Date().toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
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
        {
          id: "post6",
          title: "Netflix 學生方案 75 折",
          store: "Netflix",
          description: "持有效學生證即可申請，每月省下一杯飲料錢。",
          authorId: "system",
          authorName: "追劇魂",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
          likes: 22,
        },
        {
          id: "post7",
          title: "屈臣氏寵 i 會員第二件 6 折",
          store: "屈臣氏",
          description: "指定保養品、面膜第二件 6 折，e 點還可折抵現金。",
          authorId: "system",
          authorName: "保養女孩",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          likes: 11,
        },
        {
          id: "post8",
          title: "Klook 9 月旅遊金折扣碼 SEP300",
          store: "Klook",
          description: "輸入折扣碼滿 3000 折 300，國內景點門票通用。",
          url: "https://www.klook.com",
          authorId: "system",
          authorName: "旅遊控",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(),
          likes: 38,
        },
        {
          id: "post9",
          title: "Costco 會員日 指定商品折 200",
          store: "Costco",
          description: "週末出示會員卡，家電、生鮮指定品項立折 200。",
          authorId: "system",
          authorName: "省錢主婦",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
          likes: 19,
        },
        {
          id: "post10",
          title: "PChome 24h 滿千免運",
          store: "PChome",
          description: "結帳滿千免運，加碼領券再折 50。",
          url: "https://24h.pchome.com.tw",
          authorId: "system",
          authorName: "宅配狂",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
          likes: 13,
        },
        {
          id: "post_local_1",
          title: "巷口手搖第二杯半價",
          store: "可不可熟成紅茶",
          description: "下午 2-5 點同品項第二杯半價，限店內購買。",
          authorId: "system",
          authorName: "在地吃貨",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          likes: 17,
          address: "台北市大安區忠孝東路三段 251 號",
          lat: 25.0419,
          lng: 121.5430,
        },
        {
          id: "post_local_2",
          title: "晚餐時段牛肉麵 9 折",
          store: "林東芳牛肉麵",
          description: "晚上 7 點後到店出示貼文，全桌 9 折。",
          authorId: "system",
          authorName: "美食團長",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          likes: 9,
          address: "台北市中山區八德路二段 274 號",
          lat: 25.0470,
          lng: 121.5400,
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

      scrapedDeals: SEED_SCRAPED_DEALS,
      scrapedFetchedAt: new Date().toISOString(),

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

      setHasHydrated: (value) => set({ hasHydrated: value }),

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

      refreshScrapedDeals: async () => {
        // demo：模擬「爬蟲」延遲 + 重新整理時間戳，每次微調筆數
        await new Promise((r) => setTimeout(r, 700));
        const shuffled = [...SEED_SCRAPED_DEALS]
          .sort(() => Math.random() - 0.5)
          .map((d) => ({ ...d, fetchedAt: new Date().toISOString() }));
        set({ scrapedDeals: shuffled, scrapedFetchedAt: new Date().toISOString() });
      },
    }),
    {
      name: "money-app-store",
      partialize: (state) => {
        const { hasHydrated, setHasHydrated, ...persistedState } = state;
        return persistedState;
      },
      onRehydrateStorage: (state) => () => {
        state.setHasHydrated(true);
      },
    }
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
