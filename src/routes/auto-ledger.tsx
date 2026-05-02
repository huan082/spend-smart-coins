import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { Smartphone, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/auto-ledger")({
  component: AutoLedgerPage,
  head: () => ({ meta: [{ title: "自動記帳" }] }),
});

function AutoLedgerPage() {
  const {
    autoTxnEnabled,
    autoTxnLogs,
    importAutoTxn,
    ignoreAutoTxn,
    simulateAutoTxn,
    carriers,
    toggleAutoTxn,
  } = useAppStore();

  const enabledCarriers = carriers.filter((c) => c.enabled);
  const pending = autoTxnLogs.filter((l) => !l.imported);
  const imported = autoTxnLogs.filter((l) => l.imported);

  if (!autoTxnEnabled || enabledCarriers.length === 0) {
    return (
      <AppLayout title="自動記帳" back="/ledger">
        <div className="px-5 py-12 text-center space-y-4">
          <Smartphone className="w-14 h-14 mx-auto text-muted-foreground opacity-50" />
          <div>
            <p className="font-bold mb-1">尚未啟用自動記帳</p>
            <p className="text-xs text-muted-foreground">
              前往「連動管理」加入手機條碼載具
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {!autoTxnEnabled && (
              <button
                onClick={toggleAutoTxn}
                className="px-5 py-2.5 rounded-2xl bg-card border border-border font-bold text-sm"
              >
                啟用功能
              </button>
            )}
            <Link
              to="/carriers"
              className="px-5 py-2.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-sm"
            >
              前往連動
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="自動記帳" back="/ledger">
      <div className="px-5 py-4 space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-cool/40 border border-tertiary/30 flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-bold text-sm">已連動 {enabledCarriers.length} 組載具</p>
            <p className="text-[11px] text-muted-foreground">
              {enabledCarriers.map((c) => c.label).join("、")}
            </p>
          </div>
          <button
            onClick={simulateAutoTxn}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card text-xs font-bold shadow-soft"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 同步
          </button>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 px-1">
            待確認 ({pending.length})
          </p>
          {pending.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/60 p-6 text-center text-sm text-muted-foreground">
              沒有待匯入的消費，點「同步」抓取最新交易
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-card border border-border/60 shadow-soft"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">{l.store}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {l.source} · {format(new Date(l.date), "MM/dd HH:mm")} · {l.category}
                      </p>
                    </div>
                    <p className="font-display font-extrabold text-lg text-destructive">
                      -${l.amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => importAutoTxn(l.id)}
                      className="flex-1 py-2 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> 匯入記帳
                    </button>
                    <button
                      onClick={() => ignoreAutoTxn(l.id)}
                      className="px-4 py-2 rounded-xl bg-muted text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> 忽略
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {imported.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 px-1">已匯入紀錄</p>
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              {imported.slice(0, 10).map((l) => (
                <div
                  key={l.id}
                  className="px-4 py-2.5 border-b border-border/50 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{l.store}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(l.date), "MM/dd")} · {l.source}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">${l.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
