const fs = require('fs')
const dotenv = require('dotenv')

const { WechatPay } = require('../dist/index')

dotenv.config()

const privateKey = fs.readFileSync(
  process.env.WECHAT_PAYMENT_PRIVATE_KEY,
  'utf8'
)

const wechatPay = new WechatPay({
  mchID: process.env.WECHAT_PAYMENT_MCH_ID,
  privateKey,
  privateSerialNo: process.env.WECHAT_PAYMENT_PRIVATE_SERIAL_NO,
  apiSecret: process.env.WECHAT_PAYMENT_API_SECRET,
  appID: process.env.WECHAT_PAYMENT_APP_ID,
})

describe('certificate', () => {
  test('should return certificate list', async () => {
    const results = await wechatPay.certificate.getCertificateList()

    expect(results.length).toBeGreaterThan(0)
  })
})
