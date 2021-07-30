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
