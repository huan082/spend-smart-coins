import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/goals/")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "目標規劃" }] }),
});

const SHOPS = ["蝦皮", "momo", "PChome"];
function detectShop(url: string) {
  const u = url.toLowerCase();
  if (u.includes("shopee")) return "蝦皮";
  if (u.includes("momoshop") || u.includes("momo")) return "momo";
  if (u.includes("pchome")) return "PChome";
  return null;
}

function GoalsPage() {
  const { goals, deleteGoal, updateGoal } = useAppStore();

  // 模擬降價：點按鈕讓價格 -10%
  const simulateDrop = (id: string, current: number) => {
    const newPrice = Math.round(current * 0.9);
    updateGoal(id, { currentPrice: newPrice });
    alert(`🔔 模擬降價通知：價格降至 NT$ ${newPrice.toLocaleString()}！`);
  };

  return (
    <AppLayout
      title="目標規劃"
      right={
        <Link
          to="/goals/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> 新增
        </Link>
      }
    >
      <div className="px-5 py-4 space-y-3">
        {goals.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-5xl mb-3">🎯</p>
            <p className="font-bold mb-1">還沒有目標</p>
            <p className="text-sm text-muted-foreground mb-5">設定一個夢想，開始存錢吧</p>
            <Link
              to="/goals/new"
              className="inline-block px-6 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
            >
              建立第一個目標
            </Link>
          </div>
        )}

        {goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.targetAmount) * 100);
          const dropped =
            g.originalPrice && g.currentPrice && g.currentPrice < g.originalPrice;
          return (
            <div
              key={g.id}
              className="p-4 rounded-3xl bg-card border border-border/60 shadow-soft"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold">{g.name}</p>
                  {g.deadline && (
                    <p className="text-xs text-muted-foreground">
                      目標日 {g.deadline}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Link
                    to="/goals/edit/$id"
                    params={{ id: g.id }}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => confirm("刪除目標？") && deleteGoal(g.id)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">
                  ${g.saved.toLocaleString()} / ${g.targetAmount.toLocaleString()}
                </span>
                <span className="font-bold text-primary">{Math.round(pct)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {g.productUrl && (
                <div className="mt-3 p-3 rounded-2xl bg-tertiary/20 border border-tertiary/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">🔗</span>
                      <span className="text-xs font-bold">
                        {detectShop(g.productUrl) || "商品"} 價格監控
                      </span>
                    </div>
                    <a
                      href={g.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary flex items-center gap-1"
                    >
                      開啟 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {g.currentPrice != null && (
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display font-extrabold text-lg">
                        ${g.currentPrice.toLocaleString()}
                      </span>
                      {g.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${g.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {dropped && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-bold flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          降價中
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      simulateDrop(g.id, g.currentPrice || g.targetAmount)
                    }
                    className="mt-2 w-full text-xs py-1.5 rounded-lg bg-card border border-border text-muted-foreground"
                  >
                    🔄 模擬一次價格更新
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
