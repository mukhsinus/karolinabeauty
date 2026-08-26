// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  safelist: [
    // layout
    "max-w-6xl",
    "max-w-7xl",
    "max-w-5xl",
    "mx-auto",
    "px-4",
    "px-6",
    "container",

    // grid / spacing (на всякий)
    "grid",
    "grid-cols-1",
    "grid-cols-2",
    "md:grid-cols-2",
    "lg:grid-cols-3",
    "lg:grid-cols-5",
    "gap-4",
    "gap-6",
    "gap-8",
    "gap-10",
    "md:grid",
    "md:grid-cols-3",
    "md:hidden",
    "hidden",
    "flex",
    "flex-col",
    "flex-row",
    "items-center",
    "justify-between",
    "text-center",
    "text-xs",
    "text-sm",
    "text-xl",
    "text-2xl",
    "text-4xl",
    "text-5xl",
    "font-semibold",
    "font-display",
    "rounded-2xl",
    "rounded-full",
    "p-6",
    "p-8",
    "py-6",
    "py-8",
    "py-24",
    "mb-2",
    "mb-4",
    "mb-5",
    "mb-6",
    "mb-16",
    "mt-8",
    "mt-24",
    "w-9",
    "w-12",
    "h-9",
    "h-12",
    "bg-card",
    "bg-card/80",
    "bg-secondary",
    "bg-secondary/50",
    "bg-primary/10",
    "border",
    "border-border",
    "shadow-card",
    "shadow-sm",
    "backdrop-blur-xl",
    "transition",
    "transition-all",
    "duration-200",
    "duration-300",
    "duration-500",
    "hover:text-primary",
    "hover:bg-primary/10",
    "hover:underline",
    "group",
    "group-hover:text-primary",
    "group-hover:bg-primary/10",
    "active:scale-95",
    "opacity-60",
    "hover:opacity-100",
    "whitespace-pre-line",
    "leading-relaxed",
    "max-w-sm",
    "max-w-xl",
    "max-w-7xl",
    "mx-auto",
    "px-4",
    "py-6",
    "py-24",
    "rounded-2xl",
    "rounded-full",
    "p-5",
    "p-8",
    "gap-4",
    "gap-6",
    "gap-8",
    "gap-10",
    "container",
    "border-t",
    "border-border",
  ],

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px", // ⚠️ важно: чтобы совпадало с max-w-7xl визуально
      },
    },

    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Raleway", "sans-serif"],
      },

      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },

        rose: {
          DEFAULT: "hsl(var(--rose))",
          light: "hsl(var(--rose-light))",
        },

        nude: "hsl(var(--nude))",
        blush: "hsl(var(--blush))",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.45)", opacity: "0" },
          "60%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "check-pop": "check-pop 0.45s ease-out forwards",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;