import { verifyResponseSignature } from './helpers/signature'

import type { SDK } from './types'

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
  verify(
    serialNo: string,
    data: VerifyResponseData,
    signature: string
  ): Promise<boolean>
}
