"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useTranslations } from "next-intl";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import PixelGithubIcon from "@/components/assets/githubLogo";

export const Footer = () => {
  const t = useTranslations("Footer");

  const links = [
    {
      group: t("sections.product"),
      items: [
        { title: t("links.create"), href: "/" },
        { title: t("links.howItWorks"), href: "/how-it-works" },
      ],
    },
    {
      group: t("sections.resources"),
      items: [{ title: t("links.cookies"), href: "/cookies" }],
    },
    {
      group: t("sections.contact"),
      items: [
        { title: t("links.contact"), href: "/contact" },
        {
          title: t("links.ideas"),
          href: "/contact/ideas",
        },
      ],
    },
  ];

  const socialLinks = [
    {
      label: t("social.github"),
      href: "https://github.com/lukilucs/shareyourlink",
      icon: PixelGithubIcon,
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/40 py-8 text-foreground">
      <div className="mx-auto mb-8 max-w-5xl border-b border-border/50 px-6 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="block size-fit">
            <Link href="/" aria-label="ShareYourLink - Home">
              <Logo size="2xl" sizeMd="3xl" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-lg">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="border border-border bg-background/80 p-2 text-muted-foreground duration-200 hover:text-primary hover:scale-105 transition-transform"
                >
                  <Icon className="size-6 md:size-8" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-5xl px-6 ">
          <div className="grid grid-cols-3 gap-8">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-4 text-lg md:items-start"
              >
                <span className="block text-xl font-bold tracking-wide text-foreground">
                  {link.group}
                </span>
                <div className="flex flex-col items-center space-y-3 md:items-start">
                  {link.items.map((item, idx) => (
                    <span key={idx}>
                      {item.href === "#" ? (
                        <a
                          href="#"
                          className="text-muted-foreground transition-colors duration-200 hover:text-primary hover:underline"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="text-muted-foreground transition-colors duration-200 hover:text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-border/50 pt-8 text-xl">
          <div className="order-first">
            <small className="block tracking-wide text-muted-foreground">
              <span className="text-muted-foreground">{t("builtBy")} </span>
              <span className="text-primary">
                <a
                  href="https://lucasreloj.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Lucas García
                </a>
              </span>
            </small>
          </div>

          <div className="flex gap-2">
            <LanguageDropdown />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};
