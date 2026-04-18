import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "個人資料" }] }),
});

function ProfilePage() {
  const { user, updateProfile, ownedAvatars } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    avatar: user?.avatar || "🌿",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthday: user?.birthday || "",
    monthlyIncome: user?.monthlyIncome?.toString() || "",
    savingTarget: user?.savingTarget?.toString() || "",
    bio: user?.bio || "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      nickname: form.nickname,
      avatar: form.avatar,
      phone: form.phone,
      gender: form.gender as any,
      birthday: form.birthday,
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
      savingTarget: form.savingTarget ? Number(form.savingTarget) : undefined,
      bio: form.bio,
    });
    navigate({ to: "/me" });
  };

  return (
    <AppLayout title="個人資料管理" back="/me">
      <form onSubmit={submit} className="px-5 py-4 space-y-4">
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
          <p className="text-[11px] text-muted-foreground mt-2">想要更多頭像？前往積分兌換</p>
        </div>

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

        <Section title="財務資訊">
          <Field label="每月收入">
            <input
              type="number"
              value={form.monthlyIncome}
              onChange={(e) => set("monthlyIncome", e.target.value)}
              placeholder="例如 35000"
              className="input"
            />
          </Field>
          <Field label="儲蓄目標（每月）">
            <input
              type="number"
              value={form.savingTarget}
              onChange={(e) => set("savingTarget", e.target.value)}
              placeholder="例如 8000"
              className="input"
            />
          </Field>
        </Section>

        <Section title="自我介紹">
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            placeholder="一句話介紹你自己..."
            className="input resize-none"
          />
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
