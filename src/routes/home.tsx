import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getWeekRange, getMonthRange } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Lock, TrendingUp, Sparkles, Plus, Target, Tag, Wallet } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "首頁 — 金錢規劃" }] }),
});

function HomePage() {
  const { user, weeklyBudget, transactions, points, goals } = useAppStore();
  const { start: ws, end: we } = getWeekRange();
  const { start: ms, end: me } = getMonthRange();

  const weekSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= ws && d < we;
    })
    .reduce((s, t) => s + t.amount, 0);

  const monthSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= ms && d < me;
    })
    .reduce((s, t) => s + t.amount, 0);

  const remaining = weeklyBudget - weekSpent;
  const pct = weeklyBudget > 0 ? Math.min(100, (weekSpent / weeklyBudget) * 100) : 0;
  const budgetSet = weeklyBudget > 0;

  return (
    <AppLayout title={`嗨，${user?.nickname} ${user?.avatar}`}>
      <div className="px-5 py-4 space-y-5 pb-6">
        {/* Budget Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl bg-gradient-primary p-5 shadow-card text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-10 bottom-0 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-xs opacity-90 mb-1">本週預算剩餘</p>
            {budgetSet ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-extrabold">
                    NT$ {remaining.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs mt-2 opacity-90">
                  已花 NT$ {weekSpent.toLocaleString()} / {weeklyBudget.toLocaleString()}
                </p>
              </>
            ) : (
              <Link
                to="/budget"
                className="block mt-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur text-center font-bold text-sm"
              >
                + 設定週預算解鎖積分功能
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/points"
            className={`rounded-2xl p-4 shadow-soft border border-border/60 ${
              budgetSet ? "bg-gradient-coin" : "bg-muted"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{budgetSet ? "🪙" : "🔒"}</span>
              {!budgetSet && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">我的積分</p>
            <p className="font-display font-extrabold text-xl">
              {budgetSet ? points : "—"}
            </p>
          </Link>

          <div className="rounded-2xl p-4 shadow-soft border border-border/60 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📊</span>
              <TrendingUp className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">本月支出</p>
            <p className="font-display font-extrabold text-xl">
              ${monthSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-display font-bold text-base mb-3 px-1">快速操作</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { to: "/ledger/new", icon: Plus, label: "記一筆", color: "bg-primary-soft text-primary" },
              { to: "/budget", icon: Wallet, label: "預算", color: "bg-tertiary/50 text-tertiary-foreground" },
              { to: "/goals", icon: Target, label: "目標", color: "bg-accent/50 text-accent-foreground" },
              { to: "/deals", icon: Tag, label: "優惠", color: "bg-highlight/50 text-highlight-foreground" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border/60 shadow-soft"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-bold text-base">最近記錄</h2>
            <Link to="/ledger" className="text-xs text-primary font-medium">
              查看全部
            </Link>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-soft"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    t.type === "expense" ? "bg-secondary" : "bg-primary-soft"
                  }`}
                >
                  {t.type === "expense" ? "🛒" : "💰"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.category}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.note || "—"}
                  </p>
                </div>
                <span
                  className={`font-display font-bold text-sm ${
                    t.type === "expense" ? "text-foreground" : "text-success"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <Link
                to="/ledger/new"
                className="block py-8 text-center rounded-2xl border-2 border-dashed border-border text-muted-foreground"
              >
                <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-60" />
                <p className="text-sm">還沒有記錄，開始記第一筆吧</p>
              </Link>
            )}
          </div>
        </div>

        {/* Goals preview */}
        {goals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-display font-bold text-base">進行中的目標</h2>
              <Link to="/goals" className="text-xs text-primary font-medium">
                查看全部
              </Link>
            </div>
            <div className="space-y-2">
              {goals.slice(0, 2).map((g) => {
                const p = Math.min(100, (g.saved / g.targetAmount) * 100);
                return (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{g.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(p)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
