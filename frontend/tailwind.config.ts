import type { Config } from "tailwindcss";

// FinLens AI palette (mascot sheet swatches): #1A7637 · #54D110 · #D1F08F · #C9E6DF · #F7F5F7
// Colors that change in dark mode read a CSS variable set in globals.css (:root = light, html.dark = dark),
// so every utility — including opacity variants like bg-brand-soft/60 — switches together.
const themed = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Card / panel background. Use bg-white only for things that must stay white (logo tiles).
        surface: themed("surface"),
        navy: "#0F3D2A",
        brand: {
          DEFAULT: "#1A7637",
          dark: "#135C2A",
          light: "#54D110",
          soft: themed("brand-soft"),
          tint: themed("brand-tint"),
        },
        sky: {
          DEFAULT: themed("sky"),
          deep: themed("sky-deep"),
          line: themed("sky-line"),
        },
        ink: {
          DEFAULT: themed("ink"),
          body: themed("ink-body"),
          muted: themed("ink-muted"),
          faint: themed("ink-faint"),
        },
        line: {
          DEFAULT: themed("line"),
          subtle: themed("line-subtle"),
        },
        sun: {
          DEFAULT: "#FFC83D",
          soft: themed("sun-soft"),
          ink: themed("sun-ink"),
        },
        chat: "#9BE07A",
        linegreen: "#06C755",
        // DEFAULT is for text on surfaces; solid is a button/badge fill under white text.
        income: { DEFAULT: themed("income"), solid: "#12804F" },
        expense: { DEFAULT: themed("expense"), solid: "#B42318" },
        // Status tiles: soft = background, line = border / icon chip, ink = text on soft.
        success: { soft: themed("success-soft"), line: themed("success-line"), ink: themed("success-ink") },
        danger: { soft: themed("danger-soft"), line: themed("danger-line"), ink: themed("danger-ink") },
      },
      // Brand green is too dark to read as text on dark surfaces, but bg-brand buttons keep it.
      textColor: {
        brand: { DEFAULT: themed("brand-fg") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "var(--font-sans)", "cursive"],
      },
      keyframes: {
        wiggle: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
        bob: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        pop: { "0%": { transform: "scale(.6)", opacity: "0" }, "70%": { transform: "scale(1.06)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        typing: { "0%,60%,100%": { transform: "translateY(0)", opacity: ".4" }, "30%": { transform: "translateY(-4px)", opacity: "1" } },
      },
      animation: {
        wiggle: "wiggle .5s ease-in-out 2",
        bob: "bob 4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        pop: "pop .35s ease-out both",
        typing: "typing 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
