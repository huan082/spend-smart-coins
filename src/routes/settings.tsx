import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { Bell, Shield, Cloud, Download, Lock, ChevronRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "設定" }] }),
});

function SettingsPage() {
  const { notificationsEnabled, budgetAlertEnabled, toggleNotifications, toggleBudgetAlert, logout, transactions, goals } = useAppStore();
  const navigate = useNavigate();

  const exportData = () => {
    const data = JSON.stringify({ transactions, goals }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `money-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="設定" back="/me">
      <div className="px-5 py-4 space-y-4">
        <Section title="通知與提醒">
          <Toggle icon={Bell} label="開啟通知" checked={notificationsEnabled} onChange={toggleNotifications} />
          <Toggle icon={Bell} label="預算超支提醒" checked={budgetAlertEnabled} onChange={toggleBudgetAlert} />
          <Toggle icon={Bell} label="定時記帳提醒（晚上 8 點）" checked={true} onChange={() => {}} />
          <Toggle icon={Bell} label="目標商品降價提醒" checked={true} onChange={() => {}} />
          <Toggle icon={Bell} label="個人化優惠推播" checked={true} onChange={() => {}} />
          <Toggle icon={Bell} label="異常消費偵測" checked={true} onChange={() => {}} />
        </Section>

        <Section title="帳號與安全">
          <Item icon={Shield} label="帳號安全" desc="變更密碼" />
          <Item icon={Lock} label="隱私保護" desc="App 鎖" />
          <Item icon={Lock} label="加密服務" desc="端對端加密" />
        </Section>

        <Section title="資料管理">
          <Item icon={Cloud} label="雲端同步" desc="自動備份至雲端" />
          <button onClick={exportData} className="w-full text-left">
            <Item icon={Download} label="資料匯出" desc="下載 JSON 備份" />
          </button>
        </Section>

        <button
          onClick={() => {
            if (confirm("確定登出？")) {
              logout();
              navigate({ to: "/login" });
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-card border border-destructive/30 text-destructive font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> 登出
        </button>

        <p className="text-center text-[11px] text-muted-foreground">金錢規劃系統 v1.0</p>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 px-1">{title}</p>
      <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">{children}</div>
    </div>
  );
}

function Toggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-soft transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function Item({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
