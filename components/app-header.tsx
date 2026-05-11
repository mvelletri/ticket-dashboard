"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./nav";
import { LogoutButton } from "./logout-button";

export function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-screen-xl mx-auto w-full px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white text-xs font-bold select-none">PV</span>
          <h1 className="text-sm font-semibold text-zinc-900 hidden sm:block">Dashboard Pós-vendas</h1>
        </div>
        <Nav />
        <div className="flex items-center gap-2">
          <div className="w-px h-5 bg-zinc-200" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
