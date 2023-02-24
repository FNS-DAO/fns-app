// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ['~/assets/app.less'],
  buildModules: ['nuxt-windicss', '@pinia/nuxt'],
  app: {
    head: {
      title: 'FNS APP',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'keywords',
          content:
            'FNS, Filfox, Filecoin Name Service, Filecoin Domain, Filecoin Domain Service, Filecoin FVM, FEVM, FIL, IPFS, ENS, SID, social'
        },
        {
          name: 'description',
          content:
            'FNS is an important infrastructure of Filecoin. The Filecoin chain stores a large number of addresses, miners, orders, sectors and other data. FNS can give these data a human-readable tag to help users better understand and access these data'
        },
        { charset: 'utf-8' }
      ]
    }
  }
})
