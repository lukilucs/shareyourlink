import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface TestOthersProps {
  page?: "link" | "docs" | "slides";
}

const TestOthers = ({ page = "link" }: TestOthersProps) => {
  const t = useTranslations("TestOthers");

  return (
    <section className="pb-8">
      <div className="mx-auto w-4/5 border-b-2 border-primary"></div>
      <div className="container mx-auto pt-8 px-6 max-w-6xl space-y-8 md:space-y-10">
        <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
          <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
            !
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {t("title")}
          </h2>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-2xl md:text-3xl text-foreground leading-relaxed">
            {t("description")}
          </p>

          <div className="relative group flex flex-col md:flex-row items-center justify-center gap-10 md:gap-15 lg:gap-20 py-4 md:py-8">
            {page !== "link" && (
              <Button
                className="w-90 relative bg-[#1f7a43]! text-[#f4fff7]! z-10 h-auto text-3xl md:text-5xl px-8 py-4 font-black uppercase italic hover:scale-105 transition-transform duration-300"
                asChild
              >
                <Link href="/">{t("link")}</Link>
              </Button>
            )}

            {page !== "docs" && (
              <Button
                className="w-90 relative bg-[#1d4ed8]! text-[#f0f5ff]! z-10 h-auto text-3xl md:text-5xl px-8 py-4 font-black uppercase italic hover:scale-105 transition-transform duration-300"
                asChild
              >
                <Link href="/docs">{t("docs")}</Link>
              </Button>
            )}

            {page !== "slides" && (
              <Button
                className="w-90 relative bg-[#f0be42]! text-[#fffcf5]! z-10 h-auto text-3xl md:text-5xl px-8 py-4 font-black uppercase italic hover:scale-105 transition-transform duration-300"
                asChild
              >
                <Link href="/slides">{t("slides")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestOthers;
