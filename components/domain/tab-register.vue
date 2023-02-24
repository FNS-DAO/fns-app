<template>
  <div v-loading="loading" class="font-light">
    <template v-if="domainStore.domain.available">
      <div class="flex items-center mt-8">
        <span class="w-32">Period :</span>
        <div class="flex-center">
          <span class="period-ctl-btn w-9" @click="registerYear > 1 && registerYear--"
            ><IconMinus
          /></span>
          <span class="period-ctl-btn px-4 mx-2 font-semibold"
            >{{ registerYear }} {{ registerYear < 2 ? 'year' : 'years' }}</span
          >
          <span class="period-ctl-btn w-9 text-4xl" @click="registerYear++"><IconPlus /></span>
        </div>
      </div>
      <div class="flex items-center my-10">
        <span class="w-32">Price :</span>
        <span class="font-semibold">{{ toFixed(fee.buy, 6) }} TFIL</span>
        <span class="text-custom-gray"
          >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(fee.buy, filPriceInUsd, 0, 6) }}</span
        >
      </div>
      <div class="flex items-center my-10">
        <span class="w-32">Gas Fee :</span>
        <span class="font-semibold">{{ toFixed(fee.gas, 6) }} TFIL</span>
        <span class="text-custom-gray"
          >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(fee.gas, filPriceInUsd, 0, 6) }}</span
        >
      </div>
      <div class="border-t border-gray-500 flex items-center">
        <div class="flex items-center my-10">
          <span class="w-32">Total :</span>
          <span class="font-semibold">{{ toFixed(fee.all, 6) }} TFIL</span>
          <span class="text-custom-gray"
            >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(fee.all, filPriceInUsd, 0, 6) }}</span
          >
        </div>
        <button
          :disabled="!isSufficient"
          class="ml-auto text-white font-medium rounded px-4 py-1.5 transition hover:opacity-80"
          :class="[isSufficient ? 'bg-primary' : 'bg-red-400 cursor-not-allowed']"
          @click="submitRegister"
        >
          {{ isSufficient ? 'Register Now' : 'Insufficient Balance' }}
        </button>
      </div>
      <div class="flex items-center">
        <span class="w-32">Your balance :</span>
        <span class="font-semibold" :class="[isSufficient ? 'text-primary' : 'text-red-400']"
          >{{ toFixed(accountStore.balance, 6) }} TFIL</span
        >
        <span class="text-custom-gray"
          >&emsp;≈&emsp;$&nbsp;{{
            formatAssetValue(accountStore.balance, filPriceInUsd, 0, 6)
          }}</span
        >
      </div>
    </template>

    <p v-else class="flex-center items-end text-xl h-64">
      {{ domainStore.domain.pending ? 'Pending...' : 'This name is already registered' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { TipError, NoteSuccess, setPendingToLocal } from '~~/libs/utils'
import { useAccountStore, useDomainStore } from '~~/store'
import { isBalanceSufficient, toFixed, formatAssetValue } from '~~/libs/filters'

const domainStore = useDomainStore()
const accountStore = useAccountStore()

const loading = ref(false)
const route = useRoute()
const registerYear = ref(1)
const filPriceInUsd = ref(0)
const fee = ref({ gas: 0, buy: 0, all: 0 })

const isSufficient = computed(() => {
  const need = fee.value.all
  const balance = accountStore.balance
  return isBalanceSufficient(need, balance)
})

async function computeRegisterFee() {
  const name = route.params.id
  const duration = registerYear.value * 365 * 86400 // second
  fee.value = await API.estimateFee(name, duration)
  filPriceInUsd.value = await API.getFilPrice()
}

function resetRegister() {
  registerYear.value = 1
}

async function submitRegister() {
  try {
    loading.value = true
    const name = route.params.id
    const owner = accountStore.$state.account
    const duration = registerYear.value * 365 * 86400 // second
    await API.registerName(name, owner, duration, fee.value.buy)

    NoteSuccess('Submitted, waiting for 3 - 5 minutes to take effect')
    setPendingToLocal(name)
    domainStore.setDomain({ available: false, pending: true })

    resetRegister()
  } catch (error) {
    TipError('Register Error !')
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(registerYear, computeRegisterFee)
onMounted(computeRegisterFee)
</script>

<style scoped lang="less">
.period-ctl-btn {
  @apply flex-center h-9 bg-[#F8FAFD] rounded cursor-pointer border border-transparent transition hover:(border border-primary text-primary);
}
</style>
