import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore, getMonthRange } from "@/store/useAppStore";
import { useState, useMemo } from "react";
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
      ...userMapDeals.map((d) => ({ id: d.id, store: d.store, lat: d.lat!, lng: d.lng!, kind: "post" as const })),
      ...scrapedNearby.map((d) => ({ id: d.id, store: d.store, lat: d.lat, lng: d.lng, kind: "scraped" as const })),
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
                  {refreshing ? "爬取中..." : "重新爬取"}
                </button>
              </div>
              {scrapedFetchedAt && (
                <p className="text-[10px] text-muted-foreground px-1 mb-2">
                  資料來源：店家官網爬蟲 · 更新於{" "}
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

// 模擬地圖：把優惠店家以位置散點呈現
type Pin = { id: string; store: string; lat: number; lng: number; kind: "post" | "scraped" };
function MapView({ pins }: { pins: Pin[] }) {
  if (pins.length === 0) {
    return (
      <div className="h-56 rounded-3xl bg-gradient-cool/30 border border-border/60 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          目前沒有可顯示的店家位置
        </div>
      </div>
    );
  }
  const lats = pins.map((d) => d.lat);
  const lngs = pins.map((d) => d.lng);
  const minLat = Math.min(...lats) - 0.005;
  const maxLat = Math.max(...lats) + 0.005;
  const minLng = Math.min(...lngs) - 0.005;
  const maxLng = Math.max(...lngs) + 0.005;
  const span = (n: number, min: number, max: number) =>
    max === min ? 50 : ((n - min) / (max - min)) * 100;

  return (
    <div className="relative h-64 rounded-3xl overflow-hidden border border-border/60 shadow-soft bg-[linear-gradient(135deg,#E8EDE4_0%,#DDE5E8_100%)]">
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#9DB4C0" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 12.5}%`} y1="0" x2={`${i * 12.5}%`} y2="100%" stroke="#9DB4C0" strokeWidth="0.5" />
        ))}
      </svg>

      {/* 中心標示「我的位置」 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-tertiary border-2 border-card shadow-soft animate-pulse" />
        <p className="text-[9px] font-bold text-tertiary-foreground mt-1 -translate-x-3">我的位置</p>
      </div>

      {pins.map((d) => {
        const left = span(d.lng, minLng, maxLng);
        const top = 100 - span(d.lat, minLat, maxLat);
        const color = d.kind === "post" ? "text-destructive" : "text-primary";
        return (
          <div key={d.id} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${left}%`, top: `${top}%` }}>
            <div className="flex flex-col items-center">
              <div className="bg-card text-[10px] font-bold px-2 py-0.5 rounded-full shadow-soft mb-1 whitespace-nowrap max-w-[100px] truncate">
                {d.store}
              </div>
              <MapPin className={`w-7 h-7 drop-shadow ${color}`} fill="currentColor" />
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-card/80 px-2 py-0.5 rounded flex items-center gap-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />貼文</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />爬蟲</span>
      </div>
    </div>
  );
}
