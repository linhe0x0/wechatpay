import { BasicReporter, JSONReporter, LogLevel } from 'consola'
import got from 'got'
import _ from 'lodash'

import {
  CertificateAPI,
  getCertificateList,
  getValidCertificateInfo,
} from './certificates'
import logger from './helpers/logger'
import { outputRequest, outputResponse, parseError } from './helpers/request'
import { getAuthorizationToken } from './helpers/signature'
import {
  closeTransaction,
  decryptPaymentNotification,
  decryptResponse,
  jsapi,
  PayAPI,
  queryTransaction,
} from './pay'
import { decryptRefundNotification, refund, RefundAPI } from './refund'
import { SignatureAPI, verify } from './signature'
import { CertificateInfo, SDK, SDKMetadata, SDKOptions } from './types'

import type { Got, NormalizedOptions } from 'got'
export class WechatPayment implements SDK {
  // https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay3_1.shtml
  mchID: string // 商户 ID
  privateKey: string // 商户 API 私钥
  privateSerialNo: string // 商户 API 证书 serial_no
  apiSecret: string // APIv3 密钥

  options: SDKOptions

  certificateList: CertificateInfo[]

  certificate: CertificateAPI
  signature: SignatureAPI
  pay: PayAPI
  refund: RefundAPI

  constructor(metadata: SDKMetadata, options?: Partial<SDKOptions>) {
    this.mchID = metadata.mchID
    this.privateKey = metadata.privateKey
    this.privateSerialNo = metadata.privateSerialNo
    this.apiSecret = metadata.apiSecret
    this.certificateList = []

    this.options = _.defaults(options, {
      debug: false,
    })

    this.configLog()

    logger.debug(
      `Init wechat payment sdk with mchID: ${metadata.mchID}, privateSerialNo: ${metadata.privateSerialNo}, apiSecret: ${metadata.apiSecret}`
    )

    this.certificate = {
      getCertificateList: getCertificateList.bind(this),
    }
    this.signature = {
      verify: verify.bind(this),
    }
    this.pay = {
      jsapi: jsapi.bind(this),
      decryptResponse: decryptResponse.bind(this),
      decryptPaymentNotification: decryptPaymentNotification.bind(this),
      queryTransaction: queryTransaction.bind(this),
      closeTransaction: closeTransaction.bind(this),
    }
    this.refund = {
      refund: refund.bind(this),
      decryptRefundNotification: decryptRefundNotification.bind(this),
    }
  }

  config(options: Partial<SDKOptions>): WechatPayment {
    this.options = _.assign(this.options, options)

    this.configLog()

    return this
  }

  configLog(): void {
    const test =
      process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'test'

    if (test) {
      logger.level = LogLevel.Silent

      return
    }

    logger.level = this.options.debug ? LogLevel.Verbose : LogLevel.Warn

    const reporter = this.options.debug
      ? new BasicReporter()
      : new JSONReporter()

    logger.setReporters([reporter])
  }

  getCertificateInfo(serialNo: string): Promise<CertificateInfo> {
    const certificate = getValidCertificateInfo(this.certificateList, serialNo)

    if (certificate) {
      return Promise.resolve(certificate)
    }

    return this.certificate.getCertificateList().then((results) => {
      this.certificateList = results

      const result = getValidCertificateInfo(results, serialNo)

      if (!result) {
        throw new Error('No matching certificate was found')
      }

      return result
    })
  }

  request(): Got {
    const addAuthorization = (options: NormalizedOptions) => {
      const serialNo = this.privateSerialNo
      const method = options.method.toUpperCase()
      const url = `${options.url.pathname}${options.url.search}`
      const body = options.json ? JSON.stringify(options.json) : ''

      const authorization = getAuthorizationToken(
        this.privateKey,
        serialNo,
        this.mchID,
        method,
        url,
        body
      )

      options.headers.Authorization = authorization
    }

    const instance = got.extend({
      prefixUrl: 'https://api.mch.weixin.qq.com/v3',
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      hooks: {
        beforeRequest: [addAuthorization, outputRequest],
        afterResponse: [outputResponse],
        beforeError: [parseError],
      },
    })

    return instance
  }
}
