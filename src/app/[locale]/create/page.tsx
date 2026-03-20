import Menu from "@/components/interface/menu";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Landing");

  return (
    <>
      <section className="flex flex-col justify-center min-h-[calc(100dvh-5.5rem)]">
        <div>
          <div className="mx-auto w-4/5 border-b-2 border-primary"></div>
          <h1 className="text-6xl md:text-8xl font-bold text-center py-8">
            {t("title")}
          </h1>
          <p className="text-2xl md:text-2xl text-center mb-15 max-w-2xl mx-auto px-4">
            {t("description")}
          </p>
        </div>
        <Menu />
      </section>

      {/* Sección: How does it work */}
      <section className="pt-15 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header de la sección */}
          <div className="flex items-center gap-6 mb-15 border-b-4 border-primary pb-4">
            <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
              ?
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              How does it work
            </h2>
          </div>

          {/* Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {/* Paso 1 */}
            <div className="relative group">
              <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
                CREATE LINK
              </span>
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                  CREATE LINK
                </h3>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Paste your link, you will get a{" "}
                  <span className="text-primary font-semibold underline decoration-2">
                    unique code
                  </span>{" "}
                  that you can share with others. Easy and fast, no bullshit.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative group">
              <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
                GET LINK
              </span>
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                  GET LINK
                </h3>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Paste the code you got and you will get the{" "}
                  <span className="text-primary font-semibold underline decoration-2">
                    original link
                  </span>{" "}
                  instantly. Just share and retrieve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
