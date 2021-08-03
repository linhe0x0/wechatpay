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
})

describe('decrypt', () => {
  test('should return plaintext with valid cipher text', async () => {
    const result = wechatPay.sensitive.decrypt({
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
      wechatPay.sensitive.decrypt({
        algorithm: 'AEAD_AES_256_GCM',
        ciphertext: 'invalid cipher text',
        associated_data: 'transaction',
        nonce: 'Tq8RyxKiZk7G',
      })
    }).toThrow()
  })
})
