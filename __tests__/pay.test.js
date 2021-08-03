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
  test('should return signed payment params with jsapi', async () => {
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

describe('app', () => {
  test('should return signed payment params with app api', async () => {
    const orderID = cryptoRandomString({ length: 32 })

    const result = await wechatPayment.pay.app({
      appid: process.env.WECHAT_APP_ID,
      description: 'wechatpay api testing',
      out_trade_no: orderID,
      notify_url: process.env.WECHAT_PAYMENT_API_NOTIFY_URL,
      amount: {
        total: 1,
      },
    })

    expect(result.appid).toBeTruthy()
    expect(result.partnerid).toBeTruthy()
    expect(result.prepayid).toBeTruthy()
    expect(result.package).toBe('Sign=WXPay')
    expect(result.noncestr).toBeTruthy()
    expect(result.timestamp).toBeTruthy()
    expect(result.sign).toBeTruthy()
  })
})

describe('h5', () => {
  test('should return signed payment params with h5 api', async () => {
    const orderID = cryptoRandomString({ length: 32 })

    const result = await wechatPayment.pay.h5({
      appid: process.env.WECHAT_APP_ID,
      description: 'wechatpay api testing',
      out_trade_no: orderID,
      notify_url: process.env.WECHAT_PAYMENT_API_NOTIFY_URL,
      amount: {
        total: 1,
      },
      scene_info: {
        payer_client_ip: '222.137.128.116',
      },
    })

    expect(result.h5_url).toBeTruthy()
  })
})

describe('native', () => {
  test('should return signed payment params with native api', async () => {
    const orderID = cryptoRandomString({ length: 32 })

    const result = await wechatPayment.pay.native({
      appid: process.env.WECHAT_APP_ID,
      description: 'wechatpay api testing',
      out_trade_no: orderID,
      notify_url: process.env.WECHAT_PAYMENT_API_NOTIFY_URL,
      amount: {
        total: 1,
      },
    })

    expect(result.code_url).toBeTruthy()
  })
})

describe('decryptPaymentNotification', () => {
  test('should return plaintext with valid cipher text', async () => {
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

describe('queryTransactionInfo', () => {
  test('should return transaction info with valid transaction_id', async () => {
    const result = await wechatPayment.pay.queryTransactionInfo({
      transaction_id: '4200001154202107300042303661',
    })

    expect(result.mchid).toBe(process.env.WECHAT_PAYMENT_MCH_ID)
    expect(result.transaction_id).toBe('4200001154202107300042303661')
  })

  test('should return transaction info with valid out_trade_no', async () => {
    const result = await wechatPayment.pay.queryTransactionInfo({
      out_trade_no: '9ebf194d5bd04a0bb3848676',
    })

    expect(result.mchid).toBe(process.env.WECHAT_PAYMENT_MCH_ID)
    expect(result.out_trade_no).toBe('9ebf194d5bd04a0bb3848676')
  })

  test('should throw error if transaction_id ans out_trade_no are missing', async () => {
    expect(() => {
      wechatPayment.pay.queryTransactionInfo({})
    }).toThrow('the transaction_id or out_trade_no is missing')
  })

  test('should throw error if transaction_id ans out_trade_no are in conflict', async () => {
    expect(() => {
      wechatPayment.pay.queryTransactionInfo({
        transaction_id: 't',
        out_trade_no: 'o',
      })
    }).toThrow('transaction_id and out_trade_no are in conflict')
  })
})

describe('closeTransaction', () => {
  test('should return OK with valid transaction_id', async () => {
    const result = await wechatPayment.pay.closeTransaction(
      '4200001154202107300042303661'
    )

    expect(result).toBe('')
  })

  test('should return 404 with invalid transaction_id', async () => {
    try {
      await wechatPayment.pay.closeTransaction('invalid transaction id')
    } catch (err) {
      expect(err.name).toBe('PARAM_ERROR')
    }
  })
})
