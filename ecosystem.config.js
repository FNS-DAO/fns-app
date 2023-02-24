module.exports = {
  apps: [
    {
      name: 'app.fns.space',
      script: './.output/server/index.mjs',
      env: {
        NUXT_HOST: '0.0.0.0',
        PORT: 3333
      }
    }
  ]
}
