import cryptoRandomString from 'crypto-random-string'
import _ from 'lodash'

import { sha256WithRSA } from './crypto'
import { getTimestampSeconds } from './date'
import logger from './logger'

interface signPayload {
  method: string
  url: string
  timestamp: string
  nonce: string
  body: string
}

export function sign(
  privateKey: string | Buffer,
  payload: signPayload
): string {
  const toBeSignedStr = `${payload.method}\n${payload.url}\n${payload.timestamp}\n${payload.nonce}\n${payload.body}\n`
  const signature = sha256WithRSA(privateKey, toBeSignedStr, 'base64')

  logger.debug(`sign string: <${toBeSignedStr}>, result: ${signature}`)

  return signature
}

export function getAuthorizationToken(
  privateKey: string | Buffer,
  certificateNo: string,
  mchID: string,
  method: string,
  url: string,
  body?: string
): string {
  const schema = 'WECHATPAY2-SHA256-RSA2048'

  const timestamp = getTimestampSeconds().toString()
  const nonce = cryptoRandomString({ length: 32 })

  const signature = sign(privateKey, {
    method,
    url,
    timestamp,
    nonce,
    body: body || '',
  })

  return `${schema} mchid="${mchID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${certificateNo}"`
}
