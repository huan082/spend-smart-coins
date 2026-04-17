import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6">
      <div className="relative w-full max-w-[420px] md:max-w-[400px] md:rounded-[2.5rem] md:shadow-float md:border-[10px] md:border-foreground/80 bg-background overflow-hidden md:h-[860px] min-h-screen md:min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
