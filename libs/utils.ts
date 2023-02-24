import { ElMessage, ElNotification } from 'element-plus'
import copy from 'copy-to-clipboard'
import { utils } from 'ethers'
import { validateAddressString } from '@glif/filecoin-address'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import store from 'store'
import { KEY_FAVORITE_DOMAINS } from '~~/constants'

export function storeDomainToLocal(domain: string) {
  const storedDomains = getStoredDomainsFromLocal()
  storedDomains.unshift(domain)
  store.set(KEY_FAVORITE_DOMAINS, storedDomains)
}

export function removeDomainFromLocal(domain: string) {
  const storedDomains = getStoredDomainsFromLocal()
  const _storedDomains = storedDomains.filter(d => d !== domain)
  store.set(KEY_FAVORITE_DOMAINS, _storedDomains)
}

export function getStoredDomainsFromLocal() {
  return store.get(KEY_FAVORITE_DOMAINS) || []
}

export function setPendingToLocal(key: string) {
  store.set(key, true)
}

export function removePendingFromLocal(key: string) {
  store.remove(key)
}

export function getPendingFromLocal(key: string) {
  return !!store.get(key)
}

export function TipWarning(message: string) {
  ElMessage({ showClose: true, message, type: 'warning' })
}

export function TipSuccess(message: string) {
  ElMessage({ showClose: true, message, type: 'success' })
}

export function TipError(message: string) {
  ElMessage({ showClose: true, message, type: 'error' })
}

export function NoteSuccess(message: string) {
  ElNotification({
    title: 'Success',
    message,
    type: 'success'
  })
}

export function NoteError(message: string, title?: string) {
  ElNotification({
    title: title ?? 'Error',
    message,
    type: 'error'
  })
}

export function NoteInfo(message: string) {
  ElNotification({
    title: 'Notification',
    message,
    type: 'info'
  })
}

export function NoteWarning(message: string) {
  ElNotification({
    title: 'Warning',
    message,
    type: 'warning'
  })
}

export function NoteHaveNoMetamask() {
  ElNotification({
    title: 'No Metamask',
    type: 'warning',
    dangerouslyUseHTMLString: true,
    duration: 600000,
    message:
      'Please install metamask first<br/><a target="_blank" class="text-blue-500 hover:underline" href="https://chrome.google.com/webstore/search/metamask">https://chrome.google.com/webstore/search/metamask</a>'
  })
}

export function Copy(text: string) {
  copy(text)
  TipSuccess('Copy succeeded !')
}

export function isAddress(str: string) {
  return utils.isAddress(str) || validateAddressString(str)
}

export function isDomain(name: string) {
  return /^([\da-zA-Z]+(\.[\da-zA-Z]+)?)+$/.test(name)
}

export function getParentName(name: string) {
  return name.replace(/^[^.]+\./, '')
}

export function getSecondName(name: string) {
  return name?.match(/[\da-zA-Z]+\.fil$/)?.[0] ?? ''
}

export function getSecondNameChars(name: string) {
  const secondName = getSecondName(name)
  return secondName.replace(/\.fil$/, '')
}

export function getNameLevel(name: string) {
  return name?.split('.').length || 0
}

export const labelhash = (label: string): string => keccak256(toUtf8Bytes(label))
