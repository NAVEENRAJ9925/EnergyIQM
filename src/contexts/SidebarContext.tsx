import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarState = {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  desktopExpandedWidthPx: number;
  desktopCollapsedWidthPx: number;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const desktopExpandedWidthPx = 240;
  const desktopCollapsedWidthPx = 70;

  const [collapsed, setCollapsed] = useState(true);

  // Auto-collapse when leaving desktop (lg+). Mobile/tablet use drawer.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (!mql.matches) setCollapsed(true);
    };
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, desktopExpandedWidthPx, desktopCollapsedWidthPx }),
    [collapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

