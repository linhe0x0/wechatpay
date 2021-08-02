import crypto from 'crypto'

type Algorithm = 'AEAD_AES_256_GCM'

type CipherCCMTypes =
  | 'aes-128-ccm'
  | 'aes-192-ccm'
  | 'aes-256-ccm'
  | 'chacha20-poly1305'
type CipherGCMTypes = 'aes-128-gcm' | 'aes-192-gcm' | 'aes-256-gcm'

const algorithmMap: Record<Algorithm, CipherCCMTypes | CipherGCMTypes> = {
  AEAD_AES_256_GCM: 'aes-256-gcm',
}

export interface CipherData {
  algorithm: string
  ciphertext: string
  associated_data?: string
  nonce: string
}

export function decrypt(apiSecret: string, data: CipherData): string {
  const algorithm = algorithmMap[data.algorithm]

  if (!algorithm) {
    throw new Error('Unsupported algorithm')
  }

  const buf = Buffer.from(data.ciphertext, 'base64')
  const text = buf.slice(0, buf.length - 16)
  const authTag = buf.slice(buf.length - 16)

  const decipher = crypto.createDecipheriv(algorithm, apiSecret, data.nonce, {
    authTagLength: 16,
  })

  decipher.setAuthTag(authTag)

  if (data.associated_data) {
    decipher.setAAD(Buffer.from(data.associated_data, 'utf8'), {
      plaintextLength: text.length,
    })
  }

  const plaintext = Buffer.concat([
    decipher.update(text),
    decipher.final(),
  ]).toString('utf8')

  return plaintext
}

export function decryptData<T>(apiSecret: string, data: CipherData): T {
  const result = decrypt(apiSecret, data)

  return JSON.parse(result)
}
