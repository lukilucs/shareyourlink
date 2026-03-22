import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CreateLinkForm from "@/components/interface/create-link-form";

interface CreatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CreatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CreatePage" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const CreatePage = async () => {
  const t = await getTranslations("CreatePage");

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
        <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
          <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
            +
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {t("title")}
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-foreground leading-relaxed max-w-4xl">
          {t("description")}
        </p>

        <CreateLinkForm />
      </div>
    </section>
  );
};

export default CreatePage;
