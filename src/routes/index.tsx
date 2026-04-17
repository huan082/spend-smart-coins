import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const user = useAppStore((s) => s.user);
  return <Navigate to={user ? "/home" : "/login"} />;
}
