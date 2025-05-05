import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { getCookie, setCookie } from 'cookies-next'
import { v4 as uuidv4 } from 'uuid'

export class UserIdentifier {
  private static COOKIE_NAME = 'visitor_id'
  private static COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1年

  /**
   * 获取或生成访客ID (基于Cookie)
   */
  static async getVisitorId(req: any, res: any): Promise<string> {
    let visitorId = getCookie(this.COOKIE_NAME, { req, res }) as string

    if (!visitorId) {
      visitorId = uuidv4()
      setCookie(this.COOKIE_NAME, visitorId, {
        req,
        res,
        maxAge: this.COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
    }

    return visitorId
  }

  /**
   * 获取浏览器指纹
   * 注意：这个方法需要在客户端执行
   */
  static async getBrowserFingerprint(): Promise<string> {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  }

  /**
   * 获取用户IP地址
   */
  static getClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded ?
      (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
      : req.socket.remoteAddress
    return ip || 'unknown'
  }
}