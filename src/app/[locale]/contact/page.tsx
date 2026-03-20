import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

//Components
import Try from "@/components/try";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const ContactPage = () => {
  const t = useTranslations("ContactPage");

  return (
    <>
      <section className="pt-10 md:pt-12">
        <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
          <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
            <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
              @
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              {t("title")}
            </h1>
          </div>

          <div>
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              {t("description")}
            </p>
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              {t("body")}{" "}
              <a
                className="text-primary underline"
                href="mailto:hello@shareyourlink.app"
              >
                hello@shareyourlink.app
              </a>
              .
            </p>
          </div>
        </div>
      </section>
      <Try />
    </>
  );
};

export default ContactPage;
