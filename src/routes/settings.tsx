import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import {
  Shield, Cloud, Download, Lock, ChevronRight, LogOut, Trash2,
  Sparkles, Smartphone, Zap, User as UserIcon, Fingerprint,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "設定" }] }),
});

function SettingsPage() {
  const {
    logout, transactions, goals, clearAllData,
    autoTxnEnabled, toggleAutoTxn, carriers,
    biometricEnabled, toggleBiometric,
  } = useAppStore();
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
        <Section title="自動記帳 / 連動">
          <Link to="/carriers" className="block">
            <Item icon={Smartphone} label="連動管理" desc={`已連動 ${carriers.length} 組手機條碼載具`} />
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">啟用自動記帳</p>
              <p className="text-[11px] text-muted-foreground">從手機條碼載具自動同步電子發票</p>
            </div>
            <SwitchBtn checked={autoTxnEnabled} onChange={toggleAutoTxn} />
          </div>
          <Link to="/auto-ledger" className="block">
            <Item icon={Sparkles} label="自動記帳明細確認" desc="檢視並確認自動抓取的消費" />
          </Link>
        </Section>

        <Section title="帳號與安全">
          <Link to="/profile" className="block">
            <Item icon={UserIcon} label="個人資料管理" desc="暱稱、頭像、基本資料" />
          </Link>
          <Item icon={Shield} label="帳號安全" desc="變更密碼" />
          <Toggle icon={Fingerprint} label="生物辨識登入" checked={biometricEnabled} onChange={toggleBiometric} />
          <Item icon={Lock} label="隱私保護" desc="App 鎖、端對端加密" />
        </Section>

        <Section title="資料管理">
          <Item icon={Cloud} label="雲端同步" desc="自動備份至雲端" />
          <button onClick={exportData} className="w-full text-left">
            <Item icon={Download} label="資料匯出" desc="下載 JSON 備份" />
          </button>
          <button
            onClick={() => {
              if (confirm("確定要清除所有資料嗎？此動作無法復原（記帳、目標、積分、帳單將全部刪除）")) {
                clearAllData();
                alert("資料已清除");
              }
            }}
            className="w-full text-left"
          >
            <Item icon={Trash2} label="清除所有資料" desc="記帳、目標、積分、帳單全部重置" danger />
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

function Item({ icon: Icon, label, desc, danger }: { icon: any; label: string; desc: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? "text-destructive" : ""}`}>{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
