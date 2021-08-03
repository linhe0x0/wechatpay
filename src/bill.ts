import { createWriteStream } from 'fs'
import stream from 'stream'
import { promisify } from 'util'

import type { Readable } from 'stream'

import type { SDK } from './types'

const pipeline = promisify(stream.pipeline)

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

export function downloadBillFile(this: SDK, url: string): Readable
export function downloadBillFile(
  this: SDK,
  url: string,
  filename: string
): Promise<void>
export function downloadBillFile(
  this: SDK,
  url: string,
  filename?: string
): Promise<void> | Readable {
  if (url.startsWith('https://api.mch.weixin.qq.com/v3')) {
    url = url.substring(33)
  }

  if (filename) {
    return pipeline(
      this.request().stream(url, {
        method: 'GET',
        responseType: 'buffer',
      }),
      createWriteStream(filename)
    )
  }

  return this.request().stream(url, {
    method: 'GET',
    responseType: 'buffer',
  })
}

export interface billAPI {
  getTradeBillList(
    data: GetTradeBillListData
  ): Promise<GetTradeBillListResponse>
  getFundFlowBillList(
    data: GetFundFlowBillListData
  ): Promise<GetFundFlowBillListResponse>
  downloadBillFile(url: string, filename?: string): Promise<void> | Readable
}
