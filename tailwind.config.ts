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
        background: "#05030A",
        accent: {
          primary: "#FFFFFF",    // White (Neutral/Control)
          secondary: "#007BFF",  // Electric Blue (Radar/Grid)
          tertiary: "#00D1FF",   // Cyan (Analytics/Dynamics)
          solar: "#F59E0B",      // Amber (Solar/Generation)
          budget: "#10B981",     // Emerald (Budget/Savings)
          system: "#A855F7",     // Purple (Console/Logs)
          routine: "#6366F1",    // Indigo (Routines)
        },
      },
      fontFamily: {
        heading: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
