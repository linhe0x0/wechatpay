import cryptoRandomString from 'crypto-random-string'

export function getNonce() {
  return cryptoRandomString({ length: 32 })
}
