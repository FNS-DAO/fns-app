import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  theme: {
    extend: {
      colors: {
        primary: '#1A4FC8',
        'custom-gray': '#B7B7B7'
      },
      boxShadow: {
        default: '0 0 20px 0 rgba(0, 0, 0, 0.1)'
      },
      fontFamily: {
        bai: ['bai-jamjuree', 'system-ui']
      },
      backgroundImage: {
        home: 'url("~/assets/imgs/home-bg.gif")'
      }
    }
  },
  shortcuts: {
    shape: 'border-2 border-red-500',
    'wh-full': 'w-full h-full',
    'flex-center': 'flex items-center justify-center',
    'custom-container': 'container mx-auto <md:w-11/12'
  }
})
