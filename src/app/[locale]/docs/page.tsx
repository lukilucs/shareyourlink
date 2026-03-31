import Menu from "@/components/interface/menu";
import TestOthers from "@/components/test-others";
import { useTranslations } from "next-intl";

export default function Docs() {
  const tLanding = useTranslations("Landing");
  const tDocs = useTranslations("DocsPage");

  return (
    <>
      <section className="flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center pb-10 md:pb-12  ">
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-center">
            {tLanding("title")} <span className="text-primary">Docs</span>
          </h1>
          <p className="text-2xl md:text-3xl text-center max-w-2xl mx-auto px-4">
            {tDocs("description")}
          </p>
        </div>
        <div className="pt-8 md:pt-10">
          <Menu />
        </div>
      </section>
      <TestOthers page="docs" />
    </>
  );
}
