import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
        "dm-mono": ["DM Mono", "monospace"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        border: "var(--border)",
        "border-dark": "var(--border-dark)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        teal: "var(--teal)",
        "teal-bg": "var(--teal-bg)",
        "teal-br": "var(--teal-br)",
        green: "var(--green)",
        "green-bg": "var(--green-bg)",
        "green-br": "var(--green-br)",
        red: "var(--red)",
        "red-bg": "var(--red-bg)",
        "red-br": "var(--red-br)",
        amber: "var(--amber)",
        "amber-bg": "var(--amber-bg)",
        "amber-br": "var(--amber-br)",
        purple: "var(--purple)",
        "purple-bg": "var(--purple-bg)",
        "purple-br": "var(--purple-br)",
      },
    },
  },
  plugins: [],
};
export default config;
