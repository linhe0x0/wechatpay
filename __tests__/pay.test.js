const fs = require('fs')
const dotenv = require('dotenv')
const cryptoRandomString = require('crypto-random-string')

const { WechatPayment } = require('../dist/index')

dotenv.config()

const privateKey = fs.readFileSync(
  process.env.WECHAT_PAYMENT_PRIVATE_KEY,
  'utf8'
)

const wechatPayment = new WechatPayment({
  mchID: process.env.WECHAT_PAYMENT_MCH_ID,
  privateKey,
  privateSerialNo: process.env.WECHAT_PAYMENT_PRIVATE_SERIAL_NO,
  apiSecret: process.env.WECHAT_PAYMENT_API_SECRET,
})

describe('jsapi', () => {
  test('should return signed payment params', async () => {
    const orderID = cryptoRandomString({ length: 32 })

    const result = await wechatPayment.pay.jsapi({
      appid: process.env.WECHAT_APP_ID,
      description: 'wechatpay api testing',
      out_trade_no: orderID,
      notify_url: process.env.WECHAT_PAYMENT_API_NOTIFY_URL,
      amount: {
        total: 1,
      },
      payer: {
        openid: process.env.WECHAT_OPEN_ID,
      },
    })

    expect(result.timeStamp).toBeTruthy()
    expect(result.nonceStr).toBeTruthy()
    expect(result.package).toBeTruthy()
    expect(result.paySign).toBeTruthy()
    expect(result.signType).toBe('RSA')
  })
})

describe('verifyResponse', () => {
  test('should return true with valid signature', async () => {
    const result = await wechatPayment.pay.verifyResponse(
      process.env.TEST_WECHAT_PAYMENT_PUBLIC_SERIAL_NO,
      {
        nonce: 'WzE8A8OCO6Z2V5FnpjDEJLdIvfX4Ma78',
        timestamp: '1627626850',
        body: '{"id":"db43880a-8f93-5e2d-bd4c-bd412d82c9dc","create_time":"2021-07-30T14:34:10+08:00","resource_type":"encrypt-resource","event_type":"TRANSACTION.SUCCESS","summary":"支付成功","resource":{"original_type":"transaction","algorithm":"AEAD_AES_256_GCM","ciphertext":"K0slAgDwU+fm6/6klNH486Cj0QZWXku7xkQqI7xf4V9ytTOAlEgBET0zC7c0fyRGeO6dKdsE8ivzSfK7BcbfN05ZY/tbpShfHHLSmmn/PTUYErONxCVnYPTnjOXpklvPCaxJ6SmiaKl7wrKxaTH98x/a1JwB645vcEtab3sKtnzyUTaPhi7ygL0AcQDkcT6LwlEL2dTWXk8DBjh2pqpftbgA3ewna8ph177NIuXKPUAJMxek1gacqDFHTzkiUahREOFgLBOheFTmoxE+ZGy19w2RS9LI/S3Y7MzaMf3mCV4BUbktLhQGGWwLqqYDt0m2kXL/E2F7uoTDFCnZAJMbjjrlELdfRj3jwhfc0DbjSp1kdFKg/oXFJAp9j4rs+spjgS/DGA3gfx20YwrXrcTEDZxcS26tBLJVgzB3SuVAPQ28KdIMhtbSaFdiOjM8KEbpx+RW7bTtvD/uzN8U+2TPhsWY+TDunUx0FdFaTldeUAScp60/vuRdoCLIAvJ5s2MQLq6MckPS/gDems0dIfIvqbzSU284xtripoot3QxedVznG7anNseyFrCLm94/mPnd7tKG6qExWA==","associated_data":"transaction","nonce":"Tq8RyxKiZk7G"}}',
      },
      process.env.TEST_WECHAT_PAYMENT_RESPONSE_SIGNATURE
    )

    expect(result).toBe(true)
  })

  test('should return false with invalid signature', async () => {
    const result = await wechatPayment.pay.verifyResponse(
      process.env.TEST_WECHAT_PAYMENT_PUBLIC_SERIAL_NO,
      {
        nonce: 'WzE8A8OCO6Z2V5FnpjDEJLdIvfX4Ma78',
        timestamp: '1627626850',
        body: '{"id":"db43880a-8f93-5e2d-bd4c-bd412d82c9dc","create_time":"2021-07-30T14:34:10+08:00","resource_type":"encrypt-resource","event_type":"TRANSACTION.SUCCESS","summary":"支付成功","resource":{"original_type":"transaction","algorithm":"AEAD_AES_256_GCM","ciphertext":"K0slAgDwU+fm6/6klNH486Cj0QZWXku7xkQqI7xf4V9ytTOAlEgBET0zC7c0fyRGeO6dKdsE8ivzSfK7BcbfN05ZY/tbpShfHHLSmmn/PTUYErONxCVnYPTnjOXpklvPCaxJ6SmiaKl7wrKxaTH98x/a1JwB645vcEtab3sKtnzyUTaPhi7ygL0AcQDkcT6LwlEL2dTWXk8DBjh2pqpftbgA3ewna8ph177NIuXKPUAJMxek1gacqDFHTzkiUahREOFgLBOheFTmoxE+ZGy19w2RS9LI/S3Y7MzaMf3mCV4BUbktLhQGGWwLqqYDt0m2kXL/E2F7uoTDFCnZAJMbjjrlELdfRj3jwhfc0DbjSp1kdFKg/oXFJAp9j4rs+spjgS/DGA3gfx20YwrXrcTEDZxcS26tBLJVgzB3SuVAPQ28KdIMhtbSaFdiOjM8KEbpx+RW7bTtvD/uzN8U+2TPhsWY+TDunUx0FdFaTldeUAScp60/vuRdoCLIAvJ5s2MQLq6MckPS/gDems0dIfIvqbzSU284xtripoot3QxedVznG7anNseyFrCLm94/mPnd7tKG6qExWA==","associated_data":"transaction","nonce":"Tq8RyxKiZk7G"}}',
      },
      'invalid signature'
    )

    expect(result).toBe(false)
  })
})

