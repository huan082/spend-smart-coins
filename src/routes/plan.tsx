import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Wallet, Target, ChevronRight, Plus } from "lucide-react";
import { useAppStore, getWeekRange } from "@/store/useAppStore";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
  head: () => ({ meta: [{ title: "預算&目標" }] }),
});

type Tab = "budget" | "goals";

function PlanPage() {
  const { weeklyBudget, transactions, goals, deleteGoal } = useAppStore();
  const [tab, setTab] = useState<Tab>("budget");

  const { start: ws, end: we } = getWeekRange();
  const weekSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= ws && d < we;
    })
    .reduce((s, t) => s + t.amount, 0);
  const pct = weeklyBudget > 0 ? Math.min(100, (weekSpent / weeklyBudget) * 100) : 0;
  const remaining = weeklyBudget - weekSpent;
  const over = weeklyBudget > 0 && weekSpent > weeklyBudget;

  return (
    <AppLayout
      title="預算 & 目標"
      right={
        tab === "goals" ? (
          <Link
            to="/goals/new"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
          >
            <Plus className="w-4 h-4" /> 新目標
          </Link>
        ) : (
          <Link
            to="/budget"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
          >
            管理
          </Link>
        )
      }
    >
      <div className="px-5 py-4 space-y-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-2xl">
          {([
            { k: "budget" as const, l: "週預算", I: Wallet },
            { k: "goals" as const, l: "目標規劃", I: Target },
          ]).map(({ k, l, I }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold ${
                tab === k ? "bg-card shadow-soft" : "text-muted-foreground"
              }`}
            >
              <I className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>

        {tab === "budget" && (
          <>
            {weeklyBudget === 0 ? (
              <div className="rounded-3xl bg-gradient-warm/40 border border-accent/30 p-6 text-center">
                <p className="text-3xl mb-2">💰</p>
                <p className="font-bold mb-1">尚未設定週預算</p>
                <p className="text-xs text-muted-foreground mb-4">
                  設定後即可使用積分與兌換系統
                </p>
                <Link
                  to="/budget"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card text-sm"
                >
                  立即設定
                </Link>
              </div>
            ) : (
              <Link
                to="/budget"
                className="block rounded-3xl bg-gradient-primary p-5 shadow-card text-primary-foreground relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="relative">
                  <p className="text-xs opacity-90 mb-1">本週剩餘</p>
                  <p className="font-display font-extrabold text-3xl">
                    NT$ {remaining.toLocaleString()}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? "bg-destructive" : "bg-white"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-2 opacity-90">
                    已花 ${weekSpent.toLocaleString()} / {weeklyBudget.toLocaleString()}
                  </p>
                </div>
              </Link>
            )}

            <Link
              to="/budget"
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-soft"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">預算管理</p>
                <p className="text-[11px] text-muted-foreground">
                  總預算、各類別預算、超支警告、月結算
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </>
        )}

        {tab === "goals" && (
          <>
            {goals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-5xl mb-3">🎯</p>
                <p className="font-bold mb-1">還沒有目標</p>
                <p className="text-sm text-muted-foreground mb-5">
                  設定一個夢想，開始存錢吧
                </p>
                <Link
                  to="/goals/new"
                  className="inline-block px-6 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
                >
                  建立第一個目標
                </Link>
              </div>
            ) : (
              <Link
                to="/goals"
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-soft"
              >
                <div className="w-11 h-11 rounded-xl bg-tertiary/50 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">目標規劃</p>
                  <p className="text-[11px] text-muted-foreground">
                    儲蓄目標、商品價格監控、降價通知
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}

            {goals.slice(0, 5).map((g) => {
              const t = g.currentPrice && g.currentPrice > 0 ? g.currentPrice : g.targetAmount;
              const p = Math.min(100, (g.saved / t) * 100);
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-card border border-border/60 shadow-soft"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-display font-bold">{g.name}</p>
                    <Link
                      to="/goals/edit/$id"
                      params={{ id: g.id }}
                      className="text-xs text-primary font-medium"
                    >
                      編輯
                    </Link>
                  </div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                      ${g.saved.toLocaleString()} / ${t.toLocaleString()}
                    </span>
                    <span className="font-bold text-primary">{Math.round(p)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </AppLayout>
  );
}