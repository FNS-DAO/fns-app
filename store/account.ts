import { defineStore } from 'pinia'
import { CHAIN_ID } from '~~/constants'

export const useAccountStore = defineStore('account', {
  state: () => ({
    chainId: '',
    account: '',
    balance: ''
  }),
  getters: {
    shortAccount: state => {
      if (!state.account) return '...'
      return `${state.account.slice(0, 6)}...${state.account.slice(-4)}`
    },
    connected: state => !!state.account,
    rightNetwork: state => {
      return state.chainId === CHAIN_ID
    },
    network: state => {
      return state.chainId === CHAIN_ID ? 'Hyperspace Testnet' : 'Error'
    }
  },
  actions: {
    setAccount(account: string) {
      this.account = account.toLowerCase()
    },
    setNetwork(chainId: string) {
      this.chainId = chainId
    },
    setBalance(balance: string) {
      this.balance = balance
    }
  }
})
