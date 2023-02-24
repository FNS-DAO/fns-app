<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { wallet } from '~/libs/wallet'
import { useDomainStore, useFavouriteStore } from '~/store'
useFavouriteStore()
useDomainStore()
onMounted(() => wallet.connect())
</script>
