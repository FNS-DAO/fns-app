<template>
  <ul class="self-stretch flex ml-10 list-none text-custom-gray text-lg font-light">
    <li class="cursor-pointer transition hover:text-primary flex-center">
      <a href="https://hyperspace.yoga/#faucet" target="_blank">Faucet</a>
    </li>
    <template v-for="nav in navs" :key="nav.label">
      <li
        class="flex-center cursor-pointer capitalize ml-10 transition hover:text-primary"
        :class="{
          'text-primary border-b-3 border-current font-medium': nav.path === $route.path
        }"
      >
        <NuxtLink :to="nav.path">{{ nav.label }}</NuxtLink>
      </li>
    </template>
    <li class="ml-10 cursor-pointer transition hover:text-primary flex-center">
      <a href="https://hyperspace.filfox.info/fns" target="_blank">Lookup</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useAccountStore } from '~~/store'

const accountStore = useAccountStore()
const navs = computed(() => {
  const account = accountStore.account
  if (accountStore.connected) {
    return [
      { label: 'Search', path: '/' },
      { label: 'My Domains', path: `/address/${account}` },
      { label: 'Favourites', path: '/favourite' }
    ]
  }
  return [{ label: 'Search', path: '/' }]
})
</script>
