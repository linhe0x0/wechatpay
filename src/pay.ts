import _ from 'lodash'

import { getTimestampSeconds } from './helpers/date'
import { getNonce } from './helpers/nonce'
import { decrypt } from './helpers/sensitive'
import { signPayment, verifyResponseSignature } from './helpers/signature'

import type { SDK } from './types'

interface PayGoodsDetail {
  merchant_goods_id: string
  wechatpay_goods_id?: string
  goods_name?: string
  quantity: number
  unit_price: number
}

interface PayDetail {
  cost_price?: number
  invoice_id?: string
  goods_detail?: PayGoodsDetail[]
}

interface StoreInfo {
  id: string
  name?: string
  area_code?: string
  address?: string
}

interface SceneInfo {
  payer_client_ip: string
  device_id?: string
  store_info?: StoreInfo
}

interface SettleInfo {
  profit_sharing?: boolean
}

interface JSAPIOptions {
  appid: string
  description: string
  out_trade_no: string
  time_expire?: string
  attach?: string
  notify_url: string
  goods_tag?: string
  amount: {
    total: number
    currency?: string
  }
  payer: {
    openid: string
  }
  detail?: PayDetail
  scene_info?: SceneInfo
  settle_info?: SettleInfo
}

interface JSAPIResponse {
  prepay_id: string
}

interface JSAPISignedResponse {
  timeStamp: string
  nonceStr: string
  package: string
  signType?: string
  paySign: string
}

export function jsapi(
  this: SDK,
  data: JSAPIOptions
): Promise<JSAPISignedResponse> {
  _.assign(data, {
    mchid: this.mchID,
  })

  return this.request()
    .post<JSAPIResponse>('pay/transactions/jsapi', {
      json: data,
    })
    .then((response) => {
      const prepayID = response.body.prepay_id
      const appID = data.appid
      const timestamp = getTimestampSeconds().toString()
      const nonce = getNonce()
      const pkg = `prepay_id=${prepayID}`
      const signType = 'RSA'
      const signature = signPayment(this.privateKey, {
        appID,
        timestamp,
        nonce,
        body: pkg,
      })

      return {
        timeStamp: timestamp,
        nonceStr: nonce,
        package: pkg,
        signType,
        paySign: signature,
      }
    })
}

interface SignaturePayload {
  timestamp: string
  nonce: string
  body: string
}

export async function verifyResponse(
  this: SDK,
  serial: string,
  data: SignaturePayload,
  signature: string
): Promise<boolean> {
  const certificate = await this.getCertificateInfo(serial)

  return verifyResponseSignature(
    certificate.encrypt_certificate.publicKey,
    data,
    signature
  )
}

interface CipherData {
  algorithm: string
  ciphertext: string
  associated_data?: string
  nonce: string
}

export function decryptResponse(this: SDK, data: CipherData): any {
  const result = decrypt(this.apiSecret, data)

  try {
    return JSON.parse(result)
  } catch (err) {
    throw new Error(`cannot parse plaintext: ${result}`)
  }
}

interface PaymentNotificationResource extends CipherData {
  original_type: string
}

interface PaymentNotificationData {
  resource: PaymentNotificationResource
}

interface PaymentNotificationGoodsDetail {
  goods_id: string
  quantity: number
  unit_price: number
  discount_amount: number
  goods_remark?: string
}

interface PromotionDetail {
  coupon_id: string
  name?: string
  scope?: string
  type?: string
  amount: number
  stock_id?: string
  wechatpay_contribute?: number
  merchant_contribute?: number
  other_contribute?: number
  currency?: string
  goods_detail?: PaymentNotificationGoodsDetail[]
}

interface PaymentNotificationResult {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id: string
  trade_type: string
  trade_state: string
  trade_state_desc: string
  bank_type: string
  attach?: string
  success_time: string
  payer: {
    openid: string
  }
  amount: {
    total: number
    payer_total: number
    currency: string
    payer_currency: string
  }
  scene_info?: {
    device_id?: string
  }
  promotion_detail?: PromotionDetail[]
}

export function decryptPaymentNotification(
  this: SDK,
  data: PaymentNotificationData
): PaymentNotificationResult {
  return decryptResponse.call(this, data.resource)
}

export interface PayAPI {
  jsapi(this: SDK, data: JSAPIOptions): Promise<JSAPISignedResponse>
  verifyResponse(
    this: SDK,
    serial: string,
    data: SignaturePayload,
    signature: string
  ): Promise<boolean>
  decryptResponse(this: SDK, data: CipherData): any
  decryptPaymentNotification(
    this: SDK,
    data: PaymentNotificationData
  ): PaymentNotificationResult
}
