import _ from 'lodash'

import { sha256WithRSA } from './crypto'
import { getTimestampSeconds } from './date'
import logger from './logger'
import { getNonce } from './nonce'

interface SignAuthorizationTokenPayload {
  method: string
  url: string
  timestamp: string
  nonce: string
  body: string
}

export function signAuthorizationToken(
  privateKey: string | Buffer,
  payload: SignAuthorizationTokenPayload
): string {
  const toBeSignedStr = `${payload.method}\n${payload.url}\n${payload.timestamp}\n${payload.nonce}\n${payload.body}\n`
  const signature = sha256WithRSA(privateKey, toBeSignedStr, 'base64')

  logger.debug(`sign authorization token payload`, {
    toBeSignedStr,
    signature,
  })

  return signature
}

interface SignPaymentPayload {
  appID: string
  timestamp: string
  nonce: string
  body: string
}

export function signPayment(
  privateKey: string | Buffer,
  payload: SignPaymentPayload
): string {
  const toBeSignedStr = `${payload.appID}\n${payload.timestamp}\n${payload.nonce}\n${payload.body}\n`
  const signature = sha256WithRSA(privateKey, toBeSignedStr, 'base64')

  logger.debug(`sign payment payload`, {
    toBeSignedStr,
    signature,
  })

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
  const nonce = getNonce()

  const signature = signAuthorizationToken(privateKey, {
    method,
    url,
    timestamp,
    nonce,
    body: body || '',
  })

  return `${schema} mchid="${mchID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${certificateNo}"`
}
