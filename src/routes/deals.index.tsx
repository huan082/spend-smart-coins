import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Plus, Heart, Pencil, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

export const Route = createFileRoute("/deals/")({
  component: DealsPage,
  head: () => ({ meta: [{ title: "優惠探索" }] }),
});

function DealsPage() {
  const { deals, user, likeDeal, deleteDeal } = useAppStore();
  const [q, setQ] = useState("");

  const list = deals.filter(
    (d) =>
      !q ||
      d.title.includes(q) ||
      d.store.includes(q) ||
      d.description.includes(q)
  );

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

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋商家或優惠..."
          className="w-full px-4 py-2.5 rounded-2xl bg-card border border-border outline-none text-sm shadow-soft"
        />

        {list.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-3xl bg-card border border-border/60 shadow-soft"
          >
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
              </div>
              {d.authorId === user?.id && (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/deals/edit/$id"
                    params={{ id: d.id }}
                    className="p-1 rounded text-muted-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => confirm("刪除？") && deleteDeal(d.id)}
                    className="p-1 rounded text-muted-foreground"
                  >
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
                onClick={() => likeDeal(d.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Heart className="w-3.5 h-3.5" /> {d.likes}
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">沒有找到優惠</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
