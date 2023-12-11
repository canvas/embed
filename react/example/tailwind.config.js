/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        green: "#45C7A0",
        accent: "#777BEA",
        "accent-label": "#ffffff",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("tailwindcss-themer")({
      defaultTheme: {
        extend: {
          colors: {
            default: "#282A3C",
            faded: "#91939B",
            inactive: "#C7C8CB",
            border: "#E3E3E5",
            divider: "#F1F1F1",
            highlight: "#F5F5F5",
            background: "#FFFFFF",
            cohort: "#93DFC8",
          },
        },
      },
      themes: [
        {
          name: "dark",
          extend: {
            colors: {
              default: "#FFFFFF",
              faded: "#B2B4BC",
              inactive: "#737378",
              border: "#69696C",
              divider: "#46464B",
              highlight: "#3D3D42",
              background: "#242429",
              cohort: "#28735D",
            },
          },
        },
      ],
    }),
  ],
  variants: {
    extend: {
      visibility: ["group-hover"],
    },
  },
};
