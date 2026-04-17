import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/ledger/edit/$id")({
  component: EditTxn,
  head: () => ({ meta: [{ title: "編輯記帳" }] }),
});

function EditTxn() {
  const { id } = Route.useParams();
  const txn = useAppStore((s) => s.transactions.find((t) => t.id === id));
  const update = useAppStore((s) => s.updateTransaction);
  const stores = useAppStore((s) => s.stores);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState(txn?.amount.toString() || "");
  const [category, setCategory] = useState(txn?.category || "");
  const [store, setStore] = useState(txn?.store || "");
  const [note, setNote] = useState(txn?.note || "");
  const [photo, setPhoto] = useState<string | undefined>(txn?.photo);
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
    update(id, {
      amount: Number(amount),
      category,
      store: store || undefined,
      note,
      photo,
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
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">店家</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStore("")}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                !store ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              未指定
            </button>
            {stores.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStore(s)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  store === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
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
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">附加圖片</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {photo ? (
            <div className="relative inline-block">
              <img src={photo} alt="附加" className="w-32 h-32 rounded-2xl object-cover border border-border" />
              <button
                type="button"
                onClick={() => setPhoto(undefined)}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">點擊上傳</span>
            </button>
          )}
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
