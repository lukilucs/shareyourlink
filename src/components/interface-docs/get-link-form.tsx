"use client";

import {
  useActionState,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { type GetLinkActionState, getLinkByCode } from "@/actions/link-actions";
import Link from "next/link";

const initialState: GetLinkActionState = {};
const OTP_LENGTH = 4;

const createEmptyCode = (): string[] =>
  Array.from({ length: OTP_LENGTH }, () => "");

const getDeterministicRotations = (seed: number): number[] =>
  Array.from(
    { length: OTP_LENGTH },
    (_, index) => (((seed + 1) * (index + 2) * 3) % 4) + 1,
  );

export default function GetLinkForm() {
  const t = useTranslations("GetPage");

  const [formKey, setFormKey] = useState(0);
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [codeChars, setCodeChars] = useState<string[]>(createEmptyCode());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rotations = useMemo(
    () => getDeterministicRotations(formKey),
    [formKey],
  );

  const [state, formAction, isPending] = useActionState(
    getLinkByCode,
    initialState,
  );

  const codeValue = codeChars.join("");

  const focusInputAtIndex = (index: number) => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    input.setSelectionRange(index, index + 1);
  };

  const applyCharAtSelectedIndex = (rawValue: string) => {
    const char = rawValue
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(-1);
    if (!char) {
      return;
    }

    const nextIndex = Math.min(OTP_LENGTH - 1, selectedIndex + 1);

    setCodeChars((prev) => {
      const next = [...prev];
      next[selectedIndex] = char;
      return next;
    });
    setSelectedIndex(nextIndex);

    requestAnimationFrame(() => {
      focusInputAtIndex(nextIndex);
    });
  };

  const handleBoxSelect = (index: number) => {
    setSelectedIndex(index);
    requestAnimationFrame(() => {
      focusInputAtIndex(index);
    });
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const chars = pastedValue.split("");
    const acceptedChars = Math.min(chars.length, OTP_LENGTH - selectedIndex);
    const lastUpdatedIndex = selectedIndex + acceptedChars - 1;

    setCodeChars((prev) => {
      const next = [...prev];

      chars.forEach((char, offset) => {
        const position = selectedIndex + offset;
        if (position < OTP_LENGTH) {
          next[position] = char;
        }
      });

      return next;
    });

    const nextIndex = Math.max(0, Math.min(OTP_LENGTH - 1, lastUpdatedIndex));
    setSelectedIndex(nextIndex);

    requestAnimationFrame(() => {
      focusInputAtIndex(nextIndex);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;

    if (/^[a-zA-Z0-9]$/.test(key)) {
      event.preventDefault();
      applyCharAtSelectedIndex(key);
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      const nextIndex = Math.max(0, selectedIndex - 1);
      setSelectedIndex(nextIndex);
      requestAnimationFrame(() => {
        focusInputAtIndex(nextIndex);
      });
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = Math.min(OTP_LENGTH - 1, selectedIndex + 1);
      setSelectedIndex(nextIndex);
      requestAnimationFrame(() => {
        focusInputAtIndex(nextIndex);
      });
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        focusInputAtIndex(0);
      });
      return;
    }

    if (key === "End") {
      event.preventDefault();
      setSelectedIndex(OTP_LENGTH - 1);
      requestAnimationFrame(() => {
        focusInputAtIndex(OTP_LENGTH - 1);
      });
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();

      if (codeChars[selectedIndex]) {
        setCodeChars((prev) => {
          const next = [...prev];
          next[selectedIndex] = "";
          return next;
        });
        requestAnimationFrame(() => {
          focusInputAtIndex(selectedIndex);
        });
        return;
      }

      const previousIndex = Math.max(0, selectedIndex - 1);
      setCodeChars((prev) => {
        const next = [...prev];
        next[previousIndex] = "";
        return next;
      });
      setSelectedIndex(previousIndex);
      requestAnimationFrame(() => {
        focusInputAtIndex(previousIndex);
      });
      return;
    }

    if (key === "Delete") {
      event.preventDefault();
      setCodeChars((prev) => {
        const next = [...prev];
        next[selectedIndex] = "";
        return next;
      });
      requestAnimationFrame(() => {
        focusInputAtIndex(selectedIndex);
      });
    }
  };

  const handleBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent;

    if (nativeEvent.inputType === "insertText" && nativeEvent.data) {
      event.preventDefault();
      applyCharAtSelectedIndex(nativeEvent.data);
    }
  };

  const generatedLink = state.success && !isResultDismissed ? state.link : null;

  const showForm = !generatedLink;

  const handleReset = () => {
    setIsResultDismissed(true);
    setCodeChars(createEmptyCode());
    setSelectedIndex(0);
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
            {/* 4 Boxes */}
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
                  className={`flex h-16 w-1/4 items-center justify-center border-4 bg-background text-2xl md:text-4xl font-black uppercase transition-colors cursor-text
                    ${isActive ? "border-primary" : "border-primary/20"}
                  `}
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
              {t("successTitle")}:
            </p>

            <div className="flex items-center">
              <Link
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl md:text-5xl font-black text-primary underline transition-transform duration-300 hover:text-primary/80 break-all"
              >
                {generatedLink}
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
