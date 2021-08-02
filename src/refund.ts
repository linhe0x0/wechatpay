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

type RefundStatus = 'SUCCESS' | 'CLOSED' | 'PROCESSING' | 'ABNORMAL'

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
  status: RefundStatus
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

export interface RefundAPI {
  refund(data: RefundData): Promise<RefundResponse>
}
