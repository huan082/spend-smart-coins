import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Settings, Bell, LogOut, ChevronRight, Edit3, Coins, Gift, Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/me")({
  component: MePage,
  head: () => ({ meta: [{ title: "個人中心" }] }),
});

const AVATARS = ["🌿", "🌸", "🌻", "🍃", "🌙", "⭐", "🐱", "🐰", "🦊", "🐻", "🍀", "☁️"];

function MePage() {
  const { user, updateProfile, logout, points, weeklyBudget, transactions, goals } = useAppStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🌿");

  const budgetSet = weeklyBudget > 0;

  const save = () => {
    updateProfile({ nickname, avatar });
    setEditing(false);
  };

  return (
    <AppLayout title="個人中心" right={
      <div className="flex gap-1">
        <Link to="/notifications" className="p-2 rounded-full hover:bg-muted"><Bell className="w-5 h-5" /></Link>
        <Link to="/settings" className="p-2 rounded-full hover:bg-muted"><Settings className="w-5 h-5" /></Link>
      </div>
    }>
      <div className="px-5 py-4 space-y-4">
        {/* Profile card */}
        <div className="rounded-3xl bg-gradient-cool/50 p-5 shadow-card relative">
          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 p-2 rounded-full bg-card/80 shadow-soft"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-card shadow-soft flex items-center justify-center text-4xl">
              {user?.avatar}
            </div>
            <div>
              <p className="font-display font-extrabold text-xl">{user?.nickname}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          {editing && (
            <div className="mt-4 p-4 rounded-2xl bg-card space-y-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">暱稱</p>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border outline-none text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">選擇頭像</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`aspect-square rounded-xl text-2xl flex items-center justify-center ${
                        avatar === a ? "bg-primary-soft ring-2 ring-primary" : "bg-muted"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={save} className="w-full py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm">
                儲存
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon="📝" label="記錄" value={transactions.length} />
          <Stat icon="🎯" label="目標" value={goals.length} />
          <Stat icon="🪙" label="積分" value={budgetSet ? points : "—"} />
        </div>

        {/* Points center */}
        <Link
          to="/points"
          className={`block rounded-3xl p-5 shadow-card relative overflow-hidden ${
            budgetSet ? "bg-gradient-coin" : "bg-muted"
          }`}
        >
          {!budgetSet && (
            <div className="absolute inset-0 bg-card/40 backdrop-blur-[1px] flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-bold">設定預算解鎖</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">積分管理</p>
              <p className="font-display font-extrabold text-3xl mt-1">🪙 {points}</p>
              <p className="text-xs mt-1 opacity-80">查看記錄與兌換</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>

        {/* Menu */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
          <MenuItem icon={Coins} label="積分總計與紀錄" to="/points" />
          <MenuItem icon={Gift} label="積分兌換" to="/redeem" />
          <MenuItem icon={Trophy} label="我的成就" badge="即將推出" />
          <MenuItem icon={Bell} label="通知" to="/notifications" />
          <MenuItem icon={Settings} label="設定" to="/settings" />
        </div>

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
      </div>
    </AppLayout>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-soft p-3 text-center">
      <p className="text-xl mb-1">{icon}</p>
      <p className="font-display font-extrabold text-lg">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function MenuItem({ icon: Icon, label, to, badge }: { icon: any; label: string; to?: string; badge?: string }) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge ? (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : <div>{content}</div>;
}
