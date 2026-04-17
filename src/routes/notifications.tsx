import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getWeekRange } from "@/store/useAppStore";
import { Bell, AlertCircle, TrendingDown, Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "通知" }] }),
});

function NotificationsPage() {
  const { weeklyBudget, transactions, goals, notificationsEnabled } = useAppStore();
  const { start: ws, end: we } = getWeekRange();
  const weekSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= ws && d < we;
    })
    .reduce((s, t) => s + t.amount, 0);

  const notifs: { icon: any; color: string; title: string; desc: string; time: string }[] = [];

  if (weeklyBudget > 0 && weekSpent > weeklyBudget * 0.8) {
    notifs.push({
      icon: AlertCircle,
      color: "text-destructive bg-destructive/15",
      title: "預算警告",
      desc: `本週已花費 ${Math.round((weekSpent / weeklyBudget) * 100)}%，請注意！`,
      time: "剛剛",
    });
  }

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

  notifs.push(
    {
      icon: Calendar,
      color: "text-primary bg-primary-soft",
      title: "別忘了今天記帳",
      desc: "養成每日記錄好習慣 🌱",
      time: "今天 20:00",
    },
    {
      icon: Sparkles,
      color: "text-accent-foreground bg-accent/40",
      title: "個人化優惠推薦",
      desc: "根據你常去的商家，發現新優惠",
      time: "1 小時前",
    },
    {
      icon: Bell,
      color: "text-tertiary-foreground bg-tertiary/40",
      title: "固定帳單提醒",
      desc: "電信費將於 3 天後扣款",
      time: "昨天",
    }
  );

  return (
    <AppLayout title="通知" back="/me">
      <div className="px-5 py-4 space-y-2">
        {!notificationsEnabled && (
          <div className="p-3 rounded-2xl bg-muted text-sm text-muted-foreground text-center">
            通知已關閉，可至設定開啟
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
    </AppLayout>
  );
}
