import _ from 'lodash'

import { pemToPublicKey } from './helpers/crypto'
import { isOutdated } from './helpers/date'
import { decrypt } from './helpers/sensitive'

import type { CertificateInfo, SDK } from './types'

interface GetCertificateListResponse {
  data: CertificateInfo[]
}

/**
 * 获取平台证书列表
 *
 * @see {@link https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay5_1.shtml}
 */
export function getCertificateList(this: SDK): Promise<CertificateInfo[]> {
  return this.request()
    .get<GetCertificateListResponse>('certificates')
    .then((result) => {
      const certificates = result.body.data

      _.forEach(certificates, (item) => {
        const { algorithm, ciphertext, nonce, associated_data } =
          item.encrypt_certificate

        const plaintext = decrypt(this.apiSecret, {
          algorithm,
          ciphertext,
          nonce,
          associated_data,
        })
        const publicKey = pemToPublicKey(plaintext)

        item.encrypt_certificate.plaintext = plaintext
        item.encrypt_certificate.publicKey = publicKey
      })

      return certificates
    })
}

export function getValidCertificateInfo(
  certificates: CertificateInfo[],
  serialNo: string
): CertificateInfo | undefined {
  const certificate = _.find<CertificateInfo>(
    certificates,
    (item) => item.serial_no === serialNo
  )

  if (certificate) {
    const outdated = isOutdated(certificate.expire_time)

    if (!outdated) {
      return certificate
    }
  }

  return undefined
}

export interface CertificateAPI {
  getCertificateList: () => Promise<CertificateInfo[]>
}
