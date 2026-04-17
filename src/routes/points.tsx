import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { format } from "date-fns";
import { Gift, Lock } from "lucide-react";

export const Route = createFileRoute("/points")({
  component: PointsPage,
  head: () => ({ meta: [{ title: "積分管理" }] }),
});

function PointsPage() {
  const { points, pointHistory, weeklyBudget } = useAppStore();
  if (weeklyBudget === 0) {
    return (
      <AppLayout title="積分管理" back="/me">
        <div className="px-5 py-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-muted flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-lg mb-2">尚未解鎖</p>
          <p className="text-sm text-muted-foreground mb-5">請先設定週預算</p>
          <Link to="/budget" className="inline-block px-6 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold">
            前往設定
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="積分管理" back="/me">
      <div className="px-5 py-4 space-y-4">
        <div className="rounded-3xl bg-gradient-coin p-6 text-center shadow-card">
          <p className="text-sm opacity-80">總積分</p>
          <p className="font-display font-extrabold text-5xl mt-1">🪙 {points}</p>
          <Link
            to="/redeem"
            className="inline-flex items-center gap-1 mt-4 px-5 py-2.5 rounded-full bg-card font-bold text-sm shadow-soft"
          >
            <Gift className="w-4 h-4" /> 立即兌換
          </Link>
        </div>

        <div>
          <p className="font-display font-bold text-base mb-3 px-1">獲取與兌換紀錄</p>
          <div className="space-y-2">
            {pointHistory.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-3xl mb-2">📜</p>
                <p className="text-sm">還沒有任何紀錄</p>
              </div>
            )}
            {pointHistory.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-soft"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    p.amount > 0 ? "bg-coin/20" : "bg-secondary"
                  }`}
                >
                  {p.amount > 0 ? "🎁" : "💎"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.reason}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(p.date), "MM/dd HH:mm")}
                  </p>
                </div>
                <span
                  className={`font-display font-bold ${
                    p.amount > 0 ? "text-success" : "text-foreground"
                  }`}
                >
                  {p.amount > 0 ? "+" : ""}{p.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
