/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "var(--primary)",
          "primary-dark": "var(--primary-dark)",
          "primary-light": "var(--primary-light)",
          secondary: "var(--secondary)",
          "secondary-dark": "var(--secondary-dark)",
          accent: "var(--accent)",
          background: "var(--background)",
          foreground: "var(--foreground)",
          card: "var(--card)",
          "card-foreground": "var(--card-foreground)",
          border: "var(--border)",
          input: "var(--input)",
          ring: "var(--ring)",
        },
      },
    },
    plugins: [],
  }
  