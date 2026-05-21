/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Указываем, в каких папках лежат твои файлы с кодом
  content: [
    "./App.{js,jsx,ts,tsx}",         // Если основной файл в корне
    "./app/**/*.{js,jsx,ts,tsx}",    // Если используешь Expo Router (папка app)
    "./components/**/*.{js,jsx,ts,tsx}", // Твои компоненты
    "./src/**/*.{js,jsx,ts,tsx}",    // Если создал папку src
  ],
  theme: {
    extend: {
      // 2. Добавляем фирменные цвета как на скриншоте
      colors: {
        rtPurple: '#7000FF',     // Яркий фиолетовый (кнопка)
        rtOrange: '#FF501A',     // Оранжевый (ссылка и круг)
        rtLightPurple: '#D7CCFB', // Светло-фиолетовый (маленький круг)
        rtDark: '#182030',       // Темный текст
        rtGray: '#EBEDF0',       // Цвет границ инпутов
      },
      // 3. Можно добавить свои радиусы скругления, если нужно
      borderRadius: {
        '3xl': '30px',
      },
      fontFamily: {
        roboto: ["Roboto_400Regular"],
        robotoLight: ["Roboto_300Light"], // Добавляем эту строку
      },
    },
  },
  plugins: [],
}