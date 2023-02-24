import { utils } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { toUtf8String } from 'ethers/lib/utils'
import axios from 'axios'
import { getSecondName, labelhash, NoteError, NoteSuccess, removePendingFromLocal } from './utils'
import { formatTime } from './filters'
import { CONTRACT_ADDRESS, RECORD_ADDRESS_ID, SERVER } from '~~/constants'
import {
  useContractIRegistrarController,
  useContractPublicResolver,
  useContractIRegistrar,
  useContractFNSRegistry,
  useContractReverseRegistrar
} from '~~/libs/contract'
import { eventHub } from '~~/libs/event-hub'
import { wallet } from '~/libs/wallet'
import { useAccountStore, useDomainStore } from '~~/store'

function listenTx(tx: any, data?: any) {
  if (!tx) return
  const _txName = data?.txName ?? 'Transaction'

  tx.wait()
    .then(({ status }: any) => {
      if (status === 1) {
        if (data?.txType === 'register') {
          removePendingFromLocal(data?.name)
          eventHub.emit('update_name')
        }

        if (data?.txType === 'setName') {
          removePendingFromLocal(useAccountStore().account)
          eventHub.emit('update_address')
        }

        NoteSuccess(`${_txName} has taken effect`)
      } else {
        NoteError(`${_txName} faild`)
      }
    })
    .catch(error => {
      console.log(`${_txName} Error:`, error)
    })
}

