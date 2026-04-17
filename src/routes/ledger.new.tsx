import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState, useRef } from "react";
import { Plus, X, Image as ImageIcon, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ledger/new")({
  component: NewTxn,
  head: () => ({ meta: [{ title: "新增記帳" }] }),
});

function NewTxn() {
  const {
    addTransaction,
    expenseCategories,
    incomeCategories,
    stores,
    addExpenseCategory,
    addIncomeCategory,
    addStore,
  } = useAppStore();
  const navigate = useNavigate();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐飲");
  const [store, setStore] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🌿");
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = type === "expense" ? expenseCategories : incomeCategories;

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
    if (!amount) return;
    addTransaction({
      type,
      amount: Number(amount),
      category,
      store: store || undefined,
      note,
      photo,
      date: new Date(date).toISOString(),
    });
    navigate({ to: "/ledger" });
  };

  const submitNewCat = () => {
    if (!newCat.trim()) return;
    if (type === "expense") addExpenseCategory(newCat.trim(), newCatEmoji);
    else addIncomeCategory(newCat.trim(), newCatEmoji);
    setCategory(newCat.trim());
    setNewCat("");
    setShowAddCat(false);
  };

  const submitNewStore = () => {
    if (!newStore.trim()) return;
    addStore(newStore.trim());
    setStore(newStore.trim());
    setNewStore("");
    setShowAddStore(false);
  };

  return (
    <AppLayout title="新增記錄" back="/ledger">
      <form onSubmit={submit} className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory(t === "expense" ? "餐飲" : "薪資");
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === t
                  ? t === "expense"
                    ? "bg-card text-foreground shadow-soft"
                    : "bg-card text-success shadow-soft"
                  : "text-muted-foreground"
              }`}
            >
              {t === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        <div className="text-center py-4">
          <span className="text-muted-foreground text-sm">NT$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center font-display text-5xl font-extrabold bg-transparent outline-none mt-1"
            autoFocus
          />
        </div>

        {/* 分類 */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-bold text-muted-foreground">分類</p>
            <button
              type="button"
              onClick={() => setShowAddCat((v) => !v)}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 新增類別
            </button>
          </div>
          {showAddCat && (
            <div className="mb-2 p-3 rounded-2xl bg-muted flex gap-2">
              <input
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                className="w-12 px-2 py-2 rounded-xl bg-card border border-border text-center"
                maxLength={2}
              />
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="類別名稱"
                className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-sm outline-none"
              />
              <button
                type="button"
                onClick={submitNewCat}
                className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
              >
                加入
              </button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${
                  category === c.name
                    ? "bg-primary-soft border-primary"
                    : "bg-card border-border"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-xs">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 店家（支出才顯示） */}
        {type === "expense" && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-bold text-muted-foreground">消費店家</p>
              <button
                type="button"
                onClick={() => setShowAddStore((v) => !v)}
                className="text-xs text-primary font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 新增店家
              </button>
            </div>
            {showAddStore && (
              <div className="mb-2 p-3 rounded-2xl bg-muted flex gap-2">
                <input
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  placeholder="店家名稱"
                  className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={submitNewStore}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                >
                  加入
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStore("")}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  !store ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
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
        )}

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
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">備註</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="加點筆記..."
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border outline-none text-sm"
          />
        </div>

        {/* 上傳圖片（發票 / 商品） */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">附加圖片（發票或商品）</p>
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
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-soft"
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
          儲存
        </button>
      </form>
    </AppLayout>
  );
}
