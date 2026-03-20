import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface HowPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HowPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HowItWorks" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const HowItWorks = () => {
  const t = useTranslations("HowItWorks");
  return (
    <>
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
          <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
            <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
              ?
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              {t("section1Title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="relative group">
              <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
                {t("section1Description1Title")}
              </span>
              <div className="relative z-10 space-y-4">
                <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  {t("section1Description1Title")}
                </h3>
                <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                  {t("section1Description1Description")}
                  <span className="text-primary font-semibold underline decoration-2">
                    {t("section1Description1DescriptionHighlight")}
                  </span>{" "}
                  {t("section1Description1Description2")}
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
                {t("section1Description2Title")}
              </span>
              <div className="relative z-10 space-y-4">
                <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  {t("section1Description2Title")}
                </h3>
                <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                  {t("section1Description2Description")}
                  <span className="text-primary font-semibold underline decoration-2">
                    {t("section1Description2DescriptionHighlight")}
                  </span>{" "}
                  {t("section1Description2Description2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
          <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
            <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
              !
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              {t("section2Title")}
            </h2>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              {t("section2Description1")}
              <br />
              {t("section2Description2")}
            </p>

            <div className="relative group flex flex-col items-center justify-center py-2 mb:py-5">
              <Button className="relative z-10 h-auto text-2xl md:text-4xl px-8 py-4 font-black uppercase italic hover:scale-105 transition-transform">
                {t("section2Button")}
              </Button>
            </div>

            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              {t("section2Description3")}
              <Link
                href="https://github.com/lukilucs/shareyourlink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {t("section2Description3Highlight")}
              </Link>
            </p>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {t("section2Description4")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;
