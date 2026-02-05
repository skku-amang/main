import * as fs from "fs"
import * as path from "path"

const envPath = path.resolve(__dirname, "../../../.env.test")
const envContent = fs.readFileSync(envPath, "utf8")

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIndex = trimmed.indexOf("=")
  if (eqIndex === -1) continue
  const key = trimmed.slice(0, eqIndex)
  const value = trimmed.slice(eqIndex + 1)
  process.env[key] = value
}
