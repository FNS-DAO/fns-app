<template>
  <div class="w-full flex flex-col">
    <div
      class="bg-white transition flex-center border border-primary text-primary rounded my-6 font-semibold"
    >
      <input
        ref="inputRef"
        v-model.trim="input"
        type="text"
        maxlength="100"
        placeholder="Input address or domain"
        :class="{
          'text-red-400': inputType === SEARCH_TYPE_DOMAIN && input && !isDomain(input)
        }"
        class="flex-1 font-semibold placeholder-gray-300 p-3 outline-none rounded"
        @keydown.enter="skip"
      />
      <span v-if="inputType === SEARCH_TYPE_DOMAIN" class="pr-4">.fil</span>
    </div>
    <button
      class="self-center bg-primary px-4 py-2 flex-center rounded text-white font-medium transition hover:opacity-80"
      @click="skip"
    >
      <IconSearch class="h-4 mr-1" />
      Search
    </button>
  </div>
</template>

<script setup lang="ts">
import { SEARCH_TYPE_ADDRESS, SEARCH_TYPE_DOMAIN } from '~~/constants'
import { isAddress, isDomain, TipWarning, getSecondNameChars } from '~~/libs/utils'

const input = ref('')
const inputRef = ref(null)
const router = useRouter()
const inputType = computed(() =>
  isAddress(input.value) ? SEARCH_TYPE_ADDRESS : SEARCH_TYPE_DOMAIN
)

const searchContent = computed(() => {
  let _input = input.value

  if (_input && inputType.value === SEARCH_TYPE_DOMAIN) {
    _input = /\.fil$/.test(_input) ? _input : `${_input}.fil`
  }

  return _input
})

function skip() {
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

  const path = inputType.value.toLowerCase()
  router.push(`/${path}/${searchContent.value.toLowerCase()}`)
}

onMounted(() => inputRef.value.focus())
</script>
