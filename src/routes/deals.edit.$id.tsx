import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/deals/edit/$id")({
  component: EditDeal,
  head: () => ({ meta: [{ title: "編輯優惠" }] }),
});

function EditDeal() {
  const { id } = Route.useParams();
  const deal = useAppStore((s) => s.deals.find((d) => d.id === id));
  const update = useAppStore((s) => s.updateDeal);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(deal?.title || "");
  const [store, setStore] = useState(deal?.store || "");
  const [description, setDescription] = useState(deal?.description || "");
  const [url, setUrl] = useState(deal?.url || "");
  const [address, setAddress] = useState(deal?.address || "");
  const [photo, setPhoto] = useState<string | undefined>(deal?.photo);

  useEffect(() => {
    if (!deal) return;
    setTitle(deal.title);
    setStore(deal.store);
    setDescription(deal.description);
    setUrl(deal.url || "");
    setAddress(deal.address || "");
    setPhoto(deal.photo);
  }, [deal]);

  if (!deal) {
    return (
      <AppLayout title="找不到優惠" back="/deals">
        <div className="p-8 text-center text-muted-foreground">優惠已被刪除</div>
      </AppLayout>
    );
  }

  const handleFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) return alert("圖片請小於 2MB");
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update(id, {
      title,
      store,
      description,
      url: url || undefined,
      address: address || undefined,
      photo,
      // 有填地址才放在地圖上；demo 座標落在高雄燕巢/大社/岡山/楠梓範圍
      lat: address ? deal.lat ?? 22.72 + Math.random() * 0.08 : undefined,
      lng: address ? deal.lng ?? 120.29 + Math.random() * 0.08 : undefined,
    });
    navigate({ to: "/deals" });
  };

  return (
    <AppLayout title="編輯優惠" back="/deals">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        <Field label="商家">
          <input value={store} onChange={(e) => setStore(e.target.value)} className="input" required />
        </Field>
        <Field label="優惠標題">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
        </Field>
        <Field label="詳細說明">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input resize-none" required />
        </Field>
        <Field label="店家地址（會顯示在好康地圖）">
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="台北市..." className="input" />
        </Field>
        <Field label="連結">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="input" />
        </Field>
        <Field label="優惠圖片">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {photo ? (
            <div className="relative inline-block">
              <img src={photo} alt="" className="w-full max-h-48 rounded-2xl object-cover border border-border" />
              <button type="button" onClick={() => setPhoto(undefined)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-8 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">點擊上傳</span>
            </button>
          )}
        </Field>
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
