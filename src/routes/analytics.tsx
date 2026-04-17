import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getMonthRange } from "@/store/useAppStore";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, Store, PieChart as PieIcon } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "消費習慣分析" }] }),
});

const COLORS = ["#A8B89F", "#D4B5A8", "#9DB4C0", "#C9B8D4", "#E8C9A0", "#B8C5A8", "#D4A5A5", "#A5B8C9"];

function AnalyticsPage() {
  const { transactions } = useAppStore();
  const [range, setRange] = useState<"month" | "3months">("month");

  const { start, end } = useMemo(() => {
    if (range === "month") return getMonthRange();
    const e = endOfMonth(new Date());
    const s = startOfMonth(subMonths(new Date(), 2));
    return { start: s, end: e };
  }, [range]);

  const inRange = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end && t.type === "expense";
  });

  // 分類佔比
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [inRange]);

  // 店家排行
  const byStore = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((t) => {
      if (t.store) map.set(t.store, (map.get(t.store) || 0) + t.amount);
    });
    return Array.from(map, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [inRange]);

  // 近 3 月趨勢
  const trend = useMemo(() => {
    const months: { month: string; expense: number; income: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const expense = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return td >= ms && td <= me && t.type === "expense";
        })
        .reduce((s, t) => s + t.amount, 0);
      const income = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return td >= ms && td <= me && t.type === "income";
        })
        .reduce((s, t) => s + t.amount, 0);
      months.push({ month: format(d, "M月"), expense, income });
    }
    return months;
  }, [transactions]);

  const total = byCategory.reduce((s, x) => s + x.value, 0);

  return (
    <AppLayout title="消費習慣分析" back="/home">
      <div className="px-5 py-4 space-y-4">
        {/* 區間切換 */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          {(["month", "3months"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`py-2 rounded-xl text-sm font-bold transition-all ${
                range === r ? "bg-card shadow-soft" : "text-muted-foreground"
              }`}
            >
              {r === "month" ? "本月" : "近三月"}
            </button>
          ))}
        </div>

        {/* 總覽 */}
        <div className="rounded-3xl bg-gradient-cool/40 p-5 shadow-card">
          <p className="text-xs text-muted-foreground">期間總支出</p>
          <p className="font-display font-extrabold text-3xl mt-1">
            ${total.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{inRange.length} 筆消費</p>
        </div>

        {/* 分類佔比圓餅 */}
        <Card title="分類佔比" icon={PieIcon}>
          {byCategory.length === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {byCategory.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {Math.round((c.value / total) * 100)}%
                    </span>
                    <span className="font-bold">${c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* 店家排行 */}
        <Card title="常去店家排行" icon={Store}>
          {byStore.length === 0 ? (
            <Empty hint="記帳時選擇店家就能看到排行哦" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={byStore} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                    contentStyle={{ borderRadius: 12, border: "none" }}
                  />
                  <Bar dataKey="value" fill="#A8B89F" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 6 月趨勢 */}
        <Card title="近 6 月收支趨勢" icon={TrendingUp}>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString()}`}
                  contentStyle={{ borderRadius: 12, border: "none" }}
                />
                <Line type="monotone" dataKey="expense" stroke="#D4A5A5" strokeWidth={2.5} dot={{ r: 4 }} name="支出" />
                <Line type="monotone" dataKey="income" stroke="#A8B89F" strokeWidth={2.5} dot={{ r: 4 }} name="收入" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-display font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ hint }: { hint?: string }) {
  return (
    <div className="py-10 text-center text-muted-foreground text-sm">
      <p>還沒有資料</p>
      {hint && <p className="text-xs mt-1">{hint}</p>}
    </div>
  );
}
