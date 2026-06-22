import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003527",
        "primary-container": "#064e3b",
        "on-primary": "#ffffff",
        "on-primary-container": "#80bea6",
        "inverse-primary": "#95d3ba",
        surface: "#f8faf6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f1",
        "surface-container": "#eceeeb",
        "on-surface": "#191c1b",
        "on-surface-variant": "#404944",
        outline: "#707974",
        "outline-variant": "#bfc9c3",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        secondary: "#0058be",
      },
      fontFamily: {
        display: ["var(--font-geist)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "title-lg": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};

export default config;
