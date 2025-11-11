/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Esto incluye todos los archivos dentro de src
        "./src/pages/**/*.{js,ts,jsx,tsx}", // Específico para páginas si es necesario
        "./src/components/**/*.{js,ts,jsx,tsx}" // Específico para componentes
    ],
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [],
};