import { WECHAT_PAYMENT_API_GET_CERTIFICATE } from './constants'
import { ResponseData } from './helpers/response'
import { SDK } from './types'

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

/**
 * 获取平台证书列表
 *
 * @see {@link https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay5_1.shtml}
 */
export async function getCertificateList(
  this: SDK
): Promise<CertificateInfo[]> {
  return this.request()
    .get<ResponseData<CertificateInfo[]>>(WECHAT_PAYMENT_API_GET_CERTIFICATE)
    .then((result) => result.body.data)
}

export interface CertificateAPI {
  getCertificateList: () => Promise<CertificateInfo[]>
}
