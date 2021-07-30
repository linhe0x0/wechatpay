import cryptoRandomString from 'crypto-random-string'

export function getNonce(): string {
  return cryptoRandomString({ length: 32 })
}
