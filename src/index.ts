import { LogLevel } from 'consola'
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
  decryptPaymentNotification,
  decryptResponse,
  jsapi,
  PayAPI,
  queryTransaction,
  verifyResponse,
} from './pay'
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
  pay: PayAPI

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
    this.pay = {
      jsapi: jsapi.bind(this),
      verifyResponse: verifyResponse.bind(this),
      decryptResponse: decryptResponse.bind(this),
      decryptPaymentNotification: decryptPaymentNotification.bind(this),
      queryTransaction: queryTransaction.bind(this),
    }
  }

  config(options: Partial<SDKOptions>): WechatPayment {
    this.options = _.assign(this.options, options)

    logger.level = this.options.debug ? LogLevel.Verbose : LogLevel.Warn

    return this
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
