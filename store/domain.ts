import { defineStore } from 'pinia'

export const useDomainStore = defineStore('domain', {
  state: () => ({
    domain: {
      name: '',
      level: 2,
      content: '',
      address: '',
      available: false,
      pending: false,
      parent: '',
      registrant: '',
      controller: '',
      expires: '',
      mine: false,
      resolver: '',
      subdomains: [] as string[],
      records: {
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
      }
    }
  }),

  getters: {},

  actions: {
    setRecords(records: any) {
      this.domain.records = Object.assign({}, this.domain.records, records)
    },

    setDomain(domain: any) {
      Object.assign(this.domain, domain)
    },

    setSubdomains(subdomains: string[]) {
      this.domain.subdomains = [...new Set(subdomains)]
    }
  }
})
