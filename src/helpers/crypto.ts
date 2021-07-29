import crypto from 'crypto'

type BinaryToTextEncoding = 'hex' | 'base64'

export function sha256WithRSA(
  privateKey: string | Buffer,
  str: string,
  encoding: BinaryToTextEncoding = 'hex'
): string {
  const sign = crypto.createSign('RSA-SHA256')

  sign.write(str)

  sign.end()

  const result = sign.sign(privateKey, encoding)

  return result
}

export function b64(str: string): string {
  return Buffer.from(str).toString('base64')
}

export function d64(str: string): Buffer {
  return Buffer.from(str, 'base64')
}
