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
  useEffect(() => {
    document.documentElement.dataset.theme = currentTheme;
  }, [currentTheme]);
  if (requireAuth && !user) return <Navigate to="/login" />;

  return (
    <PhoneFrame>
      {!hideHeader && <AppHeader title={title} back={back} right={right} />}
      <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>
      {!hideNav && <BottomNav />}
    </PhoneFrame>
  );
}
