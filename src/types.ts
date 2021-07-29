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
