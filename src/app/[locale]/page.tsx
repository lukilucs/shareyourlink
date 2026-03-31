import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

import Menu from "@/components/interface/menu";
import TestOthers from "@/components/test-others";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const baseUrl = "https://shareyourlinks.app";
  const localePath = locale === "en" ? "" : `/${locale}`;
  const canonical = `${baseUrl}${localePath}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      siteName: "ShareYourLinks",
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Home() {
  const t = useTranslations("Landing");

  return (
    <>
      <section className="flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center md:pt-8 pb-10 md:pb-12 ">
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-center">
            {t("title")}
          </h1>
          <p className="text-2xl md:text-3xl text-center max-w-2xl mx-auto px-4">
            {t("description")}
          </p>
        </div>
        <div className="pt-8 md:pt-10">
          <Menu />
        </div>
      </section>
      <TestOthers page="link" />
    </>
  );
}
