import { CertificateInfo, SDK } from './types'

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
    .then((result) => result.body.data)
}

export interface CertificateAPI {
  getCertificateList: () => Promise<CertificateInfo[]>
}
