// lib/memoryQuota.ts
interface QuotaRecord {
  count: number;
  resetDate: Date;
}

export class MemoryQuotaService {
  private static quotaMap = new Map<string, QuotaRecord>();
  private static DAILY_LIMIT = process.env.QUOTA_LIMITATION;
  private static CLEANUP_INTERVAL = 1000 * 60 * 60; // 每小时清理一次过期数据

  constructor() {
    // 启动定时清理
    setInterval(() => {
      this.cleanup();
    }, MemoryQuotaService.CLEANUP_INTERVAL);
  }

  private cleanup() {
    const now = new Date();
    for (const [key, record] of MemoryQuotaService.quotaMap.entries()) {
      if (now >= record.resetDate) {
        MemoryQuotaService.quotaMap.delete(key);
      }
    }
  }

  private getIdentifier(req: any): string {
    // 从请求中获取 IP
    const fingerprint = req.headers.get('x-fingerprint');;
    return fingerprint;
  }

  async checkAndUpdateQuota(req: any): Promise<boolean> {
    const identifier = this.getIdentifier(req);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    let record = MemoryQuotaService.quotaMap.get(identifier);

    // 如果记录不存在或已过期，创建新记录
    if (!record || now >= record.resetDate) {
      record = {
        count: 0,
        resetDate: tomorrow
      };
    }
    console.log('check user:'+identifier+',record count:'+JSON.stringify(record));
    // 检查是否超出限制
    if (record.count >= MemoryQuotaService.DAILY_LIMIT) {
      return false;
    }
    // 更新计数
    record.count += 1;
    MemoryQuotaService.quotaMap.set(identifier, record);
    return true;
  }

  async getRemainingQuota(req: any): Promise<{
    remaining: number;
    total: number;
    nextReset: Date;
  }> {
    const identifier = this.getIdentifier(req);
    const record = MemoryQuotaService.quotaMap.get(identifier);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    if (!record || now >= record.resetDate) {
      return {
        remaining: MemoryQuotaService.DAILY_LIMIT,
        total: MemoryQuotaService.DAILY_LIMIT,
        nextReset: tomorrow
      };
    }

    return {
      remaining: Math.max(0, MemoryQuotaService.DAILY_LIMIT - record.count),
      total: MemoryQuotaService.DAILY_LIMIT,
      nextReset: record.resetDate
    };
  }
}

// 创建单例实例
export const memoryQuota = new MemoryQuotaService();

