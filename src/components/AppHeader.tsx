import { Link } from "@tanstack/react-router";
import { Bell, Settings, ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  title: string;
  back?: string;
  right?: ReactNode;
  showIcons?: boolean;
}

export function AppHeader({ title, back, right, showIcons = true }: Props) {
  const points = useAppStore((s) => s.points);
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 min-w-0">
          {back && (
            <Link
              to={back}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-muted text-foreground"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="font-display font-bold text-lg truncate">{title}</h1>
        </div>
        {right ?? (showIcons && (
          <div className="flex items-center gap-1">
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-coin/15 text-coin-foreground mr-1">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold">{points}</span>
            </div>
            <Link
              to="/notifications"
              className="p-2 rounded-full hover:bg-muted text-foreground"
              aria-label="通知"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-muted text-foreground"
              aria-label="設定"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
    </header>
  );
}
