const fs = require('fs')
const dotenv = require('dotenv')
const cryptoRandomString = require('crypto-random-string')
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

describe('refund', () => {
  test('should return error with invalid data', async () => {
    try {
      await wechatPay.refund.refund({})
    } catch (err) {
      expect(err.name).toBe('PARAM_ERROR')
    }
  })
})

describe('decryptRefundNotification', () => {
  test('should return error with invalid data', () => {
    const result = wechatPay.refund.decryptRefundNotification({
      resource: {
        original_type: 'refund',
        algorithm: 'AEAD_AES_256_GCM',
        ciphertext:
          'RCRRyMpdJ4Rbvp0ijTxXwqCVgrOwKDeOT/UcVTaoT1YDpFbuTVvKIV5TAnTBIi0buW//98UQ2o3ngHQnsxyGpaBo+OZRHy25ePvE3OdU860b3AfHlmvNbrtW5uiAz4dwRGWYSPf13FUkLo1DHmJK57CxY6JnfZ+6deq/Q5z6Hz07/833vC2kCwi1U1yll30EIqs5PPgQpDS0HTNLtKPqV3xroKbsE/Xm/BM3Ug2CGdJdyclezPqvkKu52SxnQY6wQd6dz6yyEnS9qHCj1qRCY2lmptiRkJFyczkFWPF0f2Kje286s91L4nwdBw1y2M5wh1f298PvNkl3OyeLD3cDo9MUBesTWXbk1IBaSNh64URJuAyAw0lGaJAtijn65FPaVa2398J2qAqHg0e/4dSBQqNpAe4XJ17wiYaZ9I6CyFb+hTM07nnCkv+MDlSlIfUVU1bboI1blLbCLIr5+UCO87S/HkQkXaEyw9rXu5btdztTIaJD86SxrDCIS5P0lvGPuknR3VWjB47JgnDfZxppBDav',
        associated_data: 'refund',
        nonce: 'wP3nbiUjaebA',
      },
    })

    expect(result.mchid).toBe(process.env.WECHAT_PAYMENT_MCH_ID)
  })
})

describe('queryRefundInfo', () => {
  test('should return refund info with valid data', async () => {
    const result = await wechatPay.refund.queryRefundInfo(
      'f5eb2ffcfa779934e16fcf671a7c82f2'
    )

    expect(result.out_refund_no).toBe('f5eb2ffcfa779934e16fcf671a7c82f2')
  })
})
