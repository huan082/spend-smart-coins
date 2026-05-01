import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/goals/new")({
  component: NewGoal,
  head: () => ({ meta: [{ title: "新增目標" }] }),
});

function NewGoal() {
  const add = useAppStore((s) => s.addGoal);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [notify, setNotify] = useState(true);
  const [priority, setPriority] = useState<"need" | "want">("want");
  const [category, setCategory] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    const targetNum = Number(target);
    add({
      name,
      targetAmount: targetNum,
      saved: Number(saved) || 0,
      deadline: deadline || undefined,
      productUrl: url || undefined,
      currentPrice: url ? targetNum : undefined,
      originalPrice: url ? targetNum : undefined,
      notifyOnDrop: notify,
      priority,
      category: category || undefined,
    });
    navigate({ to: "/goals" });
  };

  return (
    <AppLayout title="新增目標" back="/goals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <Field label="目標名稱">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：新手機、日本旅行"
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="目標金額">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm font-bold"
              required
            />
          </Field>
          <Field label="已存金額">
            <input
              type="number"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm font-bold"
            />
          </Field>
        </div>
        <Field label="目標日期（選填）">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </Field>

        <Field label="優先順序">
          <div className="flex gap-2">
            {([
              { v: "need" as const, l: "必要", emoji: "✅" },
              { v: "want" as const, l: "想要", emoji: "💖" },
            ]).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setPriority(o.v)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold border ${
                  priority === o.v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {o.emoji} {o.l}
              </button>
            ))}
          </div>
        </Field>

        <Field label="分類（選填）">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：旅遊、3C、教育、儲蓄"
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </Field>

        <div className="rounded-2xl bg-tertiary/20 border border-tertiary/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <p className="font-bold text-sm">網購商品價格監控</p>
          </div>
          <p className="text-xs text-muted-foreground">
            貼上蝦皮 / momo / PChome 商品網址，降價時自動通知
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://shopee.tw/..."
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border outline-none text-sm"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            降價時通知我
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
        >
          建立目標
        </button>
      </form>
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
