<template>
  <client-only>
    <el-dialog
      v-model="showDialog"
      width="35%"
      class="p-5 !rounded-lg"
      :destroy-on-close="true"
      @close="$emit('close')"
    >
      <template #header>
        <span class="font-semibold text-2xl">Add Subdomain</span>
      </template>
      <div
        class="subdomain-wrap text-base font-medium flex-center rounded transition border border-[#F8FAFD] bg-[#F8FAFD]"
      >
        <input
          ref="inputRef"
          v-model.trim="subdomain"
          maxlength="100"
          :class="{ 'text-red-400': subdomain && !/^[\da-z\s]+$/.test(subdomain) }"
          class="flex-1 placeholder-[#B7B7B7] p-3 rounded outline-none text-primary bg-[#F8FAFD]"
          placeholder="Please enter subdomain prefix"
          @keydown.enter="() => /^[\da-zA-Z]+$/.test(subdomain) && saveSubdomain()"
        />
        <span class="px-4">.{{ domainStore.domain.name }}</span>
      </div>
      <div class="mt-2 p-2 max-h-24 overflow-auto text-base">
        {{ subdomain }}.{{ domainStore.domain.name }}
      </div>

      <template #footer>
        <span class="flex text-lg mt-10">
          <button
            class="w-20 h-10 flex-center rounded text-custom-gray bg-[#F8FAFD] mr-4 font-semibold hover:opacity-75"
            @click="showDialog = false"
          >
            Cancel
          </button>
          <button
            :disabled="!/^[\da-zA-Z]+$/.test(subdomain)"
            :class="{ 'cursor-not-allowed bg-gray-300': !/^[\da-zA-Z]+$/.test(subdomain) }"
            class="w-20 h-10 flex-center rounded text-white bg-primary font-semibold hover:opacity-75"
            @click="saveSubdomain"
          >
            Save
          </button>
        </span>
      </template>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import { NoteSuccess } from '~~/composables'
import { useDomainStore, useAccountStore } from '~~/store'

const domainStore = useDomainStore()
const accountStore = useAccountStore()

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show'])

const inputRef = ref(null)
const subdomain = ref('')

const showDialog = computed({
  set(val) {
    emit('update:show', val)
  },
  get() {
    return props.show
  }
})

async function saveSubdomain() {
  const name = domainStore.domain.name
  const subname = subdomain.value
  const owner = accountStore.account
  await API.setSubdomain(name, subname, owner)
  NoteSuccess('Set successfully, waiting 3 - 5 minutes for taking effect')
  showDialog.value = false
}

watch(subdomain, val => {
  if (/[A-Z]+/.test(val)) {
    subdomain.value = val.toLowerCase()
  }
})

watch(
  () => showDialog.value,
  val => {
    if (val) setTimeout(() => inputRef.value.focus())
    if (!val) subdomain.value = ''
  }
)
</script>

<style scoped lang="less">
.subdomain-wrap:has(input:focus) {
  @apply border-primary;
}
</style>
