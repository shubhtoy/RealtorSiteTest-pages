import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        "overlay-dark": "hsl(var(--overlay-dark))",
        "overlay-text": "hsl(var(--overlay-text))",
        "primary-glow": "hsl(var(--primary-glow))",
        "accent-warm": "hsl(var(--accent-warm))",
        "section-warm": "hsl(var(--section-warm))",
        "section-cream": "hsl(var(--section-cream))",
        ring: "hsl(var(--ring))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        input: "hsl(var(--input))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 8px 24px hsl(var(--shadow) / 0.1)",
        "soft-lg": "0 16px 40px hsl(var(--shadow) / 0.14)",
        glass: "0 8px 32px hsl(var(--shadow) / 0.08), inset 0 1px 0 hsl(var(--overlay-text) / 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
      },
      backgroundImage: {
        "body-mesh":
          "radial-gradient(ellipse at 10% -8%, hsl(var(--primary) / 0.14), transparent 50%), radial-gradient(ellipse at 90% 0%, hsl(var(--accent) / 0.1), transparent 50%), linear-gradient(170deg, hsl(var(--background)), hsl(34 36% 94%) 50%, hsl(var(--background)))",
        "hero-fade":
          "linear-gradient(to top, hsl(var(--overlay-dark) / 0.88) 0%, hsl(var(--overlay-dark) / 0.55) 40%, hsl(var(--overlay-dark) / 0.2) 70%, transparent 100%)",
        "hero-radials":
          "radial-gradient(ellipse at 20% 80%, hsl(var(--primary) / 0.18), transparent 50%), radial-gradient(ellipse at 80% 20%, hsl(var(--accent) / 0.1), transparent 50%)",
        "section-fade":
          "linear-gradient(to top, hsl(var(--overlay-dark) / 0.82) 0%, hsl(var(--overlay-dark) / 0.5) 40%, hsl(var(--overlay-dark) / 0.22) 70%, transparent 100%)",
        "section-radials":
          "radial-gradient(ellipse at 15% 85%, hsl(var(--primary) / 0.12), transparent 45%)",
        "fade-top":
          "linear-gradient(to bottom, hsl(var(--background)), transparent)",
        "fade-bottom":
          "linear-gradient(to top, hsl(var(--background)), transparent)",
        "card-gradient":
          "linear-gradient(155deg, hsl(var(--card)), hsl(var(--secondary) / 0.7))",
        "panel-gradient":
          "linear-gradient(150deg, hsl(var(--card)), hsl(var(--secondary) / 0.8))",
        "overlay-card-fade":
          "linear-gradient(to top, hsl(var(--overlay-dark) / 0.75) 0%, transparent 60%)",
      },
      animation: {
        scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
      },
      keyframes: {
        scroll: {
          to: { transform: "translateX(calc(-50% - 0.5rem))" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
