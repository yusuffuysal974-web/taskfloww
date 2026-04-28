import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0F172A",
          800: "#1E293B",
        },
        accent: {
          DEFAULT: "#06B6D4",
          dark: "#0E7490",
        },
      },
    },
  },
  plugins: [],
};

export default config;
