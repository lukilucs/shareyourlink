"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageDropdown() {
  const t = useTranslations("LanguageDropdown");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const languages = [
    { code: "en", name: t("languageEN") },
    { code: "es", name: t("languageES") },
  ];
  const currentLanguageName =
    languages.find((l) => l.code === locale)?.name ||
    languages[0]?.name ||
    "ES";

  const onSelectLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 text-xl"
          size="sm"
        >
          {currentLanguageName}
          <ChevronsUpDown className="size-4 opacity-75" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="min-w-0 w-(--radix-dropdown-menu-trigger-width)"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            aria-checked={lang.code === locale}
            className={cn(
              "cursor-pointer justify-center text-xl",
              lang.code === locale &&
                "bg-accent text-accent-foreground font-bold",
            )}
            onClick={() => onSelectLocale(lang.code)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
