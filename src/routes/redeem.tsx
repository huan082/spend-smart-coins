import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, type AppTheme, type AppMode } from "@/store/useAppStore";
import { Lock, Check, Palette, MessageCircle, Smile } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/redeem")({
  component: RedeemPage,
  head: () => ({ meta: [{ title: "積分兌換" }] }),
});

type Tab = "theme" | "mode" | "avatar";

const THEMES: { id: AppTheme; name: string; cost: number; preview: string; desc: string; font: string; radius: string }[] = [
  { id: "morandi", name: "莫蘭迪", cost: 0, preview: "linear-gradient(135deg,#C8D5C0,#D9C5C0)", desc: "柔和色 ｜ 大圓角 ｜ 圓潤字體", font: "Nunito", radius: "1.25rem" },
  { id: "ocean", name: "海洋藍調", cost: 300, preview: "linear-gradient(135deg,#A8C5D6,#7BA3C0)", desc: "清涼海風 ｜ 現代方正字體", font: "Space Grotesk", radius: "0.75rem" },
  { id: "sakura", name: "櫻花季", cost: 350, preview: "linear-gradient(135deg,#F5C6CB,#E8A4B5)", desc: "粉嫩 ｜ 手寫體 ｜ 超圓邊框", font: "Caveat", radius: "1.5rem" },
  { id: "midnight", name: "深夜模式", cost: 500, preview: "linear-gradient(135deg,#2C3E50,#34495E)", desc: "深色護眼 ｜ 銳利方角", font: "Space Grotesk", radius: "0.5rem" },
  { id: "forest", name: "森林秘境", cost: 400, preview: "linear-gradient(135deg,#7FA67F,#506B50)", desc: "復古綠 ｜ 襯線英文字體", font: "DM Serif Display", radius: "1.25rem" },
];

const MODES: { id: AppMode; name: string; cost: number; emoji: string; desc: string; sample: string }[] = [
  { id: "normal", name: "普通模式", cost: 0, emoji: "🙂", desc: "中規中矩", sample: "你今天花了 320 元" },
  { id: "savage", name: "毒舌模式", cost: 250, emoji: "😈", desc: "嘴你嘴到醒", sample: "又花錢？錢是大風颳來的嗎" },
  { id: "gentle", name: "溫柔模式", cost: 250, emoji: "🥺", desc: "溫暖鼓勵", sample: "辛苦了，記得犒賞自己也要量力喔" },
  { id: "cheer", name: "啦啦隊模式", cost: 300, emoji: "🎉", desc: "活力滿點", sample: "哇～記帳達成！你超棒的！" },
  { id: "zen", name: "佛系模式", cost: 200, emoji: "🧘", desc: "看開一切", sample: "錢沒了，再賺就有，平常心" },
];

const SHOP_AVATARS = [
  { e: "👑", cost: 200 }, { e: "🦄", cost: 250 }, { e: "🐉", cost: 350 },
  { e: "🦁", cost: 200 }, { e: "🐼", cost: 200 }, { e: "🦋", cost: 180 },
  { e: "🌈", cost: 280 }, { e: "🍑", cost: 150 }, { e: "🥑", cost: 150 },
  { e: "🎀", cost: 180 }, { e: "💎", cost: 400 }, { e: "🚀", cost: 300 },
];

