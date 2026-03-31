"use client";

import { Logo } from "../logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const pathname = usePathname();
  const getHomePath = () => {
    if (pathname.includes("/docs")) return { path: "/docs", label: "Docs" };
    if (pathname.includes("/slides"))
      return { path: "/slides", label: "Slides" };
    return { path: "/", label: "" };
  };
  const homePath = getHomePath();

  return (
    <>
      <nav className="w-full flex justify-center pt-5 pb-8">
        <Link
          href={homePath.path}
          className="transition-transform duration-300 ease-out hover:scale-[1.02]"
        >
          <Logo size="3xl" sizeMd="6xl" />
        </Link>
      </nav>
      <div className="mx-auto w-4/5 border-b-2 border-primary"></div>
    </>
  );
};
