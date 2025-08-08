import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Impact', 'Arial Black', 'Franklin Gothic Bold', 'Arial Bold', 'sans-serif'],
      },
      colors: {
        primary: '#00FF88',
        'primary-hover': '#00CC66',
        'primary-light': '#66FFAA',
        'neon-green': '#00FF88',
        'dark-green': '#1A2F1A',
        'darker-green': '#0F1F0F',
      },
    },
  },
  plugins: [],
};
export default config;
