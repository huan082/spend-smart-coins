import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/redeem")({
  component: RedeemPage,
  head: () => ({ meta: [{ title: "積分兌換" }] }),
});

const REWARDS = [
  { id: "r1", name: "全聯 50 元禮券", cost: 200, emoji: "🛒" },
  { id: "r2", name: "星巴克飲料券", cost: 350, emoji: "☕" },
  { id: "r3", name: "7-11 100 元禮券", cost: 400, emoji: "🏪" },
  { id: "r4", name: "蝦皮 100 元折扣碼", cost: 450, emoji: "🛍️" },
  { id: "r5", name: "電影票一張", cost: 800, emoji: "🎬" },
  { id: "r6", name: "外送 200 元抵用", cost: 900, emoji: "🍱" },
];

function RedeemPage() {
  const { points, redeemPoints, weeklyBudget } = useAppStore();

  if (weeklyBudget === 0) {
    return (
      <AppLayout title="積分兌換" back="/me">
        <div className="px-5 py-12 text-center">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold mb-2">請先設定週預算解鎖</p>
          <Link to="/budget" className="inline-block mt-3 px-6 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold">
            前往設定
          </Link>
        </div>
      </AppLayout>
    );
  }

  const redeem = (r: typeof REWARDS[0]) => {
    if (!confirm(`確定花 ${r.cost} 積分兌換 ${r.name}？`)) return;
    if (redeemPoints(r.cost, `兌換：${r.name}`)) {
      alert(`兌換成功！🎉 ${r.name}`);
    } else {
      alert("積分不足");
    }
  };

  return (
    <AppLayout title="積分兌換" back="/points">
      <div className="px-5 py-4 space-y-4">
        <div className="rounded-2xl bg-coin/15 p-3 text-center">
          <p className="text-xs text-muted-foreground">可用積分</p>
          <p className="font-display font-extrabold text-2xl text-coin">🪙 {points}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {REWARDS.map((r) => {
            const can = points >= r.cost;
            return (
              <button
                key={r.id}
                onClick={() => can && redeem(r)}
                disabled={!can}
                className={`p-4 rounded-2xl border text-left shadow-soft transition-all ${
                  can
                    ? "bg-card border-border hover:shadow-card active:scale-95"
                    : "bg-muted border-transparent opacity-60"
                }`}
              >
                <p className="text-3xl mb-2">{r.emoji}</p>
                <p className="font-bold text-sm leading-snug">{r.name}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-coin font-display font-extrabold">
                    🪙 {r.cost}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
