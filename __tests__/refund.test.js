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
  appID: process.env.WECHAT_PAYMENT_APP_ID,
})

describe('refund', () => {
  test('should return error with invalid data', async () => {
    try {
      await wechatPayment.refund.refund({})
    } catch (err) {
      expect(err.name).toBe('PARAM_ERROR')
    }
  })
})
