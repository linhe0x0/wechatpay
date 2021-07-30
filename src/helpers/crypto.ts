import crypto from 'crypto'

import type { KeyLike, KeyObject } from 'crypto'

export function b64(str: string): string {
  return Buffer.from(str).toString('base64')
}

export function d64(str: string): Buffer {
  return Buffer.from(str, 'base64')
}

type BinaryToTextEncoding = 'hex' | 'base64'

export function signWithSha256WithRSA(
  privateKey: KeyLike,
  str: string,
  encoding: BinaryToTextEncoding = 'hex'
): string {
  const sign = crypto.createSign('RSA-SHA256')

  sign.write(str)

  sign.end()

  const result = sign.sign(privateKey, encoding)

  return result
}

export function verifyWithSha256WithRSA(
  publicKey: KeyLike,
  str: string,
  signature: string,
  encoding: BinaryToTextEncoding = 'hex'
): boolean {
  const sign = crypto.createVerify('RSA-SHA256')

  sign.write(str)

  sign.end()

  const result = sign.verify(publicKey, signature, encoding)

  return result
}

export function pemToPublicKey(pem: string): KeyObject {
  return crypto.createPublicKey({
    key: pem,
    format: 'pem',
  })
}
