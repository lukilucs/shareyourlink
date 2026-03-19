import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";

// Translations
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";

// Components
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TopBar } from "@/components/navigation/topbar";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Metadata
type ParamsType = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: ParamsType;
}): Promise<Metadata> {
  const { locale } = await (params as Awaited<typeof params>);
  const messages = await getMessages({ locale });
  const t = (key: string) =>
    messages.Metadata?.[key as keyof typeof messages.Metadata] || key;
  const baseUrl = "https://shareyourlinks.app";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      template: `%s | ${t("title")}`,
      default: t("title"),
    },
    description: t("description"),
    alternates: {
      canonical: locale === "en" ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        en: baseUrl,
        es: `${baseUrl}/es`,
        "x-default": baseUrl,
      },
    },
  };
}

// Fonts
const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier-prime",
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale}>
      <body className={`${courierPrime.variable} antialiased`}>
        <NextIntlClientProvider>
          <ThemeProvider>
            <TopBar />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
