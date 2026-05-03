import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/deals/new")({
  component: NewDeal,
  head: () => ({ meta: [{ title: "分享優惠" }] }),
});

function NewDeal() {
  const add = useAppStore((s) => s.addDeal);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();

  const handleFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) {
      alert("圖片請小於 2MB");
      return;
    }
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !store || !description) return;
    add({
      title,
      store,
      description,
      url: url || undefined,
      address: address || undefined,
      photo,
      // 有填地址才在地圖上顯示（demo：隨機台北座標）
      lat: address ? 25.04 + Math.random() * 0.03 : undefined,
      lng: address ? 121.53 + Math.random() * 0.03 : undefined,
    });
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
        <Field label="店家地址（選填，會顯示在好康地圖）">
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="台北市信義區..." className="input" />
        </Field>
        <Field label="連結（選填）">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="input" />
        </Field>

        <Field label="優惠圖片（選填）">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {photo ? (
            <div className="relative inline-block">
              <img src={photo} alt="優惠" className="w-full max-h-48 rounded-2xl object-cover border border-border" />
              <button
                type="button"
                onClick={() => setPhoto(undefined)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-soft"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">點擊上傳優惠圖（DM、海報）</span>
            </button>
          )}
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
