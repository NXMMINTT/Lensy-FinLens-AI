import { Mali, Noto_Sans_Thai } from "next/font/google";

export const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

/** Handwritten notes, stickers and doodle labels. */
export const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
});

export const fontVariables = `${notoSansThai.variable} ${mali.variable}`;
