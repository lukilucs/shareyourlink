import {
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

export const OTP_LENGTH = 4;

export const createEmptyCode = (length: number = OTP_LENGTH): string[] =>
  Array.from({ length }, () => "");

export const getDeterministicRotations = (
  seed: number,
  length: number = OTP_LENGTH,
): number[] =>
  Array.from(
    { length },
    (_, index) => (((seed + 1) * (index + 2) * 3) % 4) + 1,
  );

export const normalizeCodeInput = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const focusInputAtIndex = (
  inputRef: RefObject<HTMLInputElement | null>,
  index: number,
): void => {
  const input = inputRef.current;
  if (!input) {
    return;
  }

  input.focus();
  input.setSelectionRange(index, index + 1);
};

export const applySingleCodeChar = (
  codeChars: string[],
  selectedIndex: number,
  rawValue: string,
  length: number = OTP_LENGTH,
): { nextCodeChars: string[]; nextIndex: number } | null => {
  const char = normalizeCodeInput(rawValue).slice(-1);
  if (!char) {
    return null;
  }

  const nextCodeChars = [...codeChars];
  nextCodeChars[selectedIndex] = char;

  return {
    nextCodeChars,
    nextIndex: Math.min(length - 1, selectedIndex + 1),
  };
};

export const applyPastedCode = (
  codeChars: string[],
  _selectedIndex: number,
  pastedText: string,
  length: number = OTP_LENGTH,
): { nextCodeChars: string[]; nextIndex: number } | null => {
  const sanitized = normalizeCodeInput(pastedText);
  if (!sanitized) {
    return null;
  }

  const nextCodeChars = [...codeChars];
  const charsToApply = sanitized.slice(0, length).split("");

  if (charsToApply.length === 0) {
    return null;
  }

  charsToApply.forEach((char, offset) => {
    nextCodeChars[offset] = char;
  });

  return {
    nextCodeChars,
    nextIndex: Math.min(length - 1, charsToApply.length - 1),
  };
};

export function useOtpCodeInput(length: number = OTP_LENGTH) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [codeChars, setCodeChars] = useState<string[]>(createEmptyCode(length));
  const [selectedIndex, setSelectedIndex] = useState(0);

  const codeValue = codeChars.join("");

  const applyCharAtSelectedIndex = (rawValue: string): void => {
    const result = applySingleCodeChar(codeChars, selectedIndex, rawValue, length);
    if (!result) {
      return;
    }

    setCodeChars(result.nextCodeChars);
    setSelectedIndex(result.nextIndex);

    requestAnimationFrame(() => {
      focusInputAtIndex(inputRef, result.nextIndex);
    });
  };

  const handleBoxSelect = (index: number): void => {
    setSelectedIndex(index);
    requestAnimationFrame(() => {
      focusInputAtIndex(inputRef, index);
    });
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const result = applyPastedCode(
      codeChars,
      selectedIndex,
      event.clipboardData.getData("text"),
      length,
    );
    if (!result) {
      return;
    }

    setCodeChars(result.nextCodeChars);
    setSelectedIndex(result.nextIndex);

    requestAnimationFrame(() => {
      focusInputAtIndex(inputRef, result.nextIndex);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
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
        focusInputAtIndex(inputRef, nextIndex);
      });
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = Math.min(length - 1, selectedIndex + 1);
      setSelectedIndex(nextIndex);
      requestAnimationFrame(() => {
        focusInputAtIndex(inputRef, nextIndex);
      });
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        focusInputAtIndex(inputRef, 0);
      });
      return;
    }

    if (key === "End") {
      event.preventDefault();
      setSelectedIndex(length - 1);
      requestAnimationFrame(() => {
        focusInputAtIndex(inputRef, length - 1);
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
          focusInputAtIndex(inputRef, selectedIndex);
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
        focusInputAtIndex(inputRef, previousIndex);
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
        focusInputAtIndex(inputRef, selectedIndex);
      });
    }
  };

  const handleBeforeInput = (event: FormEvent<HTMLInputElement>): void => {
    const nativeEvent = event.nativeEvent as InputEvent;

    if (nativeEvent.inputType === "insertText" && nativeEvent.data) {
      event.preventDefault();
      applyCharAtSelectedIndex(nativeEvent.data);
    }
  };

  const resetCodeInput = (): void => {
    setCodeChars(createEmptyCode(length));
    setSelectedIndex(0);
  };

  return {
    inputRef,
    codeChars,
    selectedIndex,
    codeValue,
    handleBoxSelect,
    handlePaste,
    handleKeyDown,
    handleBeforeInput,
    resetCodeInput,
  };
}
