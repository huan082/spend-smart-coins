import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, TrendingDown, Sparkles, Receipt, Clock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/reminders")({
  component: RemindersPage,
  head: () => ({ meta: [{ title: "通知與提醒" }] }),
});

function RemindersPage() {
  const {
    budgetAlertEnabled, toggleBudgetAlert,
    ledgerReminderEnabled, toggleLedgerReminder,
    ledgerReminderTime, setLedgerReminderTime,
    goalDropAlertEnabled, toggleGoalDropAlert,
    dealRecommendEnabled, toggleDealRecommend,
    abnormalSpendAlertEnabled, toggleAbnormalSpendAlert,
    billReminderEnabled, toggleBillReminder,
  } = useAppStore();
  const navigate = useNavigate();

  return (
    <AppLayout title="通知與提醒" back="/me">
      <div className="px-5 py-4 space-y-4">
        <p className="text-xs text-muted-foreground px-1">
          管理你想接收的通知類型與時間。
        </p>
        <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
          <Toggle icon={AlertTriangle} label="預算超支提醒" checked={budgetAlertEnabled} onChange={toggleBudgetAlert} />

          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-medium">定時記帳提醒</span>
              <SwitchBtn checked={ledgerReminderEnabled} onChange={toggleLedgerReminder} />
            </div>
            {ledgerReminderEnabled && (
              <div className="mt-3 ml-12 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">提醒時間</span>
                <input
                  type="time"
                  value={ledgerReminderTime}
                  onChange={(e) => setLedgerReminderTime(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-muted border border-border outline-none text-sm"
                />
              </div>
            )}
          </div>

          <Toggle icon={TrendingDown} label="目標商品降價提醒" checked={goalDropAlertEnabled} onChange={toggleGoalDropAlert} />
          <Toggle icon={Sparkles} label="個人化優惠推播" checked={dealRecommendEnabled} onChange={toggleDealRecommend} />
          <Toggle icon={AlertTriangle} label="異常消費偵測" checked={abnormalSpendAlertEnabled} onChange={toggleAbnormalSpendAlert} />

          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-medium">固定帳單提醒</span>
              <SwitchBtn checked={billReminderEnabled} onChange={toggleBillReminder} />
            </div>
            <button
              onClick={() => navigate({ to: "/bills" })}
              className="mt-3 ml-12 text-xs text-primary font-medium flex items-center gap-1"
            >
              管理我的固定帳單 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SwitchBtn({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Toggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <SwitchBtn checked={checked} onChange={onChange} />
    </label>
  );
}