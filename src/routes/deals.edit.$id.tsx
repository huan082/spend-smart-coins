import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/deals/edit/$id")({
  component: EditDeal,
});

function EditDeal() {
  const { id } = Route.useParams();
  const deal = useAppStore((s) => s.deals.find((d) => d.id === id));
  const update = useAppStore((s) => s.updateDeal);
  const navigate = useNavigate();
  const [title, setTitle] = useState(deal?.title || "");
  const [store, setStore] = useState(deal?.store || "");
  const [description, setDescription] = useState(deal?.description || "");
  const [url, setUrl] = useState(deal?.url || "");

  if (!deal) {
    return (
      <AppLayout title="找不到優惠" back="/deals">
        <div className="p-8 text-center text-muted-foreground">優惠已被刪除</div>
      </AppLayout>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update(id, { title, store, description, url: url || undefined });
    navigate({ to: "/deals" });
  };

  return (
    <AppLayout title="編輯優惠" back="/deals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <input value={store} onChange={(e) => setStore(e.target.value)} placeholder="商家" className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="標題" className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm resize-none" />
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="連結" className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm" />
        <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card">更新</button>
      </form>
    </AppLayout>
  );
}
