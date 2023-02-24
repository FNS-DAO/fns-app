import { ethers } from 'ethers'
import { wallet } from '~/libs/wallet'
import { CONTRACT_ADDRESS } from '~~/constants'
import FNSRegistryAbi from '~~/constants/abi/FNSRegistry.json'
import IRegistrarAbi from '~~/constants/abi/Registrar.json'
import IRegistrarControllerAbi from '~~/constants/abi/RegistrarController.json'
import PublicResolverAbi from '~~/constants/abi/PublicResolver.json'
import ReverseRegistrarAbi from '~~/constants/abi/ReverseRegistrar.json'

// single mode
let ContractFNSRegistry = null as any
let ContractIRegistrar = null as any
let ContractIRegistrarController = null as any
let ContractPublicResolver = null as any
let ContractReverseRegistrar = null as any

function isWeb3Provider(provider: any) {
  const { url } = provider.connection
  return url === 'metamask'
}

function getProviderOrSigner() {
  const _provider = wallet.getProvider()
  return isWeb3Provider(_provider) ? _provider.getSigner() : _provider
}

export function useContractFNSRegistry() {
  if (!ContractFNSRegistry || ContractFNSRegistry.provider !== wallet.provider) {
    ContractFNSRegistry = new ethers.Contract(
      CONTRACT_ADDRESS.FNSRegistry,
      FNSRegistryAbi,
      getProviderOrSigner()
    ) as any
  }
  return ContractFNSRegistry
}

export function useContractIRegistrar() {
  if (!ContractIRegistrar || ContractIRegistrar.provider !== wallet.provider) {
    ContractIRegistrar = new ethers.Contract(
      CONTRACT_ADDRESS.Registrar,
      IRegistrarAbi,
      getProviderOrSigner()
    ) as any
  }
  return ContractIRegistrar
}

export function useContractIRegistrarController() {
  if (!ContractIRegistrarController || ContractIRegistrarController.provider !== wallet.provider) {
    ContractIRegistrarController = new ethers.Contract(
      CONTRACT_ADDRESS.RegistrarController,
      IRegistrarControllerAbi,
      getProviderOrSigner()
    ) as any
  }

  return ContractIRegistrarController
}

export function useContractPublicResolver() {
  if (!ContractPublicResolver || ContractPublicResolver.provider !== wallet.provider) {
    ContractPublicResolver = new ethers.Contract(
      CONTRACT_ADDRESS.PublicResolver,
      PublicResolverAbi,
      getProviderOrSigner()
    ) as any
  }
  return ContractPublicResolver
}

export function useContractReverseRegistrar() {
  if (!ContractReverseRegistrar || ContractReverseRegistrar.provider !== wallet.provider) {
    ContractReverseRegistrar = new ethers.Contract(
      CONTRACT_ADDRESS.ReverseRegistrar,
      ReverseRegistrarAbi,
      getProviderOrSigner()
    ) as any
  }
  return ContractReverseRegistrar
}
