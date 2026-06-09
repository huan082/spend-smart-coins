import { ReactNode, useEffect } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";
import { AppHeader } from "./AppHeader";
import { useAppStore } from "@/store/useAppStore";
import { Navigate } from "@tanstack/react-router";

interface Props {
  title: string;
  children: ReactNode;
  back?: string;
  right?: ReactNode;
  hideNav?: boolean;
  hideHeader?: boolean;
  requireAuth?: boolean;
}

export function AppLayout({
  title,
  children,
  back,
  right,
  hideNav,
  hideHeader,
  requireAuth = true,
}: Props) {
  const user = useAppStore((s) => s.user);
  const currentTheme = useAppStore((s) => s.currentTheme);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const syncDueBills = useAppStore((s) => s.syncDueBills);
  useEffect(() => {
    document.documentElement.dataset.theme = currentTheme;
  }, [currentTheme]);
  useEffect(() => {
    if (hasHydrated && user) syncDueBills();
  }, [hasHydrated, user, syncDueBills]);
  // 只在「需要登入」且確定已水合卻沒有 user 時才導去登入頁；
  // 不再用 hasHydrated 來阻擋整頁渲染，避免每次切頁都閃一下。
  if (requireAuth && hasHydrated && !user) return <Navigate to="/login" />;

  return (
    <PhoneFrame>
      {!hideHeader && <AppHeader title={title} back={back} right={right} />}
      <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>
      {!hideNav && <BottomNav />}
    </PhoneFrame>
  );
}
