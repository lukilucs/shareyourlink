"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { type GetLinkActionState, getLinkByCode } from "@/actions/link-actions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const initialState: GetLinkActionState = {};

export default function GetLinkForm() {
  const t = useTranslations("GetPage");

  const [formKey, setFormKey] = useState(0);
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const [state, formAction, isPending] = useActionState(
    getLinkByCode,
    initialState,
  );

  const generatedLink = state.success && !isResultDismissed ? state.link : null;

  const showForm = !generatedLink;

  const handleReset = () => {
    setIsResultDismissed(true);
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {showForm ? (
        <form
          key={formKey}
          action={formAction}
          onSubmit={() => setIsResultDismissed(false)}
          className="space-y-4"
        >
          <label
            htmlFor="code"
            className="block text-2xl md:text-3xl font-bold"
          >
            {t("inputLabel")}
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            className="w-full uppercase placeholder:normal-case border-4 border-primary/20 bg-background px-4 py-3 text-xl md:text-2xl outline-none transition-colors focus:border-primary"
            placeholder={t("placeholder")}
          />
          <Button
            type="submit"
            disabled={isPending}
            className="h-auto w-full px-6 py-4 text-2xl md:text-3xl font-black uppercase transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>

          {!state.success && state.error && (
            <p className="text-destructive text-xl md:text-2xl font-bold">
              {state.error}
            </p>
          )}
        </form>
      ) : (
        <>
          <section className="border-4 border-primary bg-secondary/30 p-5 md:p-6 space-y-4">
            <p className="text-2xl md:text-4xl font-bold uppercase">
              {t("successTitle")}:
            </p>

            <div className="flex items-center">
              <Link
                href={generatedLink}
                rel="noopener noreferrer"
                className="text-3xl md:text-5xl font-black text-primary underline transition-transform duration-300 hover:text-primary/80"
              >
                {generatedLink}
              </Link>

              <Link
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block group ml-10 h-auto w-auto border-5 border-primary p-1 rotate-13 transition-transform duration-300 hover:scale-120 hover:rotate-0"
              >
                <p className="-rotate-13 transition-transform duration-300 group-hover:rotate-0 text-3xl md:text-5xl font-black text-primary">
                  &minus;&gt;
                </p>
              </Link>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-auto px-5 py-3 text-xl md:text-2xl font-bold transition-transform duration-300 ease-out hover:scale-[1.05] hover:bg-card"
            >
              {t("resetButton")}
            </Button>
          </section>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t("disclaimer")}
          </p>
        </>
      )}
    </div>
  );
}
