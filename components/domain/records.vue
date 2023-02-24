<template>
  <div v-loading="loading" class="absolute left-0 right-0 bg-[#F8FAFD] pb-16">
    <div class="custom-container px-4">
      <div class="border-b py-5 flex justify-between">
        <span class="font-semibold text-lg">Records :</span>
        <div v-if="accountStore.connected">
          <button
            v-if="changedKeys.length"
            class="mr-3 bg-primary px-4 py-1 text-white rounded font-medium transition hover:opacity-75"
            @click="saveRecords"
          >
            Save&nbsp;{{ changedKeys.length }}&nbsp;<span class="text-xs">records</span>
          </button>
          <button
            v-if="domainStore.domain.mine"
            class="px-4 py-1 rounded font-medium transition hover:opacity-75"
            :class="[editable ? 'bg-blue-100  text-primary' : 'bg-primary text-white']"
            @click="editable = !editable"
          >
            {{ editable ? 'Cancel' : 'Edit' }}
          </button>
        </div>
      </div>

      <div>
        <div class="px-12">
          <p class="font-medium mt-5">Addresses :</p>
          <DomainRecordItem
            v-model:value="records.fil"
            name="FIL"
            :changed-keys="changedKeys"
            :editable="editable"
          />
          <DomainRecordItem
            v-model:value="records.eth"
            name="ETH"
            :changed-keys="changedKeys"
            :editable="editable"
          />
          <DomainRecordItem
            v-model:value="records.btc"
            name="BTC"
            :changed-keys="changedKeys"
            :editable="editable"
          />
          <DomainRecordItem
            v-model:value="records.ltc"
            name="LTC"
            :changed-keys="changedKeys"
            :editable="editable"
          />
          <DomainRecordItem
            v-model:value="records.doge"
            name="DOGE"
            :changed-keys="changedKeys"
            :editable="editable"
          />
          <DomainRecordItem
            v-model:value="records.controller"
            :editable="editable"
            class="border-t pt-5 !w-full"
            name="Controller"
            :changed-keys="changedKeys"
          />
          <DomainRecordItem
            v-model:value="records.content"
            :editable="editable"
            class="border-b pb-5 !w-full"
            name="Content"
            :changed-keys="changedKeys"
          />

          <p class="font-medium mt-5">Text Record :</p>
          <div class="flex">
            <div>
              <DomainRecordItem
                v-model:value="records.filecoinCid"
                :editable="editable"
                name="Filecoin Cid"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records.email"
                :editable="editable"
                name="Email"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records.url"
                :editable="editable"
                name="URL"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records.avatar"
                :editable="editable"
                name="Avatar"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records.description"
                :editable="editable"
                name="Description"
                :changed-keys="changedKeys"
              />
            </div>
            <div class="ml-16">
              <DomainRecordItem
                v-model:value="records['com.twitter']"
                :editable="editable"
                name="Com.Twitter"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records['com.discord']"
                :editable="editable"
                name="Com.Discord"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records['com.reddit']"
                :editable="editable"
                name="Com.Reddit"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records['com.telegram']"
                :editable="editable"
                name="Com.Telegram"
                :changed-keys="changedKeys"
              />
              <DomainRecordItem
                v-model:value="records['com.github']"
                :editable="editable"
                name="Com.Github"
                :changed-keys="changedKeys"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSecondName, NoteError, NoteSuccess } from '~~/composables'
import { useDomainStore, useAccountStore } from '~~/store'

const domainStore = useDomainStore()
const accountStore = useAccountStore()

const editable = ref(false)
const loading = ref(false)

const records = reactive({
  fil: '',
  eth: '',
  btc: '',
  ltc: '',
  doge: '',
  controller: '',
  content: '',
  filecoinCid: '',
  email: '',
  url: '',
  avatar: '',
  description: '',
  'com.twitter': '',
  'com.discord': '',
  'com.reddit': '',
  'com.telegram': '',
  'com.github': ''
})

const changedKeys = computed(() => {
  const keys = []
  const recordsBeforeEdit = domainStore.domain.records
  Object.keys(records).forEach(key => {
    if (records[key] !== recordsBeforeEdit[key]) keys.push(key)
  })
  return keys
})

function isChange(key: string) {
  return changedKeys.value.includes(key)
}

async function saveRecords() {
  const name = domainStore.domain.name

  const requests = []
  const textKeys = []
  const textVals = []

  Object.keys(records).forEach((key, index) => {
    const value = records[key]

    if (isChange(key)) {
      if (index < 5) requests.push(API.setAddress(name, value, key))
      if (index === 5) requests.push(API.setController(name, value))
      if (index === 6) requests.push(API.setContent(name, value))
      if (index > 6) {
        textKeys.push(key)
        textVals.push(value)
      }
    }
  })

  if (textKeys.length) {
    requests.push(API.setTexts(name, textKeys, textVals))
  }

  try {
    loading.value = true
    await Promise.all(requests)
    NoteSuccess('Set successfully, waiting 3 - 5 minutes for taking effect')
    domainStore.setRecords(records)
  } catch (error) {
    NoteError('Set error')
    setRecords()
  } finally {
    editable.value = false
    loading.value = false
  }
}

function setRecords() {
  Object.assign(records, JSON.parse(JSON.stringify(domainStore.domain.records)))
}

onMounted(setRecords)
watch(() => domainStore.domain.records, setRecords)
</script>
