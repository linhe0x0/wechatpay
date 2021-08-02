import {
  getAuthorizationToken,
  verifyResponseSignature,
} from './helpers/signature'

import type { SDK } from './types'

export function sign(
  this: SDK,
  method: string,
  url: string,
  body?: string
): string {
  return getAuthorizationToken(
    this.privateKey,
    this.privateSerialNo,
    this.mchID,
    method,
    url,
    body
  )
}

interface VerifyResponseData {
  timestamp: string
  nonce: string
  body: string
}

export async function verify(
  this: SDK,
  serialNo: string,
  data: VerifyResponseData,
  signature: string
): Promise<boolean> {
  const certificate = await this.getCertificateInfo(serialNo)

  return verifyResponseSignature(
    certificate.encrypt_certificate.publicKey,
    data,
    signature
  )
}

export interface SignatureAPI {
  sign(method: string, url: string, body?: string): string
  verify(
    serialNo: string,
    data: VerifyResponseData,
    signature: string
  ): Promise<boolean>
}
