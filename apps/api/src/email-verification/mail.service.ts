import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InternalServerError } from "@repo/api-client"

export type Mail = { to: string; subject: string; text: string }

const DEFAULT_FROM = "아망 <no-reply@amang.json-server.win>"

/** 메일 발송은 여기 한 곳에서만 (ADR-0004 Resend) */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly configService: ConfigService) {}

  async send(mail: Mail): Promise<void> {
    const apiKey = this.configService.get<string>("RESEND_API_KEY")
    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY 없음 — 보내지 않고 기록만: ${mail.to} / ${mail.subject}`
      )
      return
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: this.configService.get<string>("MAIL_FROM") ?? DEFAULT_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text
      })
    })

    if (!response.ok) {
      this.logger.error(
        `메일 발송 실패 ${response.status}: ${await response.text()}`
      )
      throw new InternalServerError(
        "메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요."
      )
    }
  }
}
