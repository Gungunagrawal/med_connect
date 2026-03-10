/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#0f766e', // teal-700
                'primary-dark': '#115e59', // teal-800
                'secondary': '#0ea5e9', // sky-500
            }
        },
    },
    plugins: [],
}
