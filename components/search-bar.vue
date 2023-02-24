<template>
  <div class="bg-[#F5F5F5] py-6 text-primary">
    <div class="h-20 py-4 flex flex-center items-stretch bg-primary">
      <div class="custom-container px-4 flex items-stretch">
        <template v-if="$route.params.id && !isAddress($route.params.id)">
          <IconAvailable v-if="domainStore.domain.available" class="h-full mr-2" />
          <IconUnavailable v-else class="h-full mr-2" />
        </template>
        <input
          v-model.trim="input"
          type="text"
          placeholder="Input address or domain"
          :class="{
            'text-red-400': inputType === SEARCH_TYPE_DOMAIN && input && !isDomain(input)
          }"
          class="w-1/3 pl-5 text-lg font-bold placeholder-gray-300 border-transparent transition rounded-l-md outline-none"
          @keydown.enter="search"
        />
        <div
          class="flex-center cursor-pointer rounded-r-md pl-5 pr-4 bg-white hover:text-green-500"
        >
          <IconSearch class="h-8" @click="search" />
        </div>

        <template v-if="input && !isAddress(input)">
          <div
            class="self-center flex-center ml-auto cursor-pointer transition"
            :class="{
              'text-green-500 hover:text-white': isDomainStored,
              'text-white hover:text-green-500': !isDomainStored
            }"
            @click="favouriteStore.storeDomain(input)"
          >
            <el-icon :size="25">
              <StarFilled v-if="isDomainStored" />
              <Star v-else />
            </el-icon>
            <span class="text-xl font-light ml-1 capitalize">{{
              isDomainStored ? 'unfavourite' : 'favourite'
            }}</span>
          </div>
        </template>

        <template v-if="isAddress(input)">
          <a
            :href="`https://wallaby.filfox.info/address/${$route.params.id}`"
            target="_blank"
            class="ml-auto self-center text-white font-light opacity-50 border-b transition hover:opacity-100"
            >View on Explorer</a
          >
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SEARCH_TYPE_ADDRESS, SEARCH_TYPE_DOMAIN } from '~~/constants'
import { isAddress, TipWarning, isDomain, getSecondNameChars } from '~~/libs/utils'
import { eventHub } from '~~/libs/event-hub'
import { useFavouriteStore, useDomainStore } from '~/store'

const domainStore = useDomainStore()
const favouriteStore = useFavouriteStore()
const input = ref('')
const route = useRoute()
const router = useRouter()
const inputType = computed(() =>
  isAddress(input.value) ? SEARCH_TYPE_ADDRESS : SEARCH_TYPE_DOMAIN
)
const isDomainStored = computed(() => favouriteStore.storedDomains.includes(input.value))

const searchContent = computed(() => {
  let _input = input.value

  if (_input && inputType.value === SEARCH_TYPE_DOMAIN) {
    _input = /\.fil$/.test(_input) ? _input : `${_input}.fil`
  }

  return _input
})

function syncSearch() {
  input.value = route.params.id
}

function search() {
  if (!searchContent.value) {
    TipWarning('The search content cannot be empty !')
    return
  }

  if (SEARCH_TYPE_DOMAIN === inputType.value && !isDomain(searchContent.value)) {
    TipWarning('Incorrect domain name format !')
    return
  }

  if (
    SEARCH_TYPE_DOMAIN === inputType.value &&
    isDomain(searchContent.value) &&
    getSecondNameChars(searchContent.value).length < 3
  ) {
    TipWarning('The number of characters of the second-level domain name cannot be less than 3 !')
    return
  }

  if (route.params?.id === searchContent.value) {
    eventHub.emit('update_name')
    return
  }

  const path = inputType.value.toLowerCase()
  router.push(`/${path}/${searchContent.value.toLowerCase()}`)
}

onMounted(syncSearch)
watch(() => route.params?.id, syncSearch)
</script>
