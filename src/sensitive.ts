import type { SDK } from './types'
import type { CipherData } from './helpers/sensitive'
import { decryptData } from './helpers/sensitive'

export function decrypt<T>(this: SDK, data: CipherData): T {
  return decryptData<T>(this.apiSecret, data)
}

export interface SensitiveAPI {
  decrypt(data: CipherData): any
}
