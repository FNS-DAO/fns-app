import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import { formatUnits } from '@ethersproject/units'
import { NoteInfo, NoteHaveNoMetamask, NoteError } from './utils'
import { useAccountStore } from '~~/store'
import { RPC, EXPLORER_URL, CHAIN_ID } from '~~/constants'

class Wallet {
  public provider!: any
  public web3Provider!: any
  public defaultProvider!: any

  constructor() {
    this.setDefaultProvider()
  }

  public async requestAccount() {
    const web3Provider = await this.getWeb3Provider()
    const chainId = await web3Provider.provider.request({ method: 'eth_chainId' })
    const accounts = await web3Provider.provider.request({ method: 'eth_requestAccounts' })
    const balance = formatUnits(await web3Provider.getBalance(accounts[0]))

    const accountStore = useAccountStore()
    accountStore.setAccount(accounts[0])
    accountStore.setNetwork(chainId)
    accountStore.setBalance(balance)

    if (+balance > 0) {
      this.setWeb3Provider()
    } else {
      this.setDefaultProvider()
    }
  }

  public addListeners(metamaskProvider: any) {
    if (!metamaskProvider) return

    metamaskProvider.on('accountsChanged', () => {
      if (useAccountStore().connected) {
        this.requestAccount()
      }
    })

    metamaskProvider.on('chainChanged', (chainId: string) => {
      if (chainId !== CHAIN_ID) {
        NoteError('Unsupported network', 'Network Error')
        this.disconnect()
        return
      }

      this.requestAccount()
    })
  }

  public async connect() {
    try {
      const web3Provider = await this.getWeb3Provider()
      if (!web3Provider) return

      web3Provider.provider.removeAllListeners()
      if (web3Provider.provider.chainId !== CHAIN_ID) {
        await this.switchNetwork()
      }
      this.addListeners(web3Provider.provider)

      await this.requestAccount()
    } catch (error: any) {
      if (/network\schanged/.test(error)) {
        this.requestAccount()
        return
      }
      NoteInfo('Connect Error')
    }
  }

  public disconnect() {
    const accountStore = useAccountStore()
    accountStore.setAccount('')
    accountStore.setNetwork('')
    accountStore.setBalance('')
    this.setDefaultProvider()
  }

  public getProvider() {
    return this.provider
  }

  public async getWeb3Provider() {
    const metamaskProvider = (await detectEthereumProvider()) as any

    if (metamaskProvider) {
      this.web3Provider = new ethers.providers.Web3Provider(metamaskProvider)
    } else {
      NoteHaveNoMetamask()
    }

    return this.web3Provider
  }

  public setWeb3Provider() {
    this.provider = this.web3Provider
  }

  public setDefaultProvider() {
    if (!this.defaultProvider) {
      this.defaultProvider = ethers.getDefaultProvider(RPC)
    }
    this.provider = this.defaultProvider
  }

  public async switchNetwork() {
    if (!this.web3Provider) return

    await this.web3Provider.provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: CHAIN_ID,
          chainName: 'Filecoin hyperspace',
          rpcUrls: [RPC],
          blockExplorerUrls: [EXPLORER_URL],
          nativeCurrency: {
            name: 'tFIL',
            symbol: 'tFIL',
            decimals: 18
          }
        }
      ]
    })

    await this.web3Provider.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID }]
    })
  }
}

export const wallet = new Wallet()
