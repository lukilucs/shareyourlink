import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center pb-12">
      <div className="max-w-4xl mx-auto w-full px-4">
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-primary/10">
            <span className="text-7xl font-bold text-primary">404</span>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 text-center mb-12 md:mb-16">
          <div>
            <h1 className="text-5xl font-bold mb-4">{t("title")}</h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t("message")}
            </p>
          </div>

          <div className="pt-4 md:pt-6">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 border border-transparent text-2xl font-medium rounded-md text-white bg-primary hover:bg-primary/80 transition-colors shadow-md hover:shadow-lg"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
