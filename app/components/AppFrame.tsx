import { BottomNav } from "./BottomNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container min-h-dvh bg-slate-50 text-slate-950">
      <main className="mx-auto flex h-dvh w-full max-w-md scroll-pb-40 flex-col overflow-y-auto px-5 pb-[calc(10rem+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
