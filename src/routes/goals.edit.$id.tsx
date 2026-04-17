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
  const [url, setUrl] = useState(goal?.productUrl || "");

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
      productUrl: url || undefined,
    });
    navigate({ to: "/goals" });
  };

  return (
    <AppLayout title="編輯目標" back="/goals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">目標名稱</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 px-1">目標金額</p>
            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm font-bold" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 px-1">已存</p>
            <input type="number" value={saved} onChange={(e) => setSaved(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm font-bold" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">商品網址（選填）</p>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm" />
        </div>
        <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card">
          更新
        </button>
      </form>
    </AppLayout>
  );
}
