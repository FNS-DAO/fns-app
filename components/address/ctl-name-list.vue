<template>
  <div
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0)"
    class="flex flex-col items-end"
  >
    <el-table
      ref="tableRef"
      size="large"
      row-key="date"
      :data="_names"
      header-cell-class-name="text-base text-custom-gray font-light h-16"
      cell-class-name="text-black h-16"
    >
      <template #empty>
        <el-empty description="No domains" />
      </template>
      <el-table-column sortable prop="name" label="Name" column-key="date" align="left">
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
      <el-table-column prop="address" label="Resolve to FIL" align="left" />
      <el-table-column prop="expires" label="Expiration time" align="left" sortable>
      </el-table-column>
      <el-table-column v-if="accountStore.connected" label="Handle" align="right" :width="150">
        <template #default="scope">
          <NuxtLink
            :to="`/domain/${scope.row.name}?tab=details`"
            class="inline-block cursor-pointer bg-[#F8FAFD] text-sm text-primary font-medium px-3 py-1 rounded transition hover:(bg-primary text-white)"
          >
            Renew
          </NuxtLink>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="mt-4 transform translate-x-4"
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="names.length"
      @current-change="setCurrentPage"
    />
  </div>
</template>

<script setup lang="ts">
import { Copy } from '~~/composables'
import { useAccountStore } from '~~/store'

const props = defineProps<{ names?: any[]; loading: boolean }>()
const accountStore = useAccountStore()

const pageSize = 8
const current = ref(1)
const _names = computed(() =>
  props.names.slice((current.value - 1) * pageSize, pageSize * current.value)
)

function setCurrentPage(page: number) {
  current.value = page
}
</script>