function RedeemPage() {
  const {
    points, weeklyBudget, redeemPoints,
    ownedThemes, ownedModes, ownedAvatars,
    currentTheme, currentMode,
    setTheme, setMode, unlockTheme, unlockMode, unlockAvatar,
  } = useAppStore();
  const [tab, setTab] = useState<Tab>("theme");

  if (weeklyBudget === 0) {
    return (
      <AppLayout title="積分兌換" back="/me">
        <div className="px-5 py-12 text-center">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold mb-2">請先設定週預算解鎖</p>
          <Link to="/budget" className="inline-block mt-3 px-6 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold">
            前往設定
          </Link>
        </div>
      </AppLayout>
    );
  }

  const buyTheme = (t: typeof THEMES[number]) => {
    if (ownedThemes.includes(t.id)) {
      setTheme(t.id);
      alert(`已套用「${t.name}」主題`);
      return;
    }
    if (!confirm(`花 ${t.cost} 積分解鎖「${t.name}」主題？`)) return;
    if (redeemPoints(t.cost, `主題：${t.name}`)) {
      unlockTheme(t.id);
      setTheme(t.id);
    } else alert("積分不足");
  };

  const buyMode = (m: typeof MODES[number]) => {
    if (ownedModes.includes(m.id)) {
      setMode(m.id);
      alert(`已切換成「${m.name}」`);
      return;
    }
    if (!confirm(`花 ${m.cost} 積分解鎖「${m.name}」？`)) return;
    if (redeemPoints(m.cost, `模式：${m.name}`)) {
      unlockMode(m.id);
      setMode(m.id);
    } else alert("積分不足");
  };

  const buyAvatar = (a: typeof SHOP_AVATARS[number]) => {
    if (ownedAvatars.includes(a.e)) {
      alert("已擁有，到個人資料管理選擇");
      return;
    }
    if (!confirm(`花 ${a.cost} 積分解鎖頭像 ${a.e}？`)) return;
    if (redeemPoints(a.cost, `頭像：${a.e}`)) {
      unlockAvatar(a.e);
    } else alert("積分不足");
  };

  return (
    <AppLayout title="積分兌換" back="/points">
      <div className="px-5 py-4 space-y-4">
        <div className="rounded-2xl bg-coin/15 p-3 text-center">
          <p className="text-xs text-muted-foreground">可用積分</p>
          <p className="font-display font-extrabold text-2xl text-coin">🪙 {points}</p>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-2xl">
          {([
            { k: "theme", l: "主題", i: Palette },
            { k: "mode", l: "模式", i: MessageCircle },
            { k: "avatar", l: "頭像", i: Smile },
          ] as { k: Tab; l: string; i: any }[]).map(({ k, l, i: I }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                tab === k ? "bg-card shadow-soft" : "text-muted-foreground"
              }`}
            >
              <I className="w-3.5 h-3.5" /> {l}
            </button>
          ))}
        </div>

        {tab === "theme" && (
          <div className="space-y-3">
            {THEMES.map((t) => {
              const owned = ownedThemes.includes(t.id);
              const active = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => buyTheme(t)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 shadow-soft text-left active:scale-98"
                >
                  <div
                    className="w-16 h-16 shadow-soft flex-shrink-0 flex items-center justify-center text-card text-xl font-bold"
                    style={{ background: t.preview, borderRadius: t.radius, fontFamily: t.font }}
                  >
                    Aa
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ fontFamily: t.font }}>{t.name}</p>
                      {active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">使用中</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <div className="text-right">
                    {owned ? (
                      active ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <span className="text-xs text-primary font-bold">套用</span>
                      )
                    ) : (
                      <span className="text-coin font-display font-extrabold text-sm">🪙 {t.cost}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === "mode" && (
          <div className="space-y-3">
            {MODES.map((m) => {
              const owned = ownedModes.includes(m.id);
              const active = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => buyMode(m)}
                  className="w-full p-4 rounded-2xl bg-card border border-border/60 shadow-soft text-left active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{m.name}</p>
                        {active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">使用中</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    {owned ? (
                      active ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <span className="text-xs text-primary font-bold">套用</span>
                      )
                    ) : (
                      <span className="text-coin font-display font-extrabold text-sm">🪙 {m.cost}</span>
                    )}
                  </div>
                  <div className="mt-2 ml-12 px-3 py-2 rounded-xl bg-muted text-xs text-muted-foreground italic">
                    "{m.sample}"
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === "avatar" && (
          <div className="grid grid-cols-3 gap-3">
            {SHOP_AVATARS.map((a) => {
              const owned = ownedAvatars.includes(a.e);
              return (
                <button
                  key={a.e}
                  onClick={() => buyAvatar(a)}
                  className={`p-4 rounded-2xl border shadow-soft text-center ${
                    owned ? "bg-primary-soft border-primary/30" : "bg-card border-border/60"
                  }`}
                >
                  <p className="text-4xl mb-2">{a.e}</p>
                  {owned ? (
                    <span className="text-[11px] font-bold text-primary flex items-center justify-center gap-0.5">
                      <Check className="w-3 h-3" /> 已擁有
                    </span>
                  ) : (
                    <span className="text-coin font-display font-extrabold text-xs">🪙 {a.cost}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
