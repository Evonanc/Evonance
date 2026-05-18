import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      /* ── Color System ───────────────────────────── */
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "#0052FF",
          foreground: "#FFFFFF",
          50:  "#EFF4FF",
          100: "#DBE8FF",
          200: "#B9D1FF",
          300: "#82ADFF",
          400: "#4880FF",
          500: "#0052FF",
          600: "#0041CC",
          700: "#0033A3",
          800: "#002880",
          900: "#001F66",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "#7C3AED",
          foreground: "#FFFFFF",
          50:  "#F5F3FF",
          100: "#EDE9FE",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          50:  "#F0FDF4",
          500: "#22C55E",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          border:  "hsl(var(--sidebar-border))",
        },

        /* ── EVONANCE extended palette ── */
        ev: {
          bg:      "#080B14",
          surface: "#0D1117",
          card:    "#111827",
          border:  "#1A2035",
          muted:   "#1F2D4A",
        },
        crypto: {
          btc:   "#F7931A",
          eth:   "#627EEA",
          sol:   "#9945FF",
          bnb:   "#F3BA2F",
          usdt:  "#26A17B",
          xrp:   "#346AA9",
        },
      },

      /* ── Typography ──────────────────────────────── */
      fontFamily: {
        sans:    ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-inter)", "sans-serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem",  { lineHeight: "0.9rem" }],
        "xs":  ["0.75rem",  { lineHeight: "1.1rem" }],
        "sm":  ["0.875rem", { lineHeight: "1.25rem" }],
        "md":  ["0.9375rem",{ lineHeight: "1.4rem" }],
        "base":["1rem",     { lineHeight: "1.5rem" }],
        "lg":  ["1.125rem", { lineHeight: "1.6rem" }],
        "xl":  ["1.25rem",  { lineHeight: "1.6rem" }],
        "2xl": ["1.5rem",   { lineHeight: "1.6rem" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem",  { lineHeight: "1.2" }],
        "5xl": ["3rem",     { lineHeight: "1.1" }],
        "6xl": ["3.75rem",  { lineHeight: "1.0" }],
        "7xl": ["4.5rem",   { lineHeight: "1.0" }],
        "8xl": ["6rem",     { lineHeight: "1.0" }],
        "9xl": ["8rem",     { lineHeight: "1.0" }],
      },

      /* ── Border Radius ───────────────────────────── */
      borderRadius: {
        none:  "0",
        sm:    "0.375rem",
        DEFAULT:"0.5rem",
        md:    "0.625rem",
        lg:    "var(--radius)",       /* 0.75rem */
        xl:    "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        full:  "9999px",
      },

      /* ── Spacing ─────────────────────────────────── */
      spacing: {
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
        "19": "4.75rem",
        "21": "5.25rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },

      /* ── Shadows ─────────────────────────────────── */
      boxShadow: {
        /* Elevation */
        "ev-1": "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "ev-2": "0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
        "ev-3": "0 8px 24px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06)",
        "ev-4": "0 16px 40px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08)",
        /* Brand glow */
        "glow-primary":  "0 0 20px rgba(0,82,255,0.3), 0 4px 16px rgba(0,82,255,0.15)",
        "glow-primary-lg":"0 0 40px rgba(0,82,255,0.4), 0 8px 32px rgba(0,82,255,0.2)",
        "glow-accent":   "0 0 20px rgba(124,58,237,0.3), 0 4px 16px rgba(124,58,237,0.15)",
        "glow-green":    "0 0 16px rgba(34,197,94,0.25), 0 2px 8px rgba(34,197,94,0.12)",
        /* Card styles */
        "card-light": "0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)",
        "card-dark":  "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        /* Inner */
        "inner-primary": "inset 0 0 16px rgba(0,82,255,0.08)",
      },

      /* ── Background Images ───────────────────────── */
      backgroundImage: {
        "ev-gradient":    "linear-gradient(135deg, #0052FF 0%, #7C3AED 100%)",
        "ev-gradient-v":  "linear-gradient(180deg, #0052FF 0%, #7C3AED 100%)",
        "ev-gradient-blue":"linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)",
        "ev-gradient-purple":"linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
        "dark-glass":     "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "chart-gradient": "linear-gradient(180deg, rgba(0,82,255,0.15) 0%, rgba(0,82,255,0.0) 100%)",
      },

      /* ── Keyframes & Animations ──────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in":     { from: { opacity:"0" },           to: { opacity:"1" } },
        "fade-up":     { from: { opacity:"0", transform:"translateY(16px)" }, to: { opacity:"1", transform:"translateY(0)" } },
        "fade-down":   { from: { opacity:"0", transform:"translateY(-16px)" }, to: { opacity:"1", transform:"translateY(0)" } },
        "scale-in":    { from: { opacity:"0", transform:"scale(0.95)" }, to: { opacity:"1", transform:"scale(1)" } },
        "slide-left":  { from: { opacity:"0", transform:"translateX(16px)" }, to: { opacity:"1", transform:"translateX(0)" } },
        "slide-right": { from: { opacity:"0", transform:"translateX(-16px)" }, to: { opacity:"1", transform:"translateX(0)" } },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px rgba(0,82,255,0.2)" },
          "50%":     { boxShadow: "0 0 40px rgba(0,82,255,0.45)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "price-up": {
          "0%":   { color: "#22C55E", transform:"translateY(-4px)" },
          "100%": { color: "inherit", transform:"translateY(0)" },
        },
        "price-down": {
          "0%":   { color: "#EF4444", transform:"translateY(4px)" },
          "100%": { color: "inherit", transform:"translateY(0)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.4s ease-out",
        "fade-up":         "fade-up 0.5s ease-out",
        "fade-down":       "fade-down 0.4s ease-out",
        "scale-in":        "scale-in 0.35s ease-out",
        "slide-left":      "slide-left 0.4s ease-out",
        "slide-right":     "slide-right 0.4s ease-out",
        float:             "float 6s ease-in-out infinite",
        "glow-pulse":      "glow-pulse 3s ease-in-out infinite",
        ticker:            "ticker 40s linear infinite",
        "spin-slow":       "spin-slow 12s linear infinite",
        "pulse-slow":      "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "price-up":        "price-up 0.6s ease-out",
        "price-down":      "price-down 0.6s ease-out",
      },

      /* ── Transition ──────────────────────────────── */
      transitionTimingFunction: {
        spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo":"cubic-bezier(0.16, 1, 0.3, 1)",
        "in-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
