import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/goals/edit/$id")({
  component: EditGoal,
  head: () => ({ meta: [{ title: "編輯目標" }] }),
});

function EditGoal() {
  const { id } = Route.useParams();
  const goal = useAppStore((s) => s.goals.find((g) => g.id === id));
  const update = useAppStore((s) => s.updateGoal);
  const navigate = useNavigate();

  const [name, setName] = useState(goal?.name || "");
  const [target, setTarget] = useState(goal?.targetAmount.toString() || "");
  const [saved, setSaved] = useState(goal?.saved.toString() || "0");
  const [deadline, setDeadline] = useState(goal?.deadline || "");
  const [url, setUrl] = useState(goal?.productUrl || "");
  const [category, setCategory] = useState(goal?.category || "");
  const [currentPrice, setCurrentPrice] = useState(goal?.currentPrice?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(goal?.originalPrice?.toString() || "");
  const [notify, setNotify] = useState(goal?.notifyOnDrop ?? true);

  if (!goal) {
    return (
      <AppLayout title="找不到目標" back="/goals">
        <div className="p-8 text-center text-muted-foreground">目標已被刪除</div>
      </AppLayout>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update(id, {
      name,
      targetAmount: Number(target),
      saved: Number(saved),
      deadline: deadline || undefined,
      productUrl: url || undefined,
      category: category || undefined,
      currentPrice: currentPrice ? Number(currentPrice) : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      notifyOnDrop: notify,
    });
    navigate({ to: "/goals" });
  };

  return (
    <AppLayout title="編輯目標" back="/goals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <Field label="目標名稱"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="目標金額"><input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="input font-bold" /></Field>
          <Field label="已存"><input type="number" value={saved} onChange={(e) => setSaved(e.target.value)} className="input font-bold" /></Field>
        </div>
        <Field label="目標日期"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" /></Field>
        <Field label="分類"><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="旅遊 / 3C / 教育..." className="input" /></Field>
        <Field label="商品網址"><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="目前價格"><input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="input" /></Field>
          <Field label="原始價格"><input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="input" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="w-4 h-4 accent-primary" />
          降價時通知我
        </label>
        <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card">更新</button>
      </form>
      <style>{`.input{width:100%;padding:.75rem 1rem;border-radius:1rem;background:var(--card);border:1px solid var(--border);outline:none;font-size:.875rem}`}</style>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 px-1">{label}</p>
      {children}
    </div>
  );
}
