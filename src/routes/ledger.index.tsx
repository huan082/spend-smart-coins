import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, X, CalendarDays, List, Sparkles, ChevronRight } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ledger/")({
  component: LedgerPage,
  head: () => ({ meta: [{ title: "記帳" }] }),
});

function LedgerPage() {
  const { transactions, deleteTransaction, autoTxnLogs, autoTxnEnabled } = useAppStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const pendingAuto = autoTxnLogs.filter((l) => !l.imported).length;

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

  // 行事曆模式：當日交易與每日金額映射
  const dayTotals = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const k = format(new Date(t.date), "yyyy-MM-dd");
      const cur = map.get(k) || { income: 0, expense: 0 };
      if (t.type === "expense") cur.expense += t.amount;
      else cur.income += t.amount;
      map.set(k, cur);
    });
    return map;
  }, [transactions]);

  const dayItems = selectedDate
    ? transactions.filter((t) => isSameDay(new Date(t.date), selectedDate))
    : [];

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
        {/* 自動記帳待確認入口 */}
        {(autoTxnEnabled || pendingAuto > 0) && (
          <Link
            to="/auto-ledger"
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-cool/40 border border-tertiary/30 shadow-soft"
          >
            <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">自動記帳明細確認</p>
              <p className="text-[11px] text-muted-foreground">
                {pendingAuto > 0 ? `有 ${pendingAuto} 筆待確認匯入` : "檢視已自動同步的消費"}
              </p>
            </div>
            {pendingAuto > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {pendingAuto}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        )}

        {/* 切換 列表 / 行事曆 */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-2xl">
          {([
            { k: "list" as const, l: "列表", icon: List },
            { k: "calendar" as const, l: "行事曆", icon: CalendarDays },
          ]).map(({ k, l, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${
                view === k ? "bg-card shadow-soft" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {l}
            </button>
          ))}
        </div>

        {view === "calendar" && (
          <>
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("p-2 pointer-events-auto")}
                modifiers={{
                  hasTxn: (d) => dayTotals.has(format(d, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  hasTxn: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
                }}
              />
            </div>
            {selectedDate && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold">
                    {format(selectedDate, "yyyy / MM / dd EEE")}
                  </span>
                  {(() => {
                    const d = dayTotals.get(format(selectedDate, "yyyy-MM-dd"));
                    if (!d) return <span className="text-xs text-muted-foreground">無紀錄</span>;
                    return (
                      <span className="text-xs">
                        {d.income > 0 && <span className="text-success font-bold mr-2">+${d.income}</span>}
                        {d.expense > 0 && <span className="text-destructive font-bold">-${d.expense}</span>}
                      </span>
                    );
                  })()}
                </div>
                {dayItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    這天還沒有紀錄
                  </div>
                ) : (
                  dayItems.map((t) => (
                    <TxnRow key={t.id} t={t} onDelete={() => confirm("確定刪除？") && deleteTransaction(t.id)} />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {view === "list" && (
          <>
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
          </>
        )}
      </div>
    </AppLayout>
  );
}

function TxnRow({ t, onDelete }: { t: ReturnType<typeof useAppStore.getState>["transactions"][number]; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-soft">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
        t.type === "expense" ? "bg-secondary" : "bg-primary-soft"
      }`}>
        {t.type === "expense" ? "🛒" : "💰"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {t.category}{t.store ? ` · ${t.store}` : ""}
        </p>
        <p className="text-xs text-muted-foreground truncate">{t.note || "—"}</p>
      </div>
      <span className={`font-display font-bold text-sm ${
        t.type === "expense" ? "text-foreground" : "text-success"
      }`}>
        {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString()}
      </span>
      <div className="flex flex-col gap-1">
        <Link to="/ledger/edit/$id" params={{ id: t.id }} className="p-1 text-muted-foreground">
          <Pencil className="w-3.5 h-3.5" />
        </Link>
        <button onClick={onDelete} className="p-1 text-muted-foreground">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
