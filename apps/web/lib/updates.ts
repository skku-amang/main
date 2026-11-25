import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import { z } from "zod"

const UPDATES_DIR = path.join(process.cwd(), "content/updates")

// YAML이 날짜를 Date로 읽어도 'YYYY-MM-DD' 글자로 맞춘다
const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z
    .union([z.date(), z.string()])
    .transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d))
    .pipe(z.iso.date()),
  href: z.string().startsWith("/").optional()
})

export type UpdatePost = z.infer<typeof frontmatterSchema> & {
  slug: string
  /** 카드에 보일 본문 첫 문단 (사진·md 기호 뺌) */
  summary: string
  body: string
}

const firstParagraph = (body: string) =>
  (
    body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("![")) ?? ""
  )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()

/** 최신순. 글 머리가 틀리면 빌드가 실패하도록 그대로 던진다 */
export function getUpdates(): UpdatePost[] {
  return fs
    .readdirSync(UPDATES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(UPDATES_DIR, file), "utf8")
      )
      const body = content.trim()
      return {
        ...frontmatterSchema.parse(data),
        slug: file.replace(/\.md$/, ""),
        summary: firstParagraph(body),
        body
      }
    })
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug)
    )
}

export function getUpdate(slug: string): UpdatePost | undefined {
  return getUpdates().find((u) => u.slug === slug)
}

/** 목록·카드에 넘길 부분만 (본문은 상세에서만) */
export const toUpdatePreview = ({
  slug,
  title,
  date,
  href,
  summary
}: UpdatePost) => ({ slug, title, date, href, summary })

export type UpdatePreview = ReturnType<typeof toUpdatePreview>
