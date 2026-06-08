import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getWeekRange, getMonthRange } from "@/store/useAppStore";
import { useEffect, useState, useMemo } from "react";
import { Sparkles, AlertCircle, Bell } from "lucide-react";

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
  head: () => ({ meta: [{ title: "預算管理" }] }),
});

function BudgetPage() {
  const {
    weeklyBudget, setWeeklyBudget, transactions, addPoints,
    expenseCategories, categoryBudgets, setCategoryBudget,
    budgetAlertThreshold, setBudgetAlertThreshold,
    budgetAlertEnabled, toggleBudgetAlert,
  } = useAppStore();
  const [input, setInput] = useState(weeklyBudget ? weeklyBudget.toString() : "");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setInput(weeklyBudget ? weeklyBudget.toString() : "");
  }, [weeklyBudget]);

  const { start: ws, end: we } = getWeekRange();
  const { start: ms, end: me } = getMonthRange();

  const weekSpent = useMemo(
    () =>
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === "expense" && d >= ws && d < we;
        })
        .reduce((s, t) => s + t.amount, 0),
    [transactions, ws, we]
  );

  const monthSpent = useMemo(
    () =>
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === "expense" && d >= ms && d < me;
        })
        .reduce((s, t) => s + t.amount, 0),
    [transactions, ms, me]
  );

  // 月底結算：總週預算 = 週預算 * 4
  const monthlyBudget = weeklyBudget * 4;
  const monthDiff = monthlyBudget - monthSpent;
  const projectedPoints = monthDiff > 0 ? Math.floor(monthDiff / 100) * 10 : 0;

  const save = () => {
    const v = Number(input);
    if (v > 0) {
      setWeeklyBudget(v);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    }
  };

  const settle = () => {
    if (projectedPoints > 0) {
      addPoints(projectedPoints, `月結獎勵 (餘 $${monthDiff})`);
      alert(`恭喜！獲得 ${projectedPoints} 積分 🎉`);
    } else {
      alert("這個月超支了，下個月加油！💪");
    }
  };

  const overBudget = weeklyBudget > 0 && weekSpent > weeklyBudget;
  const pct = weeklyBudget > 0 ? Math.min(100, (weekSpent / weeklyBudget) * 100) : 0;

  // 各類別本週支出
  const categorySpent = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (t.type === "expense" && d >= ws && d < we) {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    });
    return map;
  }, [transactions, ws, we]);

  return (
    <AppLayout title="預算管理" back="/home">
      <div className="px-5 py-4 space-y-5">
        {!weeklyBudget && (
          <div className="p-4 rounded-2xl bg-accent/30 border border-accent/40 flex gap-3">
            <Sparkles className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">設定週預算解鎖完整功能</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                設定後即可使用積分與兌換系統
              </p>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-card border border-border shadow-card p-5">
          <p className="text-xs font-bold text-muted-foreground mb-2">週預算金額</p>
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground">NT$</span>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入金額"
              className="flex-1 font-display font-extrabold text-3xl bg-transparent outline-none"
            />
          </div>
          <button
            onClick={save}
            className="w-full mt-4 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-soft"
          >
            {savedAt ? "已儲存 ✓" : weeklyBudget ? "更新預算" : "設定並解鎖"}
          </button>
        </div>

        {weeklyBudget > 0 && (
          <>
            <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
              <div className="flex justify-between items-baseline mb-3">
                <p className="font-bold">本週使用情況</p>
                <span className={`text-sm font-bold ${overBudget ? "text-destructive" : "text-success"}`}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    overBudget ? "bg-destructive" : "bg-gradient-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>已花 ${weekSpent.toLocaleString()}</span>
                <span>剩餘 ${(weeklyBudget - weekSpent).toLocaleString()}</span>
              </div>
              {overBudget && (
                <div className="mt-3 flex gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>已超出本週預算！注意控制支出 🌧️</span>
                </div>
              )}
            </div>

            {/* === 預算超支警告設定 === */}
            <div className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">預算超支警告</p>
                  <p className="text-[11px] text-muted-foreground">
                    達到設定百分比時通知你
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleBudgetAlert}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    budgetAlertEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${
                      budgetAlertEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              {budgetAlertEnabled && (
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">觸發門檻</span>
                    <span className="font-bold text-primary">{budgetAlertThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={5}
                    value={budgetAlertThreshold}
                    onChange={(e) => setBudgetAlertThreshold(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>50%</span>
                    <span>80%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* === 各類別預算 === */}
            <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
              <p className="font-bold mb-1">各類別週預算</p>
              <p className="text-[11px] text-muted-foreground mb-3">
                空白即不設限，超過會在這裡顯示警告
              </p>
              <div className="space-y-3">
                {expenseCategories.map((c) => {
                  const spent = categorySpent.get(c.name) || 0;
                  const limit = categoryBudgets[c.name] || 0;
                  const cpct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
                  const over = limit > 0 && spent > limit;
                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.emoji}</span>
                        <span className="text-sm font-medium flex-1">{c.name}</span>
                        <span className="text-xs text-muted-foreground">已花 ${spent}</span>
                        <input
                          type="number"
                          value={limit || ""}
                          onChange={(e) => setCategoryBudget(c.name, Number(e.target.value) || 0)}
                          placeholder="—"
                          className="w-20 px-2 py-1 rounded-lg bg-muted border border-border outline-none text-sm text-right"
                        />
                      </div>
                      {limit > 0 && (
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${over ? "bg-destructive" : "bg-gradient-primary"}`}
                            style={{ width: `${cpct}%` }}
                          />
                        </div>
                      )}
                      {over && (
                        <p className="text-[10px] text-destructive font-bold">
                          ⚠️ 已超出 ${spent - limit}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-warm/40 border border-accent/30 p-5">
              <p className="font-bold mb-3">本月結算預覽</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">月預算（週 × 4）</span>
                  <span className="font-bold">${monthlyBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">本月已花</span>
                  <span className="font-bold">${monthSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="font-bold">結餘</span>
                  <span
                    className={`font-display font-extrabold ${
                      monthDiff > 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {monthDiff > 0 ? "+" : ""}${monthDiff.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-2xl bg-card/80 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">預估獲得積分</p>
                  <p className="font-display font-extrabold text-2xl text-coin">
                    🪙 {projectedPoints}
                  </p>
                </div>
                <button
                  onClick={settle}
                  className="px-4 py-2.5 rounded-xl bg-coin text-coin-foreground font-bold text-sm shadow-soft"
                >
                  立即結算
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 px-1">
                規則：每結餘 100 元 = 10 積分
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
