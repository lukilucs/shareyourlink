"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import { getDocByCode } from "@/actions/doc-actions";
import { Button } from "@/components/ui/button";
import {
  getDeterministicRotations,
  OTP_LENGTH,
  useOtpCodeInput,
} from "@/lib/form";
import type { GetDocActionState } from "@/types/doc";

const initialState: GetDocActionState = {};

export default function GetDocForm() {
  const t = useTranslations("GetDocPage");

  const [formKey, setFormKey] = useState(0);
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const {
    inputRef,
    codeChars,
    selectedIndex,
    codeValue,
    handleBoxSelect,
    handlePaste,
    handleKeyDown,
    handleBeforeInput,
    resetCodeInput,
  } = useOtpCodeInput(OTP_LENGTH);

  const rotations = useMemo(
    () => getDeterministicRotations(formKey),
    [formKey],
  );

  const [state, formAction, isPending] = useActionState(
    getDocByCode,
    initialState,
  );

  const generatedDoc = state.success && !isResultDismissed ? state : null;
  const showForm = !generatedDoc;

  const handleReset = () => {
    setIsResultDismissed(true);
    resetCodeInput();
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
          <div className="relative flex justify-between gap-2 md:gap-4 w-full">
            {Array.from({ length: OTP_LENGTH }, (_, index) => {
              const char = codeChars[index] || "";
              const isActive = selectedIndex === index;
              const rotationDegrees = rotations[index];
              const rotationValue =
                index % 2 === 0 ? rotationDegrees : -rotationDegrees;

              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBoxSelect(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleBoxSelect(index);
                    }
                  }}
                  style={{ transform: `rotate(${rotationValue}deg)` }}
                  className={`flex h-16 w-1/4 items-center justify-center border-4 bg-background text-2xl md:text-4xl font-black uppercase transition-colors cursor-text ${isActive ? "border-primary" : "border-primary/20"}`}
                >
                  <span style={{ transform: `rotate(${-rotationValue}deg)` }}>
                    {char}
                  </span>
                </div>
              );
            })}

            <input
              ref={inputRef}
              id="code"
              name="code"
              type="text"
              required
              autoFocus
              maxLength={OTP_LENGTH}
              value={codeValue}
              onChange={() => {
                // Input updates are handled by keyboard and paste events.
              }}
              onBeforeInput={handleBeforeInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              inputMode="text"
              autoComplete="one-time-code"
              className="absolute inset-0 w-full h-full opacity-0 cursor-text pointer-events-none"
            />
          </div>
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
              {t("successTitle")}
            </p>

            <p className="text-lg md:text-2xl font-bold break-all">
              {generatedDoc.name}
            </p>

            <div className="h-auto w-full border-2 border-primary/30 bg-card">
              <DocViewer
                documents={[
                  {
                    uri: generatedDoc.url,
                    fileName: generatedDoc.name,
                  },
                ]}
                prefetchMethod="GET"
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableHeader: false,
                    retainURLParams: true,
                  },
                  pdfVerticalScrollByDefault: false,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                }}
              />
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
