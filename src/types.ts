import type { Got } from 'got'
import type { KeyObject } from 'crypto'

interface Certificate {
  algorithm: string
  nonce: string
  associated_data: string
  ciphertext: string
  plaintext: string
  publicKey: KeyObject
}

export interface CertificateInfo {
  serial_no: string
  effective_time: string
  expire_time: string
  encrypt_certificate: Certificate
}

export interface SDKMetadata {
  mchID: string
  privateKey: string
  privateSerialNo: string
  apiSecret: string
}

export interface SDKOptions {
  debug?: boolean
}

export interface SDK {
  mchID: string
  privateKey: string
  privateSerialNo: string
  apiSecret: string

  options: SDKOptions

  config(options: Partial<SDKOptions>): SDK

  getCertificateInfo(serialNo: string): Promise<CertificateInfo>

  request(): Got
}
