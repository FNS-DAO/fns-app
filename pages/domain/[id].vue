<template>
  <div v-loading="loading" class="flex-1 p-4">
    <nav class="text-custom-gray text-lg font-light border-b border-gray-500 py-4 capitalize mb-4">
      <span
        v-for="nav in navs"
        :key="nav"
        class="mr-10 inline-block transition cursor-pointer hover:text-primary"
        :class="{ 'text-primary font-semibold': activeTab === nav }"
        @click="activeTab = nav"
        >{{ nav }}</span
      >
    </nav>
    <DomainTabRegister v-if="activeTab === 'register'" />
    <DomainTabDetails v-if="activeTab === 'details'" :domain="domain" />
    <DomainTabSubdomains v-if="activeTab === 'subdomains'" :domain="domain" />
  </div>
</template>

<script setup lang="ts">
import {
  getNameLevel,
  getParentName,
  getPendingFromLocal,
  getSecondName,
  removePendingFromLocal,
  TipError
} from '~~/composables'
import { eventHub } from '~~/libs/event-hub'
import { useAccountStore, useDomainStore } from '~~/store'

const domainStore = useDomainStore()
const accountStore = useAccountStore()

const route = useRoute()
const loading = ref(true)

const navs = computed(() => {
  const _navs = ['register', 'details', 'subdomains']
  if (!accountStore.connected || domainStore.domain.level !== 2) _navs.shift()
  return _navs
})

const activeTab = ref(route.query.tab || navs.value[0])

watch(
  () => navs.value,
  _navs => {
    if (_navs.length < 3 && activeTab.value === 'register') {
      activeTab.value = _navs[0]
    }
  }
)

const domain = reactive({
  name: route.params.id,
  content: '',
  address: '',
  available: false,
  pending: false,
  parent: getParentName(route.params.id),
  registrant: '',
  controller: '',
  expires: '',
  mine: false,
  resolver: ''
})

async function getName() {
  try {
    loading.value = true
    const secondName = getSecondName(domain.name)
    const Name = await API.getNameInfo(domain.name)
    const records = await API.getRecords(domain.name)

    if (Name.available) {
      Name.available = !getPendingFromLocal(secondName)
    } else {
      removePendingFromLocal(secondName)
    }

    domain.level = getNameLevel(domain.name)
    domain.available = Name.available
    domain.pending = getPendingFromLocal(secondName)
    domain.address = records.fil
    domain.expires = Name.expires
    domain.content = Name.contenthash
    domain.controller = Name.controller
    domain.registrant = Name.registrant
    domain.resolver = Name.resolver
    domain.subdomains = Name.subdomains
    domain.records = JSON.parse(JSON.stringify(records))
    domain.mine = domain.controller.toLowerCase() === accountStore.account.toLowerCase()

    domainStore.setDomain(domain)
  } catch (error) {
    TipError('Networ Error !')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getName()
  eventHub.on('update_name', getName)
})
onUnmounted(() => eventHub.off('update_name'))
</script>
