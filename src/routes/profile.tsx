import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import {
  useAppStore, type AppTheme, type AppMode,
} from "@/store/useAppStore";
import { useState } from "react";
import { Palette, Sparkles, Lock } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "個人資料" }] }),
});

const THEME_META: Record<AppTheme, { name: string; swatch: string }> = {
  morandi: { name: "莫蘭迪", swatch: "linear-gradient(135deg,#B8C5B0,#D4C5B0)" },
  ocean: { name: "海洋", swatch: "linear-gradient(135deg,#7CB4C6,#3D6B89)" },
  sakura: { name: "櫻花", swatch: "linear-gradient(135deg,#F5C2C7,#E8889A)" },
  midnight: { name: "午夜", swatch: "linear-gradient(135deg,#3A3D5C,#1F2235)" },
  forest: { name: "森林", swatch: "linear-gradient(135deg,#7FA679,#3F6B4D)" },
};

const MODE_META: Record<AppMode, { name: string; emoji: string; desc: string }> = {
  normal: { name: "普通", emoji: "🌿", desc: "平實穩定的語氣" },
  savage: { name: "毒舌", emoji: "🔥", desc: "辛辣吐槽，刺激控制慾" },
  gentle: { name: "溫柔", emoji: "🌸", desc: "輕聲細語，溫暖鼓勵" },
  cheer: { name: "啦啦隊", emoji: "📣", desc: "熱血激昂，全力加油" },
  zen: { name: "禪意", emoji: "🧘", desc: "佛系隨緣，淡然處之" },
};

function ProfilePage() {
  const {
    user, updateProfile, ownedAvatars,
    ownedThemes, currentTheme, setTheme,
    ownedModes, currentMode, setMode,
  } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    avatar: user?.avatar || "🌿",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthday: user?.birthday || "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      nickname: form.nickname,
      avatar: form.avatar,
      phone: form.phone,
      gender: form.gender as User["gender"],
      birthday: form.birthday,
    });
    navigate({ to: "/me" });
  };

  return (
    <AppLayout title="個人資料管理" back="/me">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
        {/* 頭像 */}
        <div className="rounded-3xl bg-gradient-cool/40 p-5 text-center">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-card shadow-card flex items-center justify-center text-5xl mb-3">
            {form.avatar}
          </div>
          <p className="text-xs text-muted-foreground mb-2">點選頭像更換</p>
          <div className="grid grid-cols-6 gap-2">
            {ownedAvatars.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set("avatar", a)}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center ${
                  form.avatar === a ? "bg-primary-soft ring-2 ring-primary" : "bg-card"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <Link to="/redeem" className="inline-block text-[11px] text-primary mt-2 font-medium">
            想要更多頭像？前往積分兌換 →
          </Link>
        </div>

        {/* 基本資料 */}
        <Section title="基本資料">
          <Field label="暱稱">
            <input
              value={form.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Email">
            <input value={form.email} disabled className="input opacity-60" />
          </Field>
          <Field label="手機號碼">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="09xx-xxx-xxx"
              className="input"
            />
          </Field>
          <Field label="性別">
            <div className="flex gap-2">
              {[
                { v: "male", l: "男" },
                { v: "female", l: "女" },
                { v: "other", l: "其他" },
              ].map((g) => (
                <button
                  key={g.v}
                  type="button"
                  onClick={() => set("gender", g.v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                    form.gender === g.v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  {g.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="生日">
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => set("birthday", e.target.value)}
              className="input"
            />
          </Field>
        </Section>

        {/* 主題切換 */}
        <Section title="主題風格">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Palette className="w-3.5 h-3.5" /> 切換你的 App 視覺風格
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(THEME_META) as AppTheme[]).map((t) => {
              const owned = ownedThemes.includes(t);
              const active = currentTheme === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!owned}
                  onClick={() => setTheme(t)}
                  className={`p-2 rounded-2xl border text-xs font-medium relative overflow-hidden ${
                    active ? "border-primary ring-2 ring-primary" : "border-border"
                  } ${!owned ? "opacity-50" : ""}`}
                >
                  <div
                    className="h-10 rounded-xl mb-1.5"
                    style={{ background: THEME_META[t].swatch }}
                  />
                  {THEME_META[t].name}
                  {!owned && (
                    <Lock className="w-3 h-3 absolute top-2 right-2 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
          <Link to="/redeem" className="inline-block text-[11px] text-primary mt-2 font-medium">
            解鎖更多主題 →
          </Link>
        </Section>

        {/* 模式切換 */}
        <Section title="互動模式">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 影響 App 跟你說話的口氣
          </div>
          <div className="space-y-2">
            {(Object.keys(MODE_META) as AppMode[]).map((m) => {
              const owned = ownedModes.includes(m);
              const active = currentMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={!owned}
                  onClick={() => setMode(m)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left ${
                    active ? "border-primary bg-primary-soft" : "border-border bg-card"
                  } ${!owned ? "opacity-50" : ""}`}
                >
                  <span className="text-2xl">{MODE_META[m].emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{MODE_META[m].name}</p>
                    <p className="text-[11px] text-muted-foreground">{MODE_META[m].desc}</p>
                  </div>
                  {!owned && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </Section>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-card"
        >
          儲存
        </button>

        <style>{`.input{width:100%;padding:.7rem 1rem;border-radius:1rem;background:var(--card);border:1px solid var(--border);outline:none;font-size:.875rem}`}</style>
      </form>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground mb-2 px-1">{title}</p>
      <div className="space-y-3 p-4 rounded-2xl bg-card border border-border/60 shadow-soft">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-muted-foreground mb-1.5">{label}</p>
      {children}
    </div>
  );
}

// type-only re-import to satisfy ts
import type { User } from "@/store/useAppStore";
