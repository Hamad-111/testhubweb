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
                primary: "#7C4DFF",
                secondary: "#2196F3",
                accent: "#FFD700",
                'card-red': '#FF4B4B',
                'card-blue': '#2196F3',
                'card-yellow': '#FFC107',
                'card-green': '#00C853',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(124, 77, 255, 0.5)',
            }
        },
    },
    plugins: [],
};
export default config;
