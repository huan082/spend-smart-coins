import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getWeekRange, getUpcomingBills } from "@/store/useAppStore";
import {
  Bell, AlertCircle, TrendingDown, Calendar, Sparkles, Receipt,
  AlertTriangle, Clock, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "通知與提醒" }] }),
});

function NotificationsPage() {
  const {
    weeklyBudget, transactions, goals, bills,
    budgetAlertEnabled, toggleBudgetAlert,
    ledgerReminderEnabled, toggleLedgerReminder,
    ledgerReminderTime, setLedgerReminderTime,
    goalDropAlertEnabled, toggleGoalDropAlert,
    dealRecommendEnabled, toggleDealRecommend,
    abnormalSpendAlertEnabled, toggleAbnormalSpendAlert,
    billReminderEnabled, toggleBillReminder,
  } = useAppStore();
  const navigate = useNavigate();

  const { start: ws, end: we } = getWeekRange();
  const weekSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= ws && d < we;
    })
    .reduce((s, t) => s + t.amount, 0);

  const notifs: { icon: any; color: string; title: string; desc: string; time: string }[] = [];

  if (budgetAlertEnabled && weeklyBudget > 0 && weekSpent > weeklyBudget * 0.8) {
    notifs.push({
      icon: AlertCircle,
      color: "text-destructive bg-destructive/15",
      title: "預算警告",
      desc: `本週已花費 ${Math.round((weekSpent / weeklyBudget) * 100)}%，請注意！`,
      time: "剛剛",
    });
  }

  if (goalDropAlertEnabled) {
    goals.forEach((g) => {
      if (g.originalPrice && g.currentPrice && g.currentPrice < g.originalPrice) {
        notifs.push({
          icon: TrendingDown,
          color: "text-success bg-success/15",
          title: "目標商品降價了！",
          desc: `${g.name} 從 $${g.originalPrice} 降到 $${g.currentPrice}`,
          time: "5 分鐘前",
        });
      }
    });
  }

  if (ledgerReminderEnabled) {
    notifs.push({
      icon: Calendar,
      color: "text-primary bg-primary-soft",
      title: "別忘了今天記帳",
      desc: `養成每日記錄好習慣 🌱（提醒時間 ${ledgerReminderTime}）`,
      time: `今天 ${ledgerReminderTime}`,
    });
  }

  if (dealRecommendEnabled) {
    notifs.push({
      icon: Sparkles,
      color: "text-accent-foreground bg-accent/40",
      title: "個人化優惠推薦",
      desc: "根據你常去的商家，發現新優惠",
      time: "1 小時前",
    });
  }

  if (billReminderEnabled) {
    const upcoming = getUpcomingBills(bills);
    upcoming.slice(0, 3).forEach((b) => {
      const today = new Date().getDate();
      const days = b.dueDay - today;
      notifs.push({
        icon: Receipt,
        color: "text-tertiary-foreground bg-tertiary/40",
        title: `固定帳單提醒：${b.name}`,
        desc: `$${b.amount.toLocaleString()} 將於 ${days === 0 ? "今天" : `${days} 天後`}（每月 ${b.dueDay} 號）扣款`,
        time: days <= 1 ? "今天" : `${days} 天前提醒`,
      });
    });
  }

  return (
    <AppLayout title="通知與提醒" back="/me">
      <div className="px-5 py-4 space-y-4">
        {/* === 最新通知 === */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">最新通知</p>
          <div className="space-y-2">
            {notifs.length === 0 && (
              <div className="py-10 text-center text-muted-foreground rounded-2xl bg-card border border-border/60">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">目前沒有通知</p>
              </div>
            )}
            {notifs.map((n, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <n.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold text-sm">{n.title}</p>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === 提醒設定 === */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">提醒設定</p>
          <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
            <Toggle icon={AlertTriangle} label="預算超支提醒" checked={budgetAlertEnabled} onChange={toggleBudgetAlert} />

            <div className="px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="flex-1 text-sm font-medium">定時記帳提醒</span>
                <SwitchBtn checked={ledgerReminderEnabled} onChange={toggleLedgerReminder} />
              </div>
              {ledgerReminderEnabled && (
                <div className="mt-3 ml-12 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">提醒時間</span>
                  <input
                    type="time"
                    value={ledgerReminderTime}
                    onChange={(e) => setLedgerReminderTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-muted border border-border outline-none text-sm"
                  />
                </div>
              )}
            </div>

            <Toggle icon={TrendingDown} label="目標商品降價提醒" checked={goalDropAlertEnabled} onChange={toggleGoalDropAlert} />
            <Toggle icon={Sparkles} label="個人化優惠推播" checked={dealRecommendEnabled} onChange={toggleDealRecommend} />
            <Toggle icon={AlertTriangle} label="異常消費偵測" checked={abnormalSpendAlertEnabled} onChange={toggleAbnormalSpendAlert} />

            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="flex-1 text-sm font-medium">固定帳單提醒</span>
                <SwitchBtn checked={billReminderEnabled} onChange={toggleBillReminder} />
              </div>
              <button
                onClick={() => navigate({ to: "/bills" })}
                className="mt-3 ml-12 text-xs text-primary font-medium flex items-center gap-1"
              >
                管理我的固定帳單 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SwitchBtn({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Toggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <SwitchBtn checked={checked} onChange={onChange} />
    </label>
  );
}
