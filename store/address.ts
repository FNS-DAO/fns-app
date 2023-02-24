import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({
    pending: false,
    primaryName: '',
    registrant: [],
    controller: []
  }),

  actions: {
    setAddress(props: Record<string, any>) {
      Object.assign(this, props)
    }
  }
})
