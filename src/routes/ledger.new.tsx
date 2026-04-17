import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/ledger/new")({
  component: NewTxn,
  head: () => ({ meta: [{ title: "新增記帳" }] }),
});

const expenseCats = [
  { k: "餐飲", e: "🍱" },
  { k: "交通", e: "🚌" },
  { k: "購物", e: "🛍️" },
  { k: "娛樂", e: "🎮" },
  { k: "居家", e: "🏠" },
  { k: "醫療", e: "💊" },
  { k: "教育", e: "📚" },
  { k: "其他", e: "🌿" },
];
const incomeCats = [
  { k: "薪資", e: "💼" },
  { k: "獎金", e: "🎁" },
  { k: "投資", e: "📈" },
  { k: "其他", e: "✨" },
];

function NewTxn() {
  const add = useAppStore((s) => s.addTransaction);
  const navigate = useNavigate();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐飲");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const cats = type === "expense" ? expenseCats : incomeCats;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    add({
      type,
      amount: Number(amount),
      category,
      note,
      date: new Date(date).toISOString(),
    });
    navigate({ to: "/ledger" });
  };

  return (
    <AppLayout title="新增記錄" back="/ledger">
      <form onSubmit={submit} className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory(t === "expense" ? "餐飲" : "薪資");
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === t
                  ? t === "expense"
                    ? "bg-card text-foreground shadow-soft"
                    : "bg-card text-success shadow-soft"
                  : "text-muted-foreground"
              }`}
            >
              {t === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        <div className="text-center py-4">
          <span className="text-muted-foreground text-sm">NT$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center font-display text-5xl font-extrabold bg-transparent outline-none mt-1"
            autoFocus
          />
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">分類</p>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button
                key={c.k}
                type="button"
                onClick={() => setCategory(c.k)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${
                  category === c.k
                    ? "bg-primary-soft border-primary"
                    : "bg-card border-border"
                }`}
              >
                <span className="text-xl">{c.e}</span>
                <span className="text-xs">{c.k}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">日期</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">備註</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="加點筆記..."
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
        >
          儲存
        </button>
      </form>
    </AppLayout>
  );
}
