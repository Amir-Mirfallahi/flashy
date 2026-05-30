import { BottomNav } from "./BottomNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container min-h-dvh bg-slate-50 text-slate-950">
      <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-y-auto px-5 pb-28 pt-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