export const API = {
  async getNameInfo(name: string) {
    const secondName = getSecondName(name)

    const Name = {
      name,
      available: false,
      address: '',
      expires: '',
      contenthash: '',
      registrant: '',
      controller: '',
      resolver: CONTRACT_ADDRESS.PublicResolver,
      subdomains: []
    } as any

    const IRegistrarController = (await useContractIRegistrarController()) as any
    const _name = secondName.replace(/\.fil$/, '')

    Name.available = await IRegistrarController.available(_name)

    if (!Name.available) {
      const PublicResolver = (await useContractPublicResolver()) as any
      const IRegistrar = (await useContractIRegistrar()) as any
      const FNSRegistry = (await useContractFNSRegistry()) as any
      const namehash = utils.namehash(name)

      const [controller, registrant, address, expires, contenthash] = await Promise.all([
        FNSRegistry.owner(namehash),
        IRegistrar.ownerOf(utils.keccak256(utils.toUtf8Bytes(_name))),
        PublicResolver['addr(bytes32,uint256)'](namehash, 461),
        IRegistrarController.nameExpires(_name),
        PublicResolver.contenthash(namehash)
      ])

      Name.controller = controller
      Name.registrant = registrant
      Name.address = utils.toUtf8String(address)
      Name.expires = `${formatTime(expires, 'YYYY-MM-DD [at] HH:mm')} (UTC+08:00)`
      Name.contenthash = toUtf8String(contenthash)
    }

    return Name
  },

  async getRecords(name: string) {
    const domainStore = useDomainStore()
    const records = domainStore.domain.records

    const requests = Object.keys(records).map((key, index) => {
      if (index < 5) return this.getAddress(name, key)
      if (index === 5) return this.getController(name)
      if (index === 6) return this.getContent(name)
      if (index > 6) return this.getText(name, key)
    })

    const results = await Promise.all(requests)
    const records_ = {}

    results.forEach(item => Object.keys(item).forEach(key => (records_[key] = item[key])))
    Object.assign(records, records_)

    return records
  },

  async estimateGasFee(name: string, duration: number) {
    const provider = await wallet.getWeb3Provider()
    const contract = (await useContractIRegistrarController()) as any
    const _name = name.replace(/\.fil$/, '')

    const gasPrice = await provider.getGasPrice()
    const gasLimit = await contract.estimateGas.rentPrice(_name, duration)

    return gasPrice.mul(gasLimit)
  },

  async estimateBuyFee(name: string, duration: number) {
    const contract = (await useContractIRegistrarController()) as any
    const _name = name.replace(/\.fil$/, '')
    const { base } = await contract.rentPrice(_name, duration)
    return base
  },

  async estimateFee(name: string, duration: number) {
    const [gas, buy] = await Promise.all([
      this.estimateGasFee(name, duration),
      this.estimateBuyFee(name, duration)
    ])
    const all = gas.add(buy)

    return {
      gas: formatUnits(gas),
      buy: formatUnits(buy),
      all: formatUnits(all)
    }
  },

  async registerName(
    name: string,
    owner: string,
    duration: number,
    fee: string,
    resolver = CONTRACT_ADDRESS.PublicResolver,
    data = [],
    reverseRecord = true
  ) {
    const contract = (await useContractIRegistrarController()) as any
    const _name = name.replace(/\.fil$/, '')
    const tx = await contract.register(_name, owner, duration, resolver, data, reverseRecord, {
      value: utils.parseEther(fee)
    })

    listenTx(tx, { txName: `Register ${name}`, txType: 'register', name })
  },

  async renewName(name: string, duration: number, fee: string) {
    const contract = (await useContractIRegistrarController()) as any
    const _name = name.replace(/\.fil$/, '')
    const tx = await contract.renew(_name, duration, {
      value: utils.parseEther(fee)
    })

    listenTx(tx, { txName: `Renew ${name}`, txType: 'renew', name })
  },

  async setName(name: string) {
    const ReverseRegistrar = (await useContractReverseRegistrar()) as any
    const tx = await ReverseRegistrar.setName(name)

    listenTx(tx, {
      txName: 'Set primary name',
      txType: 'setName',
      name
    })
  },

  async getName(address: string) {
    const ReverseRegistrar = (await useContractReverseRegistrar()) as any
    const PublicResolver = (await useContractPublicResolver()) as any

    const reverseNode = await ReverseRegistrar.node(address)
    return PublicResolver.name(reverseNode)
  },

  async setController(name: string, address: string) {
    const FNSRegistry = (await useContractFNSRegistry()) as any

    const node = utils.namehash(name)
    const tx = await FNSRegistry.setOwner(node, address)

    listenTx(tx, { txName: 'Set controller', txType: 'setOwner' })
  },

  async getController(name: string) {
    const FNSRegistry = (await useContractFNSRegistry()) as any

    const node = utils.namehash(name)
    const owner = await FNSRegistry.owner(node)
    return { controller: owner }
  },

  async setAddress(name: string, address: string, type: string) {
    const contract = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)

    const tx = await contract['setAddr(bytes32,uint256,bytes)'](
      namehash,
      RECORD_ADDRESS_ID[type],
      utils.toUtf8Bytes(address),
      { value: 0 }
    )

    listenTx(tx, { txName: `Set ${type.toUpperCase()} address`, txType: 'setAddr', name })
  },

  async getAddress(name: string, type: string) {
    const PublicResolver = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const address = await PublicResolver['addr(bytes32,uint256)'](namehash, RECORD_ADDRESS_ID[type])
    return { [type]: utils.toUtf8String(address) }
  },

  async setText(name: string, key: string, value: string) {
    const contract = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const tx = await contract.setText(namehash, key, value)

    listenTx(tx, { txName: `Set record ${key} = ${value}`, txType: 'setText', name })
  },

  async setTexts(name: string, keys: string[], values: string[]) {
    const contract = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const tx = await contract.setTexts(namehash, keys, values)

    listenTx(tx, { txName: `Set records`, txType: 'setTexts', name })
  },

  async getText(name: string, key: string) {
    const contract = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const text = await contract.text(namehash, key)
    return { [key]: text }
  },

  async setContent(name: string, content: string) {
    const contract = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const tx = await contract.setContenthash(namehash, utils.toUtf8Bytes(content))
    useDomainStore().setDomain({ content })

    listenTx(tx, { txName: `Set content`, txType: 'setContenthash', name, content })
  },

  async getContent(name: string) {
    const PublicResolver = (await useContractPublicResolver()) as any
    const namehash = utils.namehash(name)
    const contenthash = await PublicResolver.contenthash(namehash)

    return { content: toUtf8String(contenthash) }
  },

  async setSubdomain(name: string, subname: string, ownerAddress: string) {
    const FNSRegistry = (await useContractFNSRegistry()) as any

    const namehash = utils.namehash(name)
    const label = labelhash(subname)
    await axios.post(`${SERVER}/fns/saveHash/${subname}.${name}`)

    const tx = await FNSRegistry.setSubnodeRecord(
      namehash,
      label,
      ownerAddress,
      CONTRACT_ADDRESS.PublicResolver,
      0
    )

    listenTx(tx, { txName: `Set subdomain : ${subname}`, txType: 'setSubnodeRecord', name })
  },

  async findNamesViaAddress(address: string) {
    const ReverseRegistrar = (await useContractReverseRegistrar()) as any
    const PublicResolver = (await useContractPublicResolver()) as any
    const node = await ReverseRegistrar.node(address)
    return PublicResolver.name(node)
  },

  async getAllNamesOf(address: string) {
    const contract = (await useContractIRegistrar()) as any
    const count = await contract.balanceOf(address)
    const tokenIds = await Promise.all(
      Array.from({ length: count }).map((_, index) => contract.tokenOfOwnerByIndex(address, index))
    )
    const _names = await Promise.all(tokenIds.map(tokenId => contract.nameOf(tokenId)))
    const names = await Promise.all(_names.map(name => this.getNameInfo(`${name}.fil`)))

    return names
  },

  async getAllControlledNames(controller: string) {
    const { data } = await axios.get(`${SERVER}/fns/${controller}/names`)
    return await Promise.all(data.data.map(name => this.getNameInfo(name)))
  },

  async getBalanceOf(address: string) {
    const provider = await wallet.getWeb3Provider()
    return provider.getBalance(address)
  },

  async getFilPrice() {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=filecoin&vs_currencies=usd'
    )
    return data.filecoin.usd
  }
}
