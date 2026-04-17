import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getMonthRange } from "@/store/useAppStore";
import { useState, useMemo } from "react";
import { Plus, Heart, Pencil, Trash2, ExternalLink, Sparkles, MapPin, Store as StoreIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

export const Route = createFileRoute("/deals/")({
  component: DealsPage,
  head: () => ({ meta: [{ title: "優惠探索" }] }),
});

type Tab = "explore" | "map" | "frequent";

function DealsPage() {
  const { deals, user, transactions, likeDeal, deleteDeal } = useAppStore();
  const [tab, setTab] = useState<Tab>("explore");
  const [q, setQ] = useState("");

  // 從本月消費找出常去店家
  const frequentStores = useMemo(() => {
    const { start, end } = getMonthRange();
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (t.type === "expense" && t.store && d >= start && d < end) {
        map.set(t.store, (map.get(t.store) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [transactions]);

  const explore = deals.filter(
    (d) => !q || d.title.includes(q) || d.store.includes(q) || d.description.includes(q)
  );

  const frequentDeals = useMemo(() => {
    const names = new Set(frequentStores.map((s) => s.name));
    return deals.filter((d) => names.has(d.store));
  }, [deals, frequentStores]);

  const mapDeals = deals.filter((d) => d.lat && d.lng);

  return (
    <AppLayout
      title="優惠探索"
      right={
        <Link
          to="/deals/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-soft"
        >
          <Plus className="w-4 h-4" /> 分享
        </Link>
      }
    >
      <div className="px-5 py-4 space-y-3">
        <div className="p-3 rounded-2xl bg-gradient-warm/40 border border-accent/30 flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div className="flex-1">
            <p className="font-bold text-sm">分享優惠拿積分</p>
            <p className="text-xs text-muted-foreground">每分享一則優惠 +20 積分</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-2xl">
          {([
            { k: "explore", l: "優惠探索" },
            { k: "map", l: "好康地圖" },
            { k: "frequent", l: "常去店家" },
          ] as { k: Tab; l: string }[]).map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                tab === k ? "bg-card shadow-soft" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "explore" && (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜尋商家或優惠..."
              className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border outline-none text-sm shadow-soft"
            />
            {explore.map((d) => (
              <DealCard
                key={d.id}
                d={d}
                isMine={d.authorId === user?.id}
                onLike={() => likeDeal(d.id)}
                onDelete={() => confirm("刪除？") && deleteDeal(d.id)}
              />
            ))}
            {explore.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">沒有找到優惠</p>
              </div>
            )}
          </>
        )}

        {tab === "map" && (
          <>
            <MapView deals={mapDeals} />
            <p className="text-xs text-muted-foreground text-center px-4">
              📍 顯示附近有優惠的店家位置（共 {mapDeals.length} 處）
            </p>
            {mapDeals.map((d) => (
              <div
                key={d.id}
                className="flex gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{d.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.address}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">
                    {d.store}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "frequent" && (
          <>
            <div className="p-3 rounded-2xl bg-tertiary/30 text-xs text-muted-foreground">
              💡 根據你本月的消費習慣，推薦你常去店家的優惠
            </div>

            {frequentStores.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">還沒有店家消費紀錄</p>
                <p className="text-xs mt-1">記帳時選擇店家，這裡就會出現相關優惠</p>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {frequentStores.map((s) => (
                  <div
                    key={s.name}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-card border border-border text-xs"
                  >
                    {s.name} <span className="text-muted-foreground">×{s.count}</span>
                  </div>
                ))}
              </div>
            )}

            {frequentDeals.length > 0 ? (
              frequentDeals.map((d) => (
                <DealCard
                  key={d.id}
                  d={d}
                  isMine={d.authorId === user?.id}
                  onLike={() => likeDeal(d.id)}
                  onDelete={() => confirm("刪除？") && deleteDeal(d.id)}
                />
              ))
            ) : frequentStores.length > 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                你常去的店家目前還沒有優惠
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function DealCard({
  d, isMine, onLike, onDelete,
}: {
  d: ReturnType<typeof useAppStore.getState>["deals"][number];
  isMine: boolean;
  onLike: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
      {d.photo && (
        <img src={d.photo} alt={d.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">
                {d.store}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true, locale: zhTW })}
              </span>
            </div>
            <p className="font-display font-bold">{d.title}</p>
            {d.address && (
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {d.address}
              </p>
            )}
          </div>
          {isMine && (
            <div className="flex flex-col gap-1">
              <Link
                to="/deals/edit/$id"
                params={{ id: d.id }}
                className="p-1 rounded text-muted-foreground"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
              <button onClick={onDelete} className="p-1 rounded text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
        {d.url && (
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary mt-2"
          >
            查看詳情 <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">分享：{d.authorName}</span>
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Heart className="w-3.5 h-3.5" /> {d.likes}
          </button>
        </div>
      </div>
    </div>
  );
}

// 模擬地圖：把優惠店家以位置散點呈現
function MapView({ deals }: { deals: ReturnType<typeof useAppStore.getState>["deals"] }) {
  // 將經緯度正規化到 0-1 範圍方便畫散點
  if (deals.length === 0) {
    return (
      <div className="h-56 rounded-3xl bg-gradient-cool/30 border border-border/60 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          目前沒有可顯示的店家位置
        </div>
      </div>
    );
  }
  const lats = deals.map((d) => d.lat!);
  const lngs = deals.map((d) => d.lng!);
  const minLat = Math.min(...lats) - 0.005;
  const maxLat = Math.max(...lats) + 0.005;
  const minLng = Math.min(...lngs) - 0.005;
  const maxLng = Math.max(...lngs) + 0.005;
  const span = (n: number, min: number, max: number) =>
    max === min ? 50 : ((n - min) / (max - min)) * 100;

  return (
    <div className="relative h-64 rounded-3xl overflow-hidden border border-border/60 shadow-soft bg-[linear-gradient(135deg,#E8EDE4_0%,#DDE5E8_100%)]">
      {/* 模擬地圖網格 */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#9DB4C0" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 12.5}%`} y1="0" x2={`${i * 12.5}%`} y2="100%" stroke="#9DB4C0" strokeWidth="0.5" />
        ))}
      </svg>

      {/* 標記 */}
      {deals.map((d) => {
        const left = span(d.lng!, minLng, maxLng);
        const top = 100 - span(d.lat!, minLat, maxLat);
        return (
          <div
            key={d.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div className="flex flex-col items-center group">
              <div className="bg-card text-[10px] font-bold px-2 py-0.5 rounded-full shadow-soft mb-1 whitespace-nowrap max-w-[100px] truncate">
                {d.store}
              </div>
              <MapPin className="w-7 h-7 text-destructive drop-shadow" fill="currentColor" />
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-card/80 px-2 py-0.5 rounded">
        示意地圖
      </div>
    </div>
  );
}
