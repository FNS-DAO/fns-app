<template>
  <div v-loading="loading" class="font-light bg-[#F8FAFD] mt-5 p-5">
    <div class="flex items-center">
      <span class="w-32">Period :</span>
      <div class="flex-center">
        <span class="period-ctl-btn w-9 text-4xl" @click="registerYear > 1 && registerYear--"
          >-</span
        >
        <span class="period-ctl-btn px-4 mx-2 font-semibold"
          >{{ registerYear }} {{ registerYear < 2 ? 'year' : 'years' }}</span
        >
        <span class="period-ctl-btn w-9 text-4xl" @click="registerYear++">+</span>
      </div>
    </div>
    <div class="flex items-center my-5">
      <span class="w-32">Price :</span>
      <span class="font-semibold">{{ toFixed(fee.buy, 6) }} TFIL</span>
      <span class="text-custom-gray"
        >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(fee.buy, filPriceInUsd, 0, 6) }}</span
      >
    </div>
    <div class="flex items-center my-5">
      <span class="w-32">Gas Fee :</span>
      <span class="font-semibold">{{ toFixed(fee.gas, 6) }} TFIL</span>
      <span class="text-custom-gray"
        >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(fee.gas, filPriceInUsd, 0, 6) }}</span
      >
    </div>
    <div class="border-t border-dashed border-gray-400 flex items-center">
      <div class="flex items-center my-5">
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
        {{ isSufficient ? 'Renew Now' : 'Insufficient Balance' }}
      </button>
    </div>
    <div class="flex items-center">
      <span class="w-32">Your balance :</span>
      <span class="font-semibold" :class="[isSufficient ? 'text-primary' : 'text-red-400']"
        >{{ toFixed(accountStore.balance, 6) }} TFIL</span
      >
      <span class="text-custom-gray"
        >&emsp;≈&emsp;$&nbsp;{{ formatAssetValue(accountStore.balance, filPriceInUsd, 0, 6) }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { NoteError, NoteSuccess } from '~~/libs/utils'
import { useAccountStore } from '~~/store'
import { toFixed, isBalanceSufficient, formatAssetValue } from '~~/libs/filters'

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
    const _name = name.match(/[\da-zA-Z]+\.fil$/)[0]
    const duration = registerYear.value * 365 * 86400 // second
    await API.renewName(_name, duration, fee.value.buy)
    NoteSuccess('Submitted, waiting for 3 - 5 minutes to take effect')
    resetRegister()
  } catch (error) {
    NoteError('Register Error !')
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
