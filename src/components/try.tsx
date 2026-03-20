import React from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

const Try = () => {
  const t = useTranslations("HowItWorks");
  return (
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
        </div>
      </div>
    </section>
  );
};

export default Try;
