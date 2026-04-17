import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/ledger/")({
  component: LedgerPage,
  head: () => ({ meta: [{ title: "記帳" }] }),
});

function LedgerPage() {
  const { transactions, deleteTransaction } = useAppStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");

  const list = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (q && !t.category.includes(q) && !t.note.includes(q)) return false;
    return true;
  });

  const grouped = list.reduce<Record<string, typeof list>>((acc, t) => {
    const k = format(new Date(t.date), "yyyy-MM-dd");
    (acc[k] ||= []).push(t);
    return acc;
  }, {});

  return (
    <AppLayout
      title="記帳"
      right={
        <Link
          to="/ledger/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> 新增
        </Link>
      }
    >
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋分類或備註"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-card border border-border outline-none text-sm shadow-soft"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(["all", "expense", "income"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {k === "all" ? "全部" : k === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        {Object.entries(grouped).map(([date, items]) => {
          const dayTotal = items.reduce(
            (s, t) => s + (t.type === "expense" ? -t.amount : t.amount),
            0
          );
          return (
            <div key={date}>
              <div className="flex justify-between items-center px-1 mb-2 mt-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(new Date(date), "MM / dd EEE")}
                </span>
                <span
                  className={`text-xs font-bold ${
                    dayTotal >= 0 ? "text-success" : "text-foreground"
                  }`}
                >
                  {dayTotal >= 0 ? "+" : ""}${dayTotal.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-soft group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        t.type === "expense" ? "bg-secondary" : "bg-primary-soft"
                      }`}
                    >
                      {t.type === "expense" ? "🛒" : "💰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {t.category}{t.store ? ` · ${t.store}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {t.photo && <span>📷</span>}
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
                    <div className="flex flex-col gap-1">
                      <Link
                        to="/ledger/edit/$id"
                        params={{ id: t.id }}
                        className="p-1 rounded text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("確定刪除這筆記錄？")) deleteTransaction(t.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm">沒有符合的記錄</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
