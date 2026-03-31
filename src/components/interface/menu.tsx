"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Menu = () => {
  const t = useTranslations("Menu");
  let pathname = usePathname();

  if (pathname === "/") {
    pathname = "";
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 p-8 pt-0 w-full max-w-7xl mx-auto">
      <Button
        asChild
        className="w-full md:flex-1 min-w-70 md:min-w-[320px] h-30 md:h-50  p-8 text-5xl lg:text-7xl font-black uppercase tracking-wider leading-none text-center whitespace-normal wrap-break-words shadow-lg bg-linear-to-br from-primary to-primary/80 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] active:translate-y-0 active:scale-95"
      >
        <Link href={`${pathname}/create`}>{t("createLink")}</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="w-full md:flex-1 min-w-70 md:min-w-[320px] h-30 md:h-50  p-8 text-5xl lg:text-7xl font-black uppercase tracking-wider leading-none text-center whitespace-normal wrap-break-words border-4 border-primary/20 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:bg-accent/50 hover:border-primary/50 hover:scale-[1.02] active:translate-y-0 active:scale-95"
      >
        <Link href={`${pathname}/get`}>{t("getLink")}</Link>
      </Button>
    </div>
  );
};

export default Menu;
