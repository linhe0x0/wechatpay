import { decrypt } from './helpers/sensitive'
import { SDK } from './types'

interface RefundAmountFromItem {
  account: 'AVAILABLE' | 'UNAVAILABLE'
  amount: number
}

interface RefundAmount {
  refund: number
  from?: RefundAmountFromItem[]
  total: number
  currency: string
}

interface RefundGoodsDetailItem {
  merchant_goods_id: string
  wechatpay_goods_id?: string
  goods_name?: string
  unit_price: number
  refund_amount: number
  refund_quantity: number
}

interface RefundData {
  transaction_id?: string
  out_trade_no?: string
  out_refund_no: string
  reason?: string
  notify_url?: string
  funds_account?: 'AVAILABLE'
  amount: RefundAmount
  goods_detail?: RefundGoodsDetailItem[]
}

interface PromotionDetailItem {
  promotion_id: string
  scope: 'GLOBAL' | 'SINGLE'
  type: 'COUPON' | 'DISCOUNT'
  amount: number
  refund_amount: number
  goods_detail?: RefundGoodsDetailItem[]
}

interface RefundResponse {
  refund_id: string
  out_refund_no: string
  transaction_id: string
  out_trade_no: string
  channel: string
  user_received_account: string
  success_time?: string
  create_time: string
  status: 'SUCCESS' | 'CLOSED' | 'PROCESSING' | 'ABNORMAL'
  funds_account?: string
  amount: {
    total: number
    refund: number
    from?: RefundAmountFromItem[]
    payer_total: number
    payer_refund: number
    settlement_refund: number
    settlement_total: number
    discount_refund: number
    currency: string
  }
  promotion_detail?: PromotionDetailItem[]
}

export function refund(this: SDK, data: RefundData): Promise<RefundResponse> {
  return this.request()
    .post<RefundResponse>('refund/domestic/refunds', {
      json: data,
    })
    .then((response) => response.body)
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

interface RefundNotificationResource extends CipherData {
  original_type: string
}

interface RefundNotificationData {
  resource: RefundNotificationResource
}

interface RefundNotificationResult {
  mchid: string
  out_trade_no: string
  transaction_id: string
  out_refund_no: string
  refund_id: string
  refund_status: 'SUCCESS' | 'CLOSED' | 'ABNORMAL'
  success_time?: string
  user_received_account: string
  amount: {
    total: number
    refund: number
    payer_total: number
    payer_refund: number
  }
}

export function decryptRefundNotification(
  this: SDK,
  data: RefundNotificationData
): RefundNotificationResult {
  return decryptResponse.call(this, data.resource)
}

export interface RefundAPI {
  refund(data: RefundData): Promise<RefundResponse>
  decryptRefundNotification(
    this: SDK,
    data: RefundNotificationData
  ): RefundNotificationResult
}
