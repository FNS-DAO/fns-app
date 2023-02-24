<template>
  <div class="px-4">
    <div class="h-14 flex items-stretch border-b border-gray-500 font-light mt-2">
      <span
        v-for="tab in ['registrant', 'controller']"
        :key="tab"
        :class="{ 'text-primary border-current font-semibold': activeTab === tab }"
        class="flex-center text-custom-gray capitalize mr-10 cursor-pointer transition text-lg border-b-3 border-transparent hover:text-primary"
        @click="activeTab = tab"
        >{{ tab }}</span
      >
    </div>
    <AddressCtlNameList :names="names" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { getPendingFromLocal, NoteError } from '~~/composables'
import { eventHub } from '~~/libs/event-hub'
import { useAddressStore } from '~~/store'

definePageMeta({ layout: 'address' })

const addressStore = useAddressStore()
const activeTab = ref('registrant')
const loading = ref(true)
const route = useRoute()
const address = computed(() => route.params.id)
const names = computed(() => addressStore[activeTab.value])

async function getRegistrant() {
  try {
    loading.value = true
    const registrant = await API.getAllNamesOf(address.value)
    addressStore.setAddress({ registrant })
  } catch (error) {
    NoteError('Get registrant error')
  } finally {
    loading.value = false
  }
}

async function getController() {
  try {
    loading.value = true
    const controller = await API.getAllControlledNames(address.value)
    addressStore.setAddress({ controller })
  } catch (error) {
    NoteError('Get controller error')
  } finally {
    loading.value = false
  }
}

async function getPrimaryName() {
  const primaryName = await API.getName(address.value)
  const pending = getPendingFromLocal(address.value)
  addressStore.setAddress({ primaryName, pending })
}

watch(activeTab, tab => {
  if (tab === 'registrant') {
    getRegistrant()
  }
  if (tab === 'controller') {
    getController()
  }
})

onMounted(() => {
  getPrimaryName()
  getRegistrant()
  eventHub.on('update_address', getPrimaryName)
})
onUnmounted(() => {
  eventHub.off('update_address')
  addressStore.setAddress({ registrant: [] })
  addressStore.setAddress({ controller: [] })
})
</script>
