import { Link, useLocation } from "@tanstack/react-router";
import { Home, Wallet, PiggyBank, Tag, User } from "lucide-react";

const items = [
  { to: "/home", label: "首頁", icon: Home },
  { to: "/ledger", label: "記帳", icon: Wallet },
  { to: "/plan", label: "預算&目標", icon: PiggyBank },
  { to: "/deals", label: "優惠", icon: Tag },
  { to: "/me", label: "我的", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border shadow-soft z-40">
      <div className="grid grid-cols-5 px-2 py-1.5 pb-3">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors"
            >
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-all ${
                  active ? "bg-primary-soft" : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.4 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
