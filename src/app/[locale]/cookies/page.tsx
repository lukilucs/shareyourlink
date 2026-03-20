import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";

interface CookiesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CookiesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const BrowserLink = ({ name, href }: { name: string; href: string }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-primary hover:text-foreground underline transition-colors border-b border-transparent pb-1"
  >
    {name}
  </Link>
);

export default function CookiesPage() {
  const t = useTranslations("Cookies");

  const cookiesList = [
    {
      name: t("c_tech_name"),
      type: t("c_tech_type"),
      desc: t("c_tech_desc"),
    },
    {
      name: t("c_umami_name"),
      type: t("c_umami_type"),
      desc: t("c_umami_desc"),
    },
    {
      name: t("c_security_name"),
      type: t("c_security_type"),
      desc: t("c_security_desc"),
    },
  ];

  return (
    <>
      <div className="mx-auto px-6 max-w-6xl pt-8 md:pt-10">
        <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
          <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
            C
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {t("title")}
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <section className="pb-10 md:pb-12">
        <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
          <div className="relative group mt-10 md:mt-12 mb-8 md:mb-10">
            <span className="hidden md:block text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
              {t("what_is_title")}
            </span>
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                {t("what_is_title")}
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                {t("what_is_text")}
              </p>
            </div>
          </div>

          <div>
            <div className="relative group mt-10 md:mt-12 mb-8 md:mb-10">
              <span className="hidden md:block text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
                {t("types_title")}
              </span>
              <div className="relative z-10 space-y-4">
                <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  {t("types_title")}
                </h3>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  {t("types_intro")}
                </p>
              </div>
            </div>

            <div className="border-2 border-border/60">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-border/60 bg-muted/40 text-xl md:text-2xl font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-4 ">{t("th_name")}</div>
                <div className="col-span-3">{t("th_type")}</div>
                <div className="col-span-5">{t("th_purpose")}</div>
              </div>

              {cookiesList.map((cookie, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-6 border-b border-border/30 last:border-0 items-start md:items-center text-xl md:text-2xl"
                >
                  <div className="col-span-4 font-black tracking-tight text-foreground">
                    {cookie.name}
                  </div>

                  <div className="col-span-3">
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-bold text-primary uppercase tracking-wider text-sm md:text-xl">
                      {cookie.type}
                    </span>
                  </div>

                  <div className="col-span-5 text-muted-foreground leading-relaxed">
                    {cookie.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 p-6 md:p-8 border-l-4 border-primary">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              {t("analytics_title")}
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {t("analytics_text")}
            </p>
          </div>

          <div className="relative group mt-10 md:mt-12">
            <span className="hidden md:block text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
              {t("manage_title")}
            </span>
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                {t("manage_title")}
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                {t("manage_text")}
              </p>
              <div className="flex flex-wrap gap-4 font-bold uppercase tracking-wider text-xl md:text-2xl">
                <BrowserLink
                  name={t("manage_chrome")}
                  href="https://support.google.com/chrome/answer/95647"
                />
                <BrowserLink
                  name={t("manage_safari")}
                  href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                />
                <BrowserLink
                  name={t("manage_firefox")}
                  href="https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
