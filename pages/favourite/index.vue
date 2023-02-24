<template>
  <div v-loading="loading" class="p-4 flex flex-col">
    <el-table
      size="large"
      header-cell-class-name="text-base text-custom-gray font-light h-16"
      cell-class-name="text-black h-16"
      :data="_storedDomains"
    >
      <el-table-column prop="name" label="Name" sortable>
        <template #default="scope">
          <span class="flex items-center">
            <NuxtLink
              :to="`/domain/${scope.row.name}?tab=details`"
              class="bg-[#F8FAFD] text-sm text-primary px-3 py-1.5 rounded cursor-pointer"
            >
              {{ scope.row.name }}
            </NuxtLink>
            <IconCopy class="ml-2" @click="Copy(scope.row.name)" />
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="expires" label="Expiration time" align="center" sortable>
      </el-table-column>
      <el-table-column prop="available" label="Available" align="center">
        <template #default="scope">
          <div class="flex-center">
            <IconAvailable v-if="scope.row.available" />
            <IconUnavailable v-else />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Handle" align="center" width="200">
        <template #default="scope">
          <NuxtLink
            :to="`/domain/${scope.row.name}?tab=${scope.row.available ? 'register' : 'details'}`"
            class="w-22 mr-2 inline-block cursor-pointer bg-[#F8FAFD] text-sm text-center text-primary px-3 py-1 rounded transition border border-transparent hover:border-primary"
          >
            {{ scope.row.available ? 'Register' : 'Details' }}
          </NuxtLink>

          <el-popconfirm title="Remove ?" @confirm="domainsStore.storeDomain(scope.row.name)">
            <template #reference>
              <span
                class="bg-[#F8FAFD] text-sm text-red-400 px-3 py-1 transition rounded cursor-pointer border border-transparent hover:border-red-400"
                >Remove</span
              >
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="self-end mt-4 transform translate-x-4"
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="storedDomains.length"
      @current-change="setCurrentPage"
    />
  </div>
</template>

<script setup lang="ts">
import { useFavouriteStore } from '~/store'
import { Copy, TipError } from '~~/composables'

const loading = ref(false)
const domainsStore = useFavouriteStore()
const storedDomains = ref([])

const pageSize = 8
const current = ref(1)
const _storedDomains = computed(() =>
  storedDomains.value.slice((current.value - 1) * pageSize, pageSize * current.value)
)

function setCurrentPage(page: number) {
  current.value = page
}

async function getFavouriteNames() {
  const _names = domainsStore.storedDomains

  if (!_names.length) {
    storedDomains.value = []
    return
  }

  try {
    loading.value = true
    const requests = _names.filter(n => n).map(API.getNameInfo)
    storedDomains.value = await Promise.all(requests)
  } catch (error) {
    TipError('Network Error !')
  } finally {
    loading.value = false
  }
}

watchEffect(getFavouriteNames)
</script>

<style lang="less">
.el-table--large .cell {
  @apply px-0;
}
</style>