describe('decryptResponse', () => {
  test('should return true with valid cipher text', async () => {
    const result = wechatPayment.pay.decryptResponse({
      algorithm: 'AEAD_AES_256_GCM',
      ciphertext:
        'K0slAgDwU+fm6/6klNH486Cj0QZWXku7xkQqI7xf4V9ytTOAlEgBET0zC7c0fyRGeO6dKdsE8ivzSfK7BcbfN05ZY/tbpShfHHLSmmn/PTUYErONxCVnYPTnjOXpklvPCaxJ6SmiaKl7wrKxaTH98x/a1JwB645vcEtab3sKtnzyUTaPhi7ygL0AcQDkcT6LwlEL2dTWXk8DBjh2pqpftbgA3ewna8ph177NIuXKPUAJMxek1gacqDFHTzkiUahREOFgLBOheFTmoxE+ZGy19w2RS9LI/S3Y7MzaMf3mCV4BUbktLhQGGWwLqqYDt0m2kXL/E2F7uoTDFCnZAJMbjjrlELdfRj3jwhfc0DbjSp1kdFKg/oXFJAp9j4rs+spjgS/DGA3gfx20YwrXrcTEDZxcS26tBLJVgzB3SuVAPQ28KdIMhtbSaFdiOjM8KEbpx+RW7bTtvD/uzN8U+2TPhsWY+TDunUx0FdFaTldeUAScp60/vuRdoCLIAvJ5s2MQLq6MckPS/gDems0dIfIvqbzSU284xtripoot3QxedVznG7anNseyFrCLm94/mPnd7tKG6qExWA==',
      associated_data: 'transaction',
      nonce: 'Tq8RyxKiZk7G',
    })

    expect(result.mchid).toBe(process.env.WECHAT_PAYMENT_MCH_ID)
  })

  test('should throw an error with invalid cipher text', async () => {
    expect(() => {
      wechatPayment.pay.decryptResponse({
        algorithm: 'AEAD_AES_256_GCM',
        ciphertext: 'invalid cipher text',
        associated_data: 'transaction',
        nonce: 'Tq8RyxKiZk7G',
      })
    }).toThrow()
  })
})

describe('decryptPaymentNotification', () => {
  test('should return true with valid cipher text', async () => {
    const result = wechatPayment.pay.decryptPaymentNotification({
      resource: {
        algorithm: 'AEAD_AES_256_GCM',
        ciphertext:
          'K0slAgDwU+fm6/6klNH486Cj0QZWXku7xkQqI7xf4V9ytTOAlEgBET0zC7c0fyRGeO6dKdsE8ivzSfK7BcbfN05ZY/tbpShfHHLSmmn/PTUYErONxCVnYPTnjOXpklvPCaxJ6SmiaKl7wrKxaTH98x/a1JwB645vcEtab3sKtnzyUTaPhi7ygL0AcQDkcT6LwlEL2dTWXk8DBjh2pqpftbgA3ewna8ph177NIuXKPUAJMxek1gacqDFHTzkiUahREOFgLBOheFTmoxE+ZGy19w2RS9LI/S3Y7MzaMf3mCV4BUbktLhQGGWwLqqYDt0m2kXL/E2F7uoTDFCnZAJMbjjrlELdfRj3jwhfc0DbjSp1kdFKg/oXFJAp9j4rs+spjgS/DGA3gfx20YwrXrcTEDZxcS26tBLJVgzB3SuVAPQ28KdIMhtbSaFdiOjM8KEbpx+RW7bTtvD/uzN8U+2TPhsWY+TDunUx0FdFaTldeUAScp60/vuRdoCLIAvJ5s2MQLq6MckPS/gDems0dIfIvqbzSU284xtripoot3QxedVznG7anNseyFrCLm94/mPnd7tKG6qExWA==',
        associated_data: 'transaction',
        nonce: 'Tq8RyxKiZk7G',
      },
    })

    expect(result.mchid).toBe(process.env.WECHAT_PAYMENT_MCH_ID)
  })

  test('should throw an error with invalid cipher text', async () => {
    expect(() => {
      wechatPayment.pay.decryptPaymentNotification({
        resource: {
          algorithm: 'AEAD_AES_256_GCM',
          ciphertext: 'invalid cipher text',
          associated_data: 'transaction',
          nonce: 'Tq8RyxKiZk7G',
        },
      })
    }).toThrow()
  })
})
