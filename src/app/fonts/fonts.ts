import { VT323 } from "next/font/google";
import localFont from "next/font/local";

export const vt323 = VT323({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const pixelFont = localFont({
  src: "./ka1.ttf",
  display: "swap",
});
