"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

export function RouteThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-route-theme-transition");

    const frameId = requestAnimationFrame(() => {
      root.classList.remove("no-route-theme-transition");
    });

    return () => {
      cancelAnimationFrame(frameId);
      root.classList.remove("no-route-theme-transition");
    };
  }, [pathname]);

  let themeClass = "";

  if (pathname.includes("/docs")) {
    themeClass = "theme-docs";
  } else if (pathname.includes("/slides")) {
    themeClass = "theme-slides";
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-background text-foreground ${themeClass}`}
    >
      {children}
    </div>
  );
}
