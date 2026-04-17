import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, type Bill } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Trash2, Pencil, Receipt, X } from "lucide-react";

export const Route = createFileRoute("/bills")({
  component: BillsPage,
  head: () => ({ meta: [{ title: "固定帳單管理" }] }),
});

function BillsPage() {
  const { bills, addBill, updateBill, deleteBill } = useAppStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Bill | null>(null);
  const [showForm, setShowForm] = useState(false);

  const total = bills.filter((b) => b.enabled).reduce((s, b) => s + b.amount, 0);

  return (
    <AppLayout
      title="固定帳單"
      back="/me"
      right={
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> 新增
        </button>
      }
    >
      <div className="px-5 py-4 space-y-3">
        <div className="rounded-3xl bg-gradient-cool/40 p-5 shadow-card">
          <p className="text-xs text-muted-foreground">每月固定支出總計</p>
          <p className="font-display font-extrabold text-3xl mt-1">
            ${total.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            共 {bills.filter((b) => b.enabled).length} 筆已開啟
          </p>
        </div>

        {bills.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">還沒有固定帳單</p>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              新增第一筆
            </button>
          </div>
        )}

        {bills.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft"
          >
            <div className="w-10 h-10 rounded-xl bg-tertiary/40 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground">
                每月 {b.dueDay} 號 · ${b.amount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => updateBill(b.id, { enabled: !b.enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                b.enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${
                  b.enabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <button
              onClick={() => {
                setEditing(b);
                setShowForm(true);
              }}
              className="p-1.5 text-muted-foreground"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => confirm(`刪除「${b.name}」？`) && deleteBill(b.id)}
              className="p-1.5 text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate({ to: "/settings" })}
          className="w-full py-3 text-sm text-muted-foreground"
        >
          ← 回到設定
        </button>
      </div>

      {showForm && (
        <BillForm
          bill={editing}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editing) updateBill(editing.id, data);
            else addBill({ ...data, enabled: true });
            setShowForm(false);
          }}
        />
      )}
    </AppLayout>
  );
}

function BillForm({
  bill,
  onClose,
  onSave,
}: {
  bill: Bill | null;
  onClose: () => void;
  onSave: (b: Omit<Bill, "id">) => void;
}) {
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount.toString() || "");
  const [dueDay, setDueDay] = useState(bill?.dueDay.toString() || "1");
  const [enabled] = useState(bill?.enabled ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDay) return;
    onSave({
      name,
      amount: Number(amount),
      dueDay: Math.max(1, Math.min(31, Number(dueDay))),
      enabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-card rounded-3xl p-5 space-y-4 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">
            {bill ? "編輯帳單" : "新增固定帳單"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">帳單名稱</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：電信費、房租、Netflix"
            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none text-sm"
            required
          />
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">金額</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="599"
            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none text-sm"
            required
          />
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">每月扣款日</p>
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold"
        >
          {bill ? "更新" : "新增"}
        </button>
      </form>
    </div>
  );
}
