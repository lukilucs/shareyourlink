import { pixelFont } from "@/app/fonts/fonts";

// Tipamos estrictamente los tamaños que soporta Tailwind para evitar errores
type TailwindSize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl";

interface LogoProps {
  size?: TailwindSize;
  sizeMd?: TailwindSize;
}

export const Logo = ({ size = "3xl", sizeMd }: LogoProps) => {
  const sizeMap: Record<TailwindSize, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    "7xl": "text-7xl",
    "8xl": "text-8xl",
    "9xl": "text-9xl",
  };

  const mdSizeMap: Record<TailwindSize, string> = {
    xs: "md:text-xs",
    sm: "md:text-sm",
    base: "md:text-base",
    lg: "md:text-lg",
    xl: "md:text-xl",
    "2xl": "md:text-2xl",
    "3xl": "md:text-3xl",
    "4xl": "md:text-4xl",
    "5xl": "md:text-5xl",
    "6xl": "md:text-6xl",
    "7xl": "md:text-7xl",
    "8xl": "md:text-8xl",
    "9xl": "md:text-9xl",
  };

  const baseClass = sizeMap[size] || "text-3xl";
  const mdClass = sizeMd ? mdSizeMap[sizeMd] : "";

  return (
    <div className={`${pixelFont.className} tracking-wider`}>
      <p
        className={`${baseClass} ${mdClass} text-primary transition-all duration-300 flex items-baseline gap-3`}
      >
        SHARE YOUR LINK
      </p>
    </div>
  );
};
