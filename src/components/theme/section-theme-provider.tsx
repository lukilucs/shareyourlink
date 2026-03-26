"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

export function RouteThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  let themeClass = "";

  if (pathname.includes("/docs")) {
    themeClass = "theme-docs";
  } else if (pathname.includes("/slides")) {
    themeClass = "theme-slides";
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 ${themeClass}`}
    >
      {children}
    </div>
  );
}
