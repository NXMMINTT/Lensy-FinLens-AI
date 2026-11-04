import { Anuphan, Mali, Sarabun } from "next/font/google";

/** Body text (FinLens brief: Sarabun for content). */
export const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

/** Headings (FinLens brief: Anuphan for titles). */
export const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

/** Handwritten notes, stickers and doodle labels (kept from the U-Ledger reference UI). */
export const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
});

export const fontVariables = `${sarabun.variable} ${anuphan.variable} ${mali.variable}`;
