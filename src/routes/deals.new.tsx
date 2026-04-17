import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/deals/new")({
  component: NewDeal,
  head: () => ({ meta: [{ title: "分享優惠" }] }),
});

function NewDeal() {
  const add = useAppStore((s) => s.addDeal);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !store || !description) return;
    add({ title, store, description, url: url || undefined });
    navigate({ to: "/deals" });
  };

  return (
    <AppLayout title="分享優惠" back="/deals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <div className="p-3 rounded-2xl bg-coin/15 text-center">
          <p className="text-sm">
            🎉 分享後可獲得 <span className="font-bold text-coin">+20 積分</span>
          </p>
        </div>

        <Field label="商家">
          <input value={store} onChange={(e) => setStore(e.target.value)} placeholder="例如：星巴克、全聯" className="input" required />
        </Field>
        <Field label="優惠標題">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：買一送一" className="input" required />
        </Field>
        <Field label="詳細說明">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="活動時間、條件..." rows={4} className="input resize-none" required />
        </Field>
        <Field label="連結（選填）">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="input" />
        </Field>

        <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card">
          發布並獲得積分
        </button>
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
