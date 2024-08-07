/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            black: '#000',
            white: '#f2f2f2',
            alabaster: {
                100: '#dce0d9',
                200: '#bdc7ba',
                300: '#9dae9d',
                400: '#829686',
                500: '#6a7d71',
                600: '#53645d',
                700: '#3E4B48',
                800: '#293232',
                900: '#141819',
                950: '#0A0C0D',
            },
            grey: {
                100: '#DADADA',
                200: '#C2C2C2',
                300: '#AAAAAA',
                400: '#919191',
                500: '#797979',
                600: '#616161',
                700: '#494949',
                800: '#303030',
                900: '#181818',
                950: '#0C0C0C',
            },
        },
        extend: {},
    },
    plugins: [],
    darkMode: ['class', '.figma-dark']
}
