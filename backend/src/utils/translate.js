// backend/src/utils/translate.js
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const candidates = [
  // typical: repo-root/src/i18n/locales/ru.json (frontend)
  path.resolve(__dirname, "../../src/i18n/locales/ru.json"),
  // if cwd is repo root
  path.resolve(process.cwd(), "src/i18n/locales/ru.json"),
  // legacy fallback (previous behavior)
  path.resolve(process.cwd(), "../src/i18n/locales/ru.json"),
]

const translationsPath = candidates.find((p) => {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
})

let translations = {}

try {

  if (translationsPath) {
    const raw = fs.readFileSync(translationsPath, "utf-8")
    translations = JSON.parse(raw)
  } else {
    console.error("Translation file not found:", candidates[0])
  }

} catch (error) {

  console.error("Translation file not found:", translationsPath || candidates[0])

}


export const t = (key) => {

  if (!key) return ""

  const value = translations[key]

  if (!value) return key

  return value

}


export const tSafe = (key) => {

  if (!key) return ""

  if (translations[key]) {
    return translations[key]
  }

  return key.split(".").pop()

}