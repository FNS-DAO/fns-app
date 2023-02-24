<template>
  <div v-loading="loading" class="font-light">
    <div class="flex items-center my-10">
      <span class="w-32">Parent :</span>
      <span class="font-semibold uppercase">{{ domainStore.domain.parent }}</span>
    </div>
    <div class="flex items-center my-10">
      <span class="w-32">Registrant :</span>
      <span v-if="domainStore.domain.registrant" class="flex-center"
        >{{ domainStore.domain.registrant
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.registrant)"
      /></span>
    </div>
    <div class="flex items-center my-10">
      <span class="w-32">Controller :</span>
      <span v-if="domainStore.domain.controller" class="flex-center"
        >{{ domainStore.domain.controller
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.controller)"
      /></span>
    </div>
    <div class="flex items-center border-t border-gray-500 pt-10 my-10">
      <span class="w-32">Resolve to FIL :</span>
      <span v-if="domainStore.domain.address" class="flex-center"
        >{{ domainStore.domain.address
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.address)"
      /></span>
    </div>
    <div class="flex items-center my-10">
      <span class="w-32">Content :</span>
      <span v-if="domainStore.domain.content" class="flex-center"
        >{{ domainStore.domain.content
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.content)"
      /></span>
    </div>
    <div class="flex items-center my-10">
      <span class="w-32">Filecoin Cid :</span>
      <span v-if="domainStore.domain.records.filecoinCid" class="flex-center"
        >{{ domainStore.domain.records.filecoinCid
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.records.filecoinCid)"
      /></span>
    </div>
    <div class="flex items-center">
      <span class="w-32">Expiration time :</span>
      <span v-if="domainStore.domain.expires" class="flex-center font-bold">
        {{ domainStore.domain.expires }}
        <IconCopy class="ml-2" @click="Copy(domainStore.domain.expires)" />
        <span v-if="accountStore.connected" class="ml-4 renew-btn" @click="renew = !renew">{{
          renew ? 'Cancel' : 'Renew'
        }}</span></span
      >
    </div>
    <DomainRenew v-if="renew && !domainStore.domain.available && connected" />

    <div class="flex items-center border-t border-gray-500 pt-10 my-10">
      <span class="w-32">Resolver :</span>
      <span v-if="domainStore.domain.resolver" class="flex-center"
        >{{ domainStore.domain.resolver
        }}<IconCopy class="ml-2" @click="Copy(domainStore.domain.resolver)" />
      </span>
    </div>

    <DomainRecords />
  </div>
</template>

<script setup lang="ts">
import { Copy } from '~~/libs/utils'
import { useAccountStore, useDomainStore } from '~~/store'

const domainStore = useDomainStore()
const accountStore = useAccountStore()

const loading = ref(false)
const renew = ref(false)
const connected = computed(() => accountStore.connected)
</script>

<style scoped lang="less">
.renew-btn {
  @apply px-2 font-medium text-sm text-primary border rounded border-current cursor-pointer transition hover:(bg-primary text-white border-primary);
}
</style>
