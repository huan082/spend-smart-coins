import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const user = useAppStore((s) => s.user);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  if (!hasHydrated) {
    return (
      <PhoneFrame>
        <div className="flex-1" />
      </PhoneFrame>
    );
  }
  return <Navigate to={user ? "/home" : "/login"} />;
}
