import type { SDK } from './types'

interface GetTradeBillListData {
  bill_date: string
  bill_type?: 'ALL' | 'SUCCESS' | 'REFUND'
  tar_type?: 'GZIP'
}

interface GetTradeBillListResponse {
  hash_type: string
  hash_value: string
  download_url: string
}

export function getTradeBillList(
  this: SDK,
  data: GetTradeBillListData
): Promise<GetTradeBillListResponse> {
  return this.request()
    .get<GetTradeBillListResponse>('bill/tradebill', {
      searchParams: data as unknown as Record<string, string>,
    })
    .then((response) => response.body)
}

interface GetFundFlowBillListData {
  bill_date: string
  bill_type?: 'BASIC' | 'OPERATION' | 'FEES'
  tar_type?: 'GZIP'
}

interface GetFundFlowBillListResponse {
  hash_type: string
  hash_value: string
  download_url: string
}

export function getFundFlowBillList(
  this: SDK,
  data: GetFundFlowBillListData
): Promise<GetFundFlowBillListResponse> {
  return this.request()
    .get<GetFundFlowBillListResponse>('bill/fundflowbill', {
      searchParams: data as unknown as Record<string, string>,
    })
    .then((response) => response.body)
}

export interface billAPI {
  getTradeBillList(
    data: GetTradeBillListData
  ): Promise<GetTradeBillListResponse>
  getFundFlowBillList(
    data: GetFundFlowBillListData
  ): Promise<GetFundFlowBillListResponse>
}
