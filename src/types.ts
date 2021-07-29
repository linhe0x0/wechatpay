import { Got } from 'got'

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

  request(): Got
}

interface Certificate {
  algorithm: string
  nonce: string
  associated_data: string
  ciphertext: string
}

export interface CertificateInfo {
  serial_no: string
  effective_time: string
  expire_time: string
  encrypt_certificate: Certificate
}
