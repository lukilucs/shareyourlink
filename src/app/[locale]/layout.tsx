import type { Metadata } from "next";
import { vt323 } from "@/app/fonts/fonts";
import "./globals.css";

// Translations
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";

// Components
import { ThemeProvider } from "@/components/theme/theme-provider";
import { RouteThemeWrapper } from "@/components/theme/section-theme-provider";
import { TopBar } from "@/components/navigation/topbar";
import { NavBar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    applicationName: "ShareYourLinks",
    appleWebApp: {
      title: "ShareYourLinks",
      statusBarStyle: "default",
    },
    alternates: {
      canonical: locale === "en" ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        en: baseUrl,
        es: `${baseUrl}/es`,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: "ShareYourLinks",
      description:
        "Moving a URL from one device to another shouldn't be hard. Drop a link, get a code, and stay in flow.",
      images: [
        {
          url: "/og.png", // Next.js automatically prepends your domain
          width: 1200,
          height: 630,
          alt: "Site preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "ShareYourLinks",
      description:
        "Moving a URL from one device to another shouldn't be hard. Drop a link, get a code, and stay in flow.",
      images: ["/og.png"],
    },
  };
}

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
    <html lang={locale} suppressHydrationWarning>
      {/* Añadimos font-sans aquí */}
      <body className={`${vt323.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RouteThemeWrapper>
              <TopBar />
              <NavBar />
              {children}
              <Footer />
            </RouteThemeWrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
