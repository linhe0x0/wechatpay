import { LogLevel } from 'consola'
import got, { Got, NormalizedOptions } from 'got'
import _ from 'lodash'

import {
  CertificateAPI,
  CertificateInfo,
  getCertificateList,
} from './certificates'
import { WECHAT_PAYMENT_API_BASE } from './constants'
import logger from './helpers/logger'
import { getAuthorizationToken } from './helpers/signature'
import { SDK, SDKMetadata, SDKOptions } from './types'

export class WechatPayment implements SDK {
  // https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay3_1.shtml
  mchID: string // 商户 ID
  privateKey: string // 商户 API 私钥
  privateSerialNo: string // 商户 API 证书 serial_no
  apiSecret: string // APIv3 密钥

  options: SDKOptions

  certificateList: CertificateInfo[]

  certificate: CertificateAPI

  constructor(metadata: SDKMetadata, options?: Partial<SDKOptions>) {
    this.mchID = metadata.mchID
    this.privateKey = metadata.privateKey
    this.privateSerialNo = metadata.privateSerialNo
    this.apiSecret = metadata.apiSecret

    logger.debug(
      `Init wechat payment sdk with mchID: ${metadata.mchID}, privateSerialNo: ${metadata.privateSerialNo}, apiSecret: ${metadata.apiSecret}`
    )

    this.options = _.defaults(options, {
      debug: false,
    })

    logger.level = this.options.debug ? LogLevel.Verbose : LogLevel.Warn

    this.certificateList = []

    this.certificate = {
      getCertificateList: getCertificateList.bind(this),
    }
  }

  config(options: Partial<SDKOptions>): WechatPayment {
    this.options = _.assign(this.options, options)

    logger.level = this.options.debug ? LogLevel.Verbose : LogLevel.Warn

    return this
  }

  request(): Got {
    const addAuthorization = (options: NormalizedOptions) => {
      const certificateNo = this.privateSerialNo
      const method = options.method.toUpperCase()
      const url = options.url.pathname
      const body = options.body ? options.body.toString() : ''

      const authorization = getAuthorizationToken(
        this.privateKey,
        certificateNo,
        this.mchID,
        method,
        url,
        body
      )

      options.headers.Authorization = authorization
    }

    const instance = got.extend({
      prefixUrl: WECHAT_PAYMENT_API_BASE,
      responseType: 'json',
      hooks: {
        beforeRequest: [addAuthorization],
      },
    })

    return instance
  }
}
