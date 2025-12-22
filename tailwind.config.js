 {import('tailwindcss').Config}
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/Pages/**/*.{js,ts,jsx,tsx}",
        "./src/Components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [],
};
