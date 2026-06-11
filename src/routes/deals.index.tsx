import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getMonthRange } from "@/store/useAppStore";
import { useState, useMemo } from "react";
import { useRef, useEffect } from "react";
import { Plus as ZoomPlus, Minus as ZoomMinus, X as XIcon } from "lucide-react";
import {
  Plus, Heart, Pencil, Trash2, ExternalLink, Sparkles, MapPin, Search, Star,
  Bookmark, BookmarkCheck, RefreshCw, Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

export const Route = createFileRoute("/deals/")({
  component: DealsPage,
  head: () => ({ meta: [{ title: "優惠探索" }] }),
});

type Tab = "posts" | "map" | "frequent";

function DealsPage() {
  const {
    deals, user, transactions,
    likeDeal, deleteDeal,
    favoriteDealIds, favoriteStores,
    toggleFavoriteDeal, toggleFavoriteStore,
    scrapedDeals, scrapedFetchedAt, refreshScrapedDeals,
  } = useAppStore();
  const [tab, setTab] = useState<Tab>("posts");
  const [q, setQ] = useState("");
  const [mapQ, setMapQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const frequentStores = useMemo(() => {
    const { start, end } = getMonthRange();
    const billNames = new Set(useAppStore.getState().bills.map((b) => b.name));
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (
        t.type === "expense" &&
        t.store &&
        d >= start &&
        d < end &&
        !t.note?.startsWith("[固定帳單]") &&
        !billNames.has(t.store)
      ) {
        map.set(t.store, (map.get(t.store) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [transactions]);

  const posts = deals.filter(
    (d) => !q || d.title.includes(q) || d.store.includes(q) || d.description.includes(q)
  );

  // 地圖：使用者貼文中有填地址的
  const userMapDeals = useMemo(
    () =>
      deals
        .filter((d) => d.lat && d.lng && d.address)
        .filter((d) => !mapQ || d.store.includes(mapQ) || d.address?.includes(mapQ) || d.title.includes(mapQ)),
    [deals, mapQ]
  );
  // 附近店家優惠：來自爬蟲
  const scrapedNearby = useMemo(
    () =>
      scrapedDeals.filter(
        (d) => !mapQ || d.store.includes(mapQ) || d.address.includes(mapQ) || d.title.includes(mapQ)
      ),
    [scrapedDeals, mapQ]
  );
  // 地圖標點：兩者合併
  const allMapPins = useMemo(
    () => [
      ...userMapDeals.map((d) => ({
        id: d.id, store: d.store, lat: d.lat!, lng: d.lng!,
        kind: "post" as const, title: d.title, description: d.description,
        address: d.address ?? "", url: d.url,
      })),
      ...scrapedNearby.map((d) => ({
        id: d.id, store: d.store, lat: d.lat, lng: d.lng,
        kind: "scraped" as const, title: d.title, description: d.description,
        address: d.address, url: d.url,
      })),
    ],
    [userMapDeals, scrapedNearby]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshScrapedDeals(); } finally { setRefreshing(false); }
  };

  const allFreqStores = Array.from(
    new Set([...favoriteStores, ...frequentStores.map((s) => s.name)])
  );
  const frequentDeals = useMemo(() => {
    const names = new Set(allFreqStores);
    return deals.filter((d) => names.has(d.store));
  }, [deals, allFreqStores]);

  const favoriteDeals = deals.filter((d) => favoriteDealIds.includes(d.id));

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
            { k: "posts", l: "優惠貼文" },
            { k: "map", l: "好康地圖" },
            { k: "frequent", l: "收藏 / 常去" },
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

        {/* === 優惠貼文 === */}
        {tab === "posts" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜尋商家、優惠..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border outline-none text-sm shadow-soft"
              />
            </div>
            {posts.map((d) => (
              <DealCard
                key={d.id}
                d={d}
                isMine={d.authorId === user?.id}
                isFav={favoriteDealIds.includes(d.id)}
                onLike={() => likeDeal(d.id)}
                onFav={() => toggleFavoriteDeal(d.id)}
                onDelete={() => confirm("刪除？") && deleteDeal(d.id)}
              />
            ))}
            {posts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">沒有找到優惠貼文</p>
              </div>
            )}
          </>
        )}

        {/* === 好康地圖 === */}
        {tab === "map" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={mapQ}
                onChange={(e) => setMapQ(e.target.value)}
                placeholder="搜尋地址、店家..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border outline-none text-sm shadow-soft"
              />
            </div>

            <MapView pins={allMapPins} />

            {/* 來自貼文（有地址） */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 px-1 flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5" /> 貼文中標註位置（{userMapDeals.length}）
              </p>
              <div className="space-y-2">
                {userMapDeals.map((d) => (
                  <div key={d.id} className="flex gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.address}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">{d.store}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">@{d.authorName}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {userMapDeals.length === 0 && (
                  <div className="py-6 text-center text-muted-foreground text-xs">
                    還沒有貼文標註位置，分享優惠時填入地址即會出現在這
                  </div>
                )}
              </div>
            </div>

            {/* 來自爬蟲 */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> 附近店家優惠（{scrapedNearby.length}）
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-xs text-primary font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "更新中..." : "重新整理"}
                </button>
              </div>
              {scrapedFetchedAt && (
                <p className="text-[10px] text-muted-foreground px-1 mb-2">
                  整合自優惠店家公開優惠資訊 · 更新於{" "}
                  {formatDistanceToNow(new Date(scrapedFetchedAt), { addSuffix: true, locale: zhTW })}
                </p>
              )}
              <div className="space-y-2">
                {scrapedNearby.map((d) => (
                  <div key={d.id} className="flex gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/30 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-tertiary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{d.description}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">📍 {d.address}</p>
                      <div className="flex gap-1 mt-1 items-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">{d.store}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{d.source}</span>
                        {d.url && (
                          <a href={d.url} target="_blank" rel="noreferrer" className="ml-auto text-[10px] text-primary flex items-center gap-0.5">
                            原文 <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {scrapedNearby.length === 0 && (
                  <div className="py-6 text-center text-muted-foreground text-xs">沒有符合的店家</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* === 收藏與常去店家優惠 === */}
        {tab === "frequent" && (
          <>
            <div className="p-3 rounded-2xl bg-tertiary/30 text-xs text-muted-foreground">
              💡 根據你本月的消費習慣 + 收藏的店家，推薦相關優惠
            </div>

            {/* 收藏的優惠 */}
            {favoriteDeals.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 px-1 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5" /> 我收藏的優惠
                </p>
                <div className="space-y-2">
                  {favoriteDeals.map((d) => (
                    <DealCard
                      key={d.id}
                      d={d}
                      isMine={d.authorId === user?.id}
                      isFav
                      onLike={() => likeDeal(d.id)}
                      onFav={() => toggleFavoriteDeal(d.id)}
                      onDelete={() => confirm("刪除？") && deleteDeal(d.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 常去店家清單（可加入收藏） */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 px-1">
                你的常去店家（本月）
              </p>
              {frequentStores.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  還沒有店家消費紀錄，記帳時選店家即可累積
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {frequentStores.map((s) => {
                    const fav = favoriteStores.includes(s.name);
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleFavoriteStore(s.name)}
                        className={`p-3 rounded-2xl border text-left ${
                          fav ? "bg-primary-soft border-primary/40" : "bg-card border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm">{s.name}</p>
                          <Star className={`w-4 h-4 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <p className="text-[11px] text-muted-foreground">本月去 {s.count} 次</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 對應的優惠 */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 px-1">
                常去店家有這些優惠
              </p>
              {frequentDeals.length > 0 ? (
                <div className="space-y-2">
                  {frequentDeals.map((d) => (
                    <DealCard
                      key={d.id}
                      d={d}
                      isMine={d.authorId === user?.id}
                      isFav={favoriteDealIds.includes(d.id)}
                      onLike={() => likeDeal(d.id)}
                      onFav={() => toggleFavoriteDeal(d.id)}
                      onDelete={() => confirm("刪除？") && deleteDeal(d.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  你常去的店家目前還沒有相關優惠
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function DealCard({
  d, isMine, isFav, onLike, onFav, onDelete,
}: {
  d: ReturnType<typeof useAppStore.getState>["deals"][number];
  isMine: boolean;
  isFav: boolean;
  onLike: () => void;
  onFav: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
      {d.photo && <img src={d.photo} alt={d.title} className="w-full h-40 object-cover" />}
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
          <div className="flex flex-col gap-1">
            <button onClick={onFav} className="p-1 rounded text-muted-foreground">
              {isFav ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
            </button>
            {isMine && (
              <>
                <Link to="/deals/edit/$id" params={{ id: d.id }} className="p-1 rounded text-muted-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button onClick={onDelete} className="p-1 rounded text-muted-foreground">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
        {d.url && (
          <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2">
            查看詳情 <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">分享：{d.authorName}</span>
          <button onClick={onLike} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
            <Heart className="w-3.5 h-3.5" /> {d.likes}
          </button>
        </div>
      </div>
    </div>
  );
}

// 模擬地圖：把優惠店家以位置散點呈現（高雄市 燕巢/大社/岡山/楠梓）
type Pin = { id: string; store: string; lat: number; lng: number; kind: "post" | "scraped" };
function MapView({ pins }: { pins: Pin[] }) {
  const [scale, setScale] = useState(1);
  if (pins.length === 0) {
    return (
      <div className="h-56 rounded-3xl bg-[linear-gradient(135deg,#E8F0E4_0%,#DDEAF0_100%)] border border-border/60 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          目前沒有可顯示的店家位置
        </div>
      </div>
    );
  }
  // 高雄北部四區的經緯度範圍（岡山在西北、燕巢在東北、楠梓在西南、大社在東南）
  const minLat = 22.715, maxLat = 22.810;
  const minLng = 120.275, maxLng = 120.385;
  const span = (n: number, min: number, max: number) =>
    max === min ? 50 : ((n - min) / (max - min)) * 100;

  return (
    <div className="relative h-72 rounded-3xl overflow-hidden border border-border/60 shadow-soft bg-[#E8EEE4]">
      {/* 可縮放層 */}
      <div
        className="absolute inset-0 origin-center transition-transform duration-200"
        style={{ transform: `scale(${scale})` }}
      >
      {/* 仿地圖底圖：水域 / 綠地 / 道路 */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {/* 綠地公園色塊 */}
        <path d="M0 0 L120 0 L150 50 L90 110 L0 80 Z" fill="#CFE0BD" opacity="0.85" />
        <path d="M260 220 L400 200 L400 300 L240 300 Z" fill="#CFE0BD" opacity="0.85" />
        <circle cx="320" cy="80" r="32" fill="#CFE0BD" opacity="0.85" />
        {/* 街區地塊 */}
        <g fill="#F2F1EA" opacity="0.7">
          <rect x="40" y="20" width="50" height="40" rx="4" />
          <rect x="160" y="40" width="60" height="50" rx="4" />
          <rect x="240" y="20" width="40" height="50" rx="4" />
          <rect x="40" y="120" width="70" height="50" rx="4" />
          <rect x="160" y="120" width="50" height="50" rx="4" />
          <rect x="240" y="120" width="60" height="40" rx="4" />
          <rect x="320" y="140" width="60" height="50" rx="4" />
        </g>
        {/* 主幹道（粗白線描邊） */}
        <g stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round">
          <line x1="0" y1="100" x2="400" y2="115" />
          <line x1="0" y1="180" x2="400" y2="185" />
          <line x1="130" y1="0" x2="145" y2="300" />
          <line x1="300" y1="0" x2="315" y2="300" />
        </g>
        {/* 道路黃色中線 */}
        <g stroke="#E8C760" strokeWidth="1.2" strokeDasharray="6 4" fill="none">
          <line x1="0" y1="100" x2="400" y2="115" />
          <line x1="0" y1="180" x2="400" y2="185" />
          <line x1="130" y1="0" x2="145" y2="300" />
          <line x1="300" y1="0" x2="315" y2="300" />
        </g>
        {/* 次要道路 */}
        <g stroke="#FFFFFF" strokeWidth="3" fill="none">
          <line x1="0" y1="50" x2="400" y2="55" />
          <line x1="0" y1="240" x2="400" y2="245" />
          <line x1="60" y1="0" x2="65" y2="300" />
          <line x1="220" y1="0" x2="230" y2="300" />
        </g>
      </svg>

      {/* 區域標籤（高雄四區） */}
      <div className="absolute top-3 left-3 text-[10px] font-bold text-foreground/70 px-2 py-0.5 rounded bg-card/70">岡山區</div>
      <div className="absolute top-3 right-3 text-[10px] font-bold text-foreground/70 px-2 py-0.5 rounded bg-card/70">燕巢區</div>
      <div className="absolute bottom-12 left-3 text-[10px] font-bold text-foreground/70 px-2 py-0.5 rounded bg-card/70">楠梓區</div>
      <div className="absolute bottom-12 right-3 text-[10px] font-bold text-foreground/70 px-2 py-0.5 rounded bg-card/70">大社區</div>

      {/* 阿公店水庫：燕巢西側、靠近燕巢區中心 */}
      <div className="absolute z-10" style={{ left: "58%", top: "14%" }}>
        <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-7 rounded-[40%] bg-[#7FB6CC] border border-card shadow-soft" />
          <p className="text-[9px] font-bold text-[#2C5566] mt-0.5 whitespace-nowrap">阿公店水庫</p>
        </div>
      </div>

      {/* 主要地標 */}
      {[
        { name: "岡山火車站", left: "16%", top: "38%", icon: "🚉" },
        { name: "楠梓加工區", left: "20%", top: "78%", icon: "🏭" },
        { name: "大社觀音山", left: "80%", top: "75%", icon: "⛰️" },
        { name: "岡山醫院", left: "12%", top: "18%", icon: "🏥" },
      ].map((lm) => (
        <div
          key={lm.name}
          className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: lm.left, top: lm.top }}
        >
          <span className="text-base leading-none">{lm.icon}</span>
          <span className="text-[9px] text-foreground/70 mt-0.5 whitespace-nowrap bg-card/70 px-1 rounded">
            {lm.name}
          </span>
        </div>
      ))}

      {/* 優惠店家標示（固定展示） */}
      {[
        { name: "全聯", left: "28%", top: "28%", icon: "🏪" },
        { name: "7-11", left: "72%", top: "20%", icon: "🏪" },
        { name: "全家", left: "22%", top: "22%", icon: "🏪" },
        { name: "星巴克", left: "48%", top: "32%", icon: "☕" },
        { name: "麥當勞", left: "75%", top: "68%", icon: "🍟" },
        { name: "屈臣氏", left: "18%", top: "82%", icon: "💊" },
        { name: "萊爾富", left: "68%", top: "16%", icon: "🏪" },
      ].map((s) => (
        <div
          key={s.name}
          className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: s.left, top: s.top }}
        >
          <span className="text-base leading-none">{s.icon}</span>
          <span className="text-[9px] text-foreground/80 mt-0.5 whitespace-nowrap bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded-full border border-primary/30">
            {s.name}
          </span>
        </div>
      ))}

      {/* 「我的位置」：燕巢區（右上） */}
      <div className="absolute right-[22%] top-[24%] z-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full bg-tertiary/40 animate-ping" />
          <div className="relative w-3.5 h-3.5 rounded-full bg-tertiary border-2 border-card shadow-soft" />
        </div>
        <p className="text-[9px] font-bold text-tertiary-foreground mt-1 text-center whitespace-nowrap">我的位置</p>
      </div>

      {pins.map((d) => {
        const left = span(d.lng, minLng, maxLng);
        const top = 100 - span(d.lat, minLat, maxLat);
        const color = d.kind === "post" ? "text-destructive" : "text-primary";
        return (
          <div key={d.id} className="absolute -translate-x-1/2 -translate-y-full z-20" style={{ left: `${left}%`, top: `${top}%` }}>
            <div className="flex flex-col items-center">
              <div className="bg-card text-[10px] font-bold px-2 py-0.5 rounded-full shadow-soft mb-1 whitespace-nowrap max-w-[100px] truncate">
                {d.store}
              </div>
              <MapPin className={`w-7 h-7 drop-shadow-md ${color}`} fill="currentColor" />
            </div>
          </div>
        );
      })}
      </div>

      {/* 縮放控制（可運作） */}
      <div className="absolute top-3 right-3 z-30 flex flex-col rounded-lg overflow-hidden shadow-soft bg-card/95 text-foreground">
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}
          disabled={scale >= 3}
          aria-label="放大"
          className="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <ZoomPlus className="w-4 h-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(1, +(s - 0.25).toFixed(2)))}
          disabled={scale <= 1}
          aria-label="縮小"
          className="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <ZoomMinus className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-card/90 px-2 py-1 rounded-lg flex items-center gap-2 shadow-soft z-30">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />用戶分享</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />優惠店家</span>
      </div>
    </div>
  );
}
