/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem"
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))"
        }
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)"
      },
      fontSize: {
        xs: ["0.72rem", { lineHeight: "1rem" }],
        sm: ["0.82rem", { lineHeight: "1.2rem" }],
        base: ["0.92rem", { lineHeight: "1.35rem" }]
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "hsl(217 78% 54%)",
          "secondary": "hsl(34 22% 88%)",
          "accent": "hsl(36 24% 84%)",
          "neutral": "hsl(24 18% 15%)",
          "base-100": "hsl(38 38% 93%)",
          "info": "hsl(217 78% 54%)",
          "success": "hsl(156 58% 32%)",
          "warning": "hsl(34 86% 42%)",
          "error": "hsl(3 68% 48%)",
        },
        dark: {
          "primary": "hsl(217 92% 67%)",
          "secondary": "hsl(223 13% 22%)",
          "accent": "hsl(223 14% 23%)",
          "neutral": "hsl(216 24% 88%)",
          "base-100": "hsl(225 13% 12%)",
          "info": "hsl(217 92% 67%)",
          "success": "hsl(142 45% 50%)",
          "warning": "hsl(40 72% 58%)",
          "error": "hsl(356 74% 66%)",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    utils: true,
    logs: false,
    themeRoot: ":root",
  },
};
