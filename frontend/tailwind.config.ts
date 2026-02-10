import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        // Praxia custom colors
        praxia: {
          black: "rgb(var(--praxia-black))",
          charcoal: "rgb(var(--praxia-charcoal))",
          gray: {
            50: "rgb(var(--praxia-gray-50))",
            100: "rgb(var(--praxia-gray-100))",
            200: "rgb(var(--praxia-gray-200))",
            400: "rgb(var(--praxia-gray-400))",
            600: "rgb(var(--praxia-gray-600))",
            800: "rgb(var(--praxia-gray-800))",
          },
          white: "rgb(var(--praxia-white))",
          accent: "rgb(var(--praxia-accent))",
          accentDark: "rgb(var(--praxia-accent-dark))",
          accentLight: "rgb(var(--praxia-accent-light))",
          technical: "rgb(var(--praxia-technical))",
          technicalLight: "rgb(var(--praxia-technical-light))",
          success: "rgb(var(--praxia-success))",
          error: "rgb(var(--praxia-error))",
          warning: "rgb(var(--praxia-warning))",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-down": "fade-in-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
