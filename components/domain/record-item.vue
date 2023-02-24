<template>
  <div class="flex items-center my-5 w-150">
    <img :src="icon[name] || defaultIcon" class="w-5 mr-3" />
    <span class="w-32 text-base font-light" :class="{ 'text-primary': isChanged }"
      >{{ name }} :</span
    >
    <input
      v-model="recordValue"
      :disabled="!editable"
      :placeholder="editable ? placeholder || 'Input value' : ''"
      :class="{ 'bg-blue-100': isChanged, 'border-transparent bg-transparent': !editable }"
      class="flex-1 text-sm placeholder-[#B7B7B7] p-3 rounded outline-none text-primary border border-transparent transition focus:border-primary"
      @keydown.enter="e => $emit('enter', e)"
    />
  </div>
</template>

<script setup lang="ts">
import FIL from '~~/assets/icons/FIL.png'
import ETH from '~~/assets/icons/ETH.png'
import BTC from '~~/assets/icons/BTC.png'
import LTC from '~~/assets/icons/LTC.png'
import DOGE from '~~/assets/icons/DOGE.png'
import Email from '~~/assets/icons/Email.png'
import Controller from '~~/assets/icons/Controller.png'
import Avatar from '~~/assets/icons/Avatar.png'
import URL from '~~/assets/icons/URL.png'
import Description from '~~/assets/icons/Description.png'
import ComGithub from '~~/assets/icons/Com.Github.png'
import ComTwitter from '~~/assets/icons/Com.Twitter.png'
import ComDiscord from '~~/assets/icons/Com.Discord.png'
import ComReddit from '~~/assets/icons/Com.Reddit.png'
import ComTelegram from '~~/assets/icons/Com.Telegram.png'
import FilecoinCid from '~~/assets/icons/FilecoinCid.png'
import Content from '~~/assets/icons/Content.png'
import defaultIcon from '~~/assets/icons/default.png'

const props = defineProps<{
  name: string
  value: string
  changedKeys: string[]
  editable: boolean
  placeholder?: string
}>()
const emit = defineEmits(['update:value'])

const isChanged = computed(() => props.changedKeys.includes(props.name.toLowerCase()))

const recordValue = computed({
  set: val => emit('update:value', val),
  get: () => props.value
})

const icon = {
  FIL,
  ETH,
  BTC,
  LTC,
  DOGE,
  Email,
  Content,
  Controller,
  URL,
  Avatar,
  Description,
  'Filecoin Cid': FilecoinCid,
  'Com.Twitter': ComTwitter,
  'Com.Github': ComGithub,
  'Com.Discord': ComDiscord,
  'Com.Reddit': ComReddit,
  'Com.Telegram': ComTelegram
}
</script>
