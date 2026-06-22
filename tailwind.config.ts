import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // CSS-variable backed so light mode works with opacity utilities (bg-navy/50 etc.)
        navy: {
          DEFAULT: "rgb(var(--color-navy) / <alpha-value>)",
          800: "rgb(var(--color-navy-800) / <alpha-value>)",
          700: "rgb(var(--color-navy-700) / <alpha-value>)",
        },
        sky: {
          DEFAULT: "#38BDF8",
          hover: "#0EA5E9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
