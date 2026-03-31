"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createSharedDoc } from "@/actions/doc-actions";
import { formatTimer, generateRandomRotations } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CreateDocActionState } from "@/types/doc";

const TIMER_SECONDS = 5 * 60;
const initialState: CreateDocActionState = {};
const rotations = generateRandomRotations(4, 5);

export default function CreateDocForm() {
  const t = useTranslations("CreateDocPage");

  const [formKey, setFormKey] = useState(0);
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const [state, formAction, isPending] = useActionState(
    createSharedDoc,
    initialState,
  );

  const [now, setNow] = useState<number>(() => Date.now());

  const generatedCode = state.success && !isResultDismissed ? state.code : null;
  const showForm = !generatedCode;

  const secondsLeft =
    state.success && !isResultDismissed
      ? Math.max(0, Math.ceil((state.expiresAt - now) / 1000))
      : TIMER_SECONDS;

  useEffect(() => {
    if (!generatedCode || secondsLeft <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [generatedCode, secondsLeft]);

  const timerLabel = useMemo(() => formatTimer(secondsLeft), [secondsLeft]);

  const handleReset = () => {
    setIsResultDismissed(true);
    setNow(Date.now());
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
          <label htmlFor="file" className="block text-2xl md:text-3xl font-bold">
            {t("inputLabel")}
          </label>

          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".pdf,.doc,.docx"
            className="w-full border-4 border-primary/20 bg-background px-4 py-3 text-xl md:text-2xl outline-none transition-colors file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:font-bold file:text-primary-foreground focus:border-primary"
          />

          <p className="text-base md:text-lg text-muted-foreground">
            {t("supportedFormats")}
          </p>

          <Button
            type="submit"
            disabled={isPending}
            className="h-auto w-full px-6 py-4 text-2xl md:text-3xl font-black uppercase transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>

          {!state.success && state.error && (
            <p className="text-destructive text-xl font-bold">{state.error}</p>
          )}
        </form>
      ) : (
        <section className="border-4 border-primary bg-secondary/30 p-5 md:p-6 space-y-4">
          <p className="text-2xl md:text-3xl font-bold uppercase">
            {t("successTitle")}
          </p>

          <div className="flex flex-row gap-4 items-center justify-center p-10">
            {generatedCode.split("").map((digit, index) => {
              const finalAngle = rotations[index];

              return (
                <div
                  key={index}
                  className="flex items-center justify-center border-4 border-primary h-20 w-20 md:h-24 md:w-24"
                  style={{
                    transform:
                      index % 2 === 0
                        ? `rotate(${finalAngle}deg)`
                        : `rotate(${-finalAngle}deg)`,
                  }}
                >
                  <p
                    className="text-6xl font-black text-primary md:text-7xl"
                    style={{
                      transform:
                        index % 2 === 0
                          ? `rotate(${-finalAngle}deg)`
                          : `rotate(${finalAngle}deg)`,
                    }}
                  >
                    {digit}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t-2 border-primary/30 pt-4 flex items-baseline gap-2">
            <p className="text-xl md:text-2xl font-bold">{t("timerLabel")}</p>
            <p
              className={`text-3xl md:text-4xl font-bold transition-colors ${secondsLeft === 0 ? "text-destructive" : ""}`}
            >
              {timerLabel}
            </p>

            <div className="flex-1" />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-auto px-5 py-3 text-xl md:text-2xl font-bold transition-transform duration-300 ease-out hover:scale-[1.05] hover:bg-card"
              >
                {t("resetButton")}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
