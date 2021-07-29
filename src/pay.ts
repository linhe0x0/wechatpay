import _ from 'lodash'

import { getTimestampSeconds } from './helpers/date'
import { getNonce } from './helpers/nonce'
import { signPayment } from './helpers/signature'
import { SDK } from './types'

interface Amount {
  total: number
  currency?: string
}

interface Payer {
  openid: string
}

interface GoodsDetail {
  merchant_goods_id: string
  wechatpay_goods_id?: string
  goods_name?: string
  quantity: number
  unit_price: number
}

interface Detail {
  cost_price?: number
  invoice_id?: string
  goods_detail?: GoodsDetail[]
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
  amount: Amount
  payer: Payer
  detail?: Detail
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

export interface PayAPI {
  jsapi(this: SDK, data: JSAPIOptions): Promise<JSAPISignedResponse>
}
