/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: We will put our files in 'src' and 'app'
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#16A34A', // The "Kirana Green"
        secondary: '#F59E0B', // Gold/Alerts
        dark: '#1F2937',
        light: '#F3F4F6',
      },
    },
  },
  plugins: [],
}