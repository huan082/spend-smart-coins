import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, type CarrierLink } from "@/store/useAppStore";
import { useState } from "react";
import { Smartphone, Trash2, Plus, QrCode } from "lucide-react";

export const Route = createFileRoute("/carriers")({
  component: CarriersPage,
  head: () => ({ meta: [{ title: "連動管理" }] }),
});

const TYPE_META: Record<CarrierLink["type"], { label: string; icon: any; color: string }> = {
  mobile_barcode: { label: "手機條碼載具", icon: QrCode, color: "bg-primary-soft text-primary" },
};

function CarriersPage() {
  const { carriers, addCarrier, updateCarrier, removeCarrier, autoTxnEnabled, toggleAutoTxn } =
    useAppStore();
  const [adding, setAdding] = useState(false);
  const type: CarrierLink["type"] = "mobile_barcode";
  const [account, setAccount] = useState("");
  const [label, setLabel] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    addCarrier({
      type,
      account,
      label: label || TYPE_META[type].label,
      enabled: true,
    });
    setAccount("");
    setLabel("");
    setAdding(false);
  };

  return (
    <AppLayout title="連動管理" back="/settings">
      <div className="px-5 py-4 space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-cool/40 border border-tertiary/30">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-tertiary-foreground" />
            <p className="font-bold">自動記帳</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            連結手機條碼載具，電子發票自動同步成記帳，再也不用手動輸入。
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">啟用自動記帳</span>
            <button
              type="button"
              onClick={toggleAutoTxn}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoTxnEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${
                  autoTxnEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-bold text-muted-foreground">已連動載具</p>
            <button
              onClick={() => setAdding(!adding)}
              className="flex items-center gap-1 text-xs font-bold text-primary"
            >
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
          </div>

          {adding && (
            <form
              onSubmit={submit}
              className="p-4 rounded-2xl bg-card border border-border/60 shadow-soft space-y-3 mb-3"
            >
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">
                  載具條碼（/開頭）
                </p>
                <input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="/ABC1234"
                  className="w-full px-3 py-2 rounded-xl border border-border outline-none text-sm"
                  required
                />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">自訂名稱（選填）</p>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="我的主要載具"
                  className="w-full px-3 py-2 rounded-xl border border-border outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm"
              >
                完成連動
              </button>
            </form>
          )}

          {carriers.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/60 p-8 text-center text-muted-foreground text-sm">
              <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              還沒有連動的載具
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
              {carriers.map((c) => {
                const meta = TYPE_META[c.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{c.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {meta.label} · {c.account}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCarrier(c.id, { enabled: !c.enabled })}
                      className={`w-9 h-5 rounded-full relative ${c.enabled ? "bg-primary" : "bg-muted"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-soft transition-all ${
                          c.enabled ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => confirm("解除連動？") && removeCarrier(c.id)}
                      className="p-1.5 text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          💡 Demo 模式：此處只儲存於本機，並非真的串接財政部 API
        </p>
      </div>
    </AppLayout>
  );
}
