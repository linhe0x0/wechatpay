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

export interface billAPI {
  getTradeBillList(
    data: GetTradeBillListData
  ): Promise<GetTradeBillListResponse>
}
