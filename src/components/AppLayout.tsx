import { ReactNode, useEffect, useState } from "react";
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

// Module-level hydration flag — only true once after the first client mount,
// so subsequent route changes don't re-trigger a blank "hydrating" frame.
let didHydrate = false;

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
  const [hydrated, setHydrated] = useState(didHydrate);
  useEffect(() => {
    didHydrate = true;
    setHydrated(true);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = currentTheme;
  }, [currentTheme]);
  if (!hydrated || !hasHydrated) {
    return (
      <PhoneFrame>
        <div className="flex-1" />
      </PhoneFrame>
    );
  }
  if (requireAuth && !user) return <Navigate to="/login" />;

  return (
    <PhoneFrame>
      {!hideHeader && <AppHeader title={title} back={back} right={right} />}
      <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>
      {!hideNav && <BottomNav />}
    </PhoneFrame>
  );
}
