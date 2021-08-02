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

describe('getTradeBillList', () => {
  test('should return 400 with special day', async () => {
    try {
      await wechatPayment.bill.getTradeBillList({
        bill_date: '2021-08-01',
      })
    } catch (err) {
      expect(err.name).toBe('NO_STATEMENT_EXIST')
    }
  })
})

describe('getFundFlowBillList', () => {
  test('should return 400 with special day', async () => {
    try {
      await wechatPayment.bill.getFundFlowBillList({
        bill_date: '2021-08-01',
      })
    } catch (err) {
      expect(err.name).toBe('NO_STATEMENT_EXIST')
    }
  })
})
