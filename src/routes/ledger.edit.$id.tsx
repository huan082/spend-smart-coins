import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/ledger/edit/$id")({
  component: EditTxn,
  head: () => ({ meta: [{ title: "編輯記帳" }] }),
});

function EditTxn() {
  const { id } = Route.useParams();
  const txn = useAppStore((s) => s.transactions.find((t) => t.id === id));
  const update = useAppStore((s) => s.updateTransaction);
  const navigate = useNavigate();

  const [amount, setAmount] = useState(txn?.amount.toString() || "");
  const [category, setCategory] = useState(txn?.category || "");
  const [note, setNote] = useState(txn?.note || "");
  const [date, setDate] = useState(
    txn?.date.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );

  if (!txn) {
    return (
      <AppLayout title="找不到記錄" back="/ledger">
        <div className="p-8 text-center text-muted-foreground">這筆記錄已被刪除</div>
      </AppLayout>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update(id, {
      amount: Number(amount),
      category,
      note,
      date: new Date(date).toISOString(),
    });
    navigate({ to: "/ledger" });
  };

  return (
    <AppLayout title="編輯記錄" back="/ledger">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">金額</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none font-display font-bold text-xl"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">分類</p>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">備註</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
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
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
        >
          更新
        </button>
      </form>
    </AppLayout>
  );
}
