<template>
  <div v-loading="loading" class="bg-[#E9FCDB] py-6 primary-name">
    <div class="custom-container px-4 flex items-center text-xl font-medium text-[#62EB01]">
      <IconAvailable class="!h-10 mr-3" />
      Primary FNS name ( reverse record ) : {{ addressStore.primaryName || 'Not Set' }}
      <template v-if="accountStore.connected && !addressStore.pending">
        <span
          v-if="editable"
          class="text-primary text-sm font-light border border-primary px-2 py-0.5 ml-4 rounded transition cursor-pointer hover:(bg-primary text-white )"
          @click="extendSet = !extendSet"
          >Set Now</span
        >
        <el-popconfirm title="Delete ?" @confirm="deletePrimaryName">
          <template #reference>
            <span
              v-if="editable && addressStore.primaryName"
              class="ml-4 text-red-400 text-sm font-light border border-current px-2 py-0.5 ml-4 rounded transition cursor-pointer hover:(bg-red-400 text-white )"
              >Delete</span
            >
          </template>
        </el-popconfirm>
      </template>
      <span
        v-if="editable && addressStore.pending"
        class="ml-auto flex-center text-primary text-base font-light"
      >
        <IconClock class="mr-1" />
        Pending...
      </span>
    </div>
    <div v-if="extendSet" class="custom-container px-17 font-light text-[#B7B7B7]">
      <p class="text-sm w-1/2 <lg:w-2/3">
        This designates one of your FNS names to represent your Filecoin account and act as your
        cross-platform web3 uername and profile. You can only have one Primary FNS Name per Filecoin
        account and can change it at any time.
      </p>

      <el-select
        v-model="addressStore.primaryName"
        clearable
        class="mt-3 w-1/3 <lg:w-1/2 !font-medium"
        cla
        placeholder="Select one of your FNS names"
        size="large"
      >
        <el-option v-for="name in options" :key="name" :label="name" :value="name" />
      </el-select>

      <p class="text-sm w-1/2 <lg:w-2/3 my-6">
        Only FNS names that point to your Filecoin account can be set as your Primary FNS Name.
      </p>
      <div class="flex items-center">
        <button
          class="w-20 h-8 flex-center rounded text-[#E7E7E7] bg-white mr-4 font-bold hover:opacity-75"
          @click="extendSet = false"
        >
          Cancel
        </button>
        <button
          class="w-20 h-8 flex-center rounded text-white bg-primary font-bold hover:opacity-75"
          @click="savePrimaryName"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NoteError, NoteSuccess, setPendingToLocal } from '~~/composables'
import { useAccountStore, useAddressStore } from '~~/store'

const route = useRoute()
const accountStore = useAccountStore()
const addressStore = useAddressStore()

const loading = ref(false)
const extendSet = ref(false)
const address = computed(() => route.params.id)
const editable = computed(() => accountStore.account === address.value)
const options = computed(() => addressStore.registrant.map(({ name }) => name))

async function savePrimaryName() {
  try {
    loading.value = true
    await API.setName(addressStore.primaryName)
    NoteSuccess('Submitted, waiting for 3 - 5 minutes to take effect')
    addressStore.setAddress({ pending: true })
    setPendingToLocal(address.value)
  } catch (error) {
    const msg = /rejected/.test(error)
      ? 'The user rejected the transaction request'
      : 'Some errors occurred'
    NoteError(msg, 'Delete Error')
  } finally {
    extendSet.value = false
    loading.value = false
  }
}

function deletePrimaryName() {
  addressStore.setAddress({ primaryName: '' })
  savePrimaryName()
}
</script>

<style lang="less">
.primary-name {
  .el-input__wrapper {
    padding: 5px 15px;
    box-shadow: none;
  }
}
</style>
