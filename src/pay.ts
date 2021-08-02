import _ from 'lodash'

import { getTimestampSeconds } from './helpers/date'
import { getNonce } from './helpers/nonce'
import { decryptData } from './helpers/sensitive'
import { signPayment } from './helpers/signature'

import type { CipherData } from './helpers/sensitive'
import type { SDK } from './types'

interface Payer {
  openid: string
}

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

interface JSAPIData {
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
  payer: Payer
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
  data: JSAPIData
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

type H5Data = Omit<JSAPIData, 'payer'>

interface H5Response {
  h5_url: string
}

export function h5(this: SDK, data: H5Data): Promise<H5Response> {
  _.assign(data, {
    mchid: this.mchID,
  })

  return this.request()
    .post<H5Response>('pay/transactions/h5', {
      json: data,
    })
    .then((response) => response.body)
}

type AppData = Omit<JSAPIData, 'payer'>

interface AppResponse {
  prepay_id: string
}

interface AppSignedResponse {
  appid: string
  partnerid: string
  prepayid: string
  package: string
  noncestr: string
  timestamp: string
  sign: string
}

export function app(this: SDK, data: AppData): Promise<AppSignedResponse> {
  _.assign(data, {
    mchid: this.mchID,
  })

  return this.request()
    .post<AppResponse>('pay/transactions/app', {
      json: data,
    })
    .then((response) => {
      const prepayID = response.body.prepay_id
      const timestamp = getTimestampSeconds().toString()
      const nonce = getNonce()
      const signature = signPayment(this.privateKey, {
        appID: data.appid,
        timestamp,
        nonce,
        body: prepayID,
      })

      return {
        appid: data.appid,
        partnerid: this.mchID,
        prepayid: prepayID,
        package: 'Sign=WXPay',
        noncestr: nonce,
        timestamp,
        sign: signature,
      }
    })
}

interface PaymentNotificationResource extends CipherData {
  original_type: string
}

interface PaymentNotificationData {
  resource: PaymentNotificationResource
}

interface GoodsDetail {
  goods_id: string
  quantity: number
  unit_price: number
  discount_amount: number
  goods_remark?: string
}

type TradeType = 'JSAPI' | 'NATIVE' | 'APP' | 'MICROPAY' | 'MWEB' | 'FACEPAY'
type TradeState =
  | 'SUCCESS'
  | 'REFUND'
  | 'NOTPAY'
  | 'CLOSED'
  | 'REVOKED'
  | 'USERPAYING'
  | 'PAYERROR'
  | 'ACCEPT'

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
  goods_detail?: GoodsDetail[]
}

interface PaymentNotificationResult {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id: string
  trade_type: TradeType
  trade_state: TradeState
  trade_state_desc: string
  bank_type: string
  attach?: string
  success_time: string
  payer: Payer
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
  return decryptData<PaymentNotificationResult>(this.apiSecret, data.resource)
}

interface QueryTransactionData {
  transaction_id?: string
  out_trade_no?: string
}

interface QueryTransactionResponse {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id?: string
  trade_type?: TradeType
  trade_state: TradeState
  trade_state_desc: string
  bank_type?: string
  attach?: string
  success_time?: string
  payer: Payer
  amount?: {
    total?: number
    payer_total?: number
    currency?: string
    payer_currency?: string
  }
  scene_info?: {
    device_id?: string
  }
  promotion_detail?: PromotionDetail[]
}

export function queryTransactionInfo(
  this: SDK,
  filter: QueryTransactionData
): Promise<QueryTransactionResponse> {
  if (!filter.transaction_id && !filter.out_trade_no) {
    throw new Error('the transaction_id or out_trade_no is missing')
  }

  if (filter.transaction_id && filter.out_trade_no) {
    throw new Error('transaction_id and out_trade_no are in conflict')
  }

  const url = filter.transaction_id
    ? `pay/transactions/id/${filter.transaction_id}`
    : `pay/transactions/out-trade-no/${filter.out_trade_no}`

  return this.request()
    .get<QueryTransactionResponse>(url, {
      searchParams: {
        mchid: this.mchID,
      },
    })
    .then((response) => response.body)
}

export function closeTransaction(this: SDK, outTradeNo: string): Promise<void> {
  return this.request()
    .post<void>(`pay/transactions/out-trade-no/${outTradeNo}/close`, {
      json: {
        mchid: this.mchID,
      },
    })
    .then((response) => response.body)
}

export interface PayAPI {
  jsapi(data: JSAPIData): Promise<JSAPISignedResponse>
  app(data: AppData): Promise<AppSignedResponse>
  h5(data: H5Data): Promise<H5Response>
  decryptPaymentNotification(
    data: PaymentNotificationData
  ): PaymentNotificationResult
  queryTransactionInfo(
    filter: QueryTransactionData
  ): Promise<QueryTransactionResponse>
  closeTransaction(outTradeNo: string): Promise<void>
}
