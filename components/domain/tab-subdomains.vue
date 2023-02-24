<template>
  <div v-loading="loading">
    <template v-if="subdomains.length">
      <div
        v-for="(domain, index) in subdomains"
        :key="domain"
        class="flex items-center text-lg font-light my-10"
      >
        <span class="w-36">{{ index ? '' : 'Subdomains :' }}</span>
        <NuxtLink :to="`/domain/${domain}?tab=details`" class="font-semibold hover:text-blue-500">{{
          domain
        }}</NuxtLink>
        <el-icon
          :size="25"
          class="ml-4 cursor-pointer transition opacity-50 hover:opacity-100"
          @click="favouriteStore.storeDomain(domain)"
        >
          <StarFilled v-if="isDomainStored(domain)" />
          <Star v-else />
        </el-icon>
      </div>
    </template>
    <p v-else class="flex-center items-end text-xl h-64 font-light">
      No subdomains have been added
    </p>

    <div v-if="domainStore.domain.mine && accountStore.connected" class="flex-center">
      <button
        class="bg-primary text-white rounded px-5 py-1.5 mt-6 text-lg font-medium transition cursor-pointer hover:opacity-80 m-auto"
        @click="dialogVisible = true"
      >
        Add Subdomain
      </button>
    </div>
  </div>

  <DomainAddSubdomain v-model:show="dialogVisible" />
</template>

<script setup lang="ts">
import axios from 'axios'
import { useFavouriteStore, useDomainStore, useAccountStore } from '~/store'
import { SERVER } from '~~/constants'

const favouriteStore = useFavouriteStore()
const domainStore = useDomainStore()
const accountStore = useAccountStore()
const route = useRoute()

const loading = ref(true)
const dialogVisible = ref(false)
const subdomains = computed(() => domainStore.domain.subdomains)

function isDomainStored(name) {
  return favouriteStore.storedDomains.includes(name)
}

async function getSubdomains() {
  const name = route?.params.id
  loading.value = true
  const { data } = await axios.get(`${SERVER}/fns/${name}/subnames`)
  loading.value = false
  domainStore.setSubdomains(data.data)
}

onMounted(getSubdomains)
</script>
