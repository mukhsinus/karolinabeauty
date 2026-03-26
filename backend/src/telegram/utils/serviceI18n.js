import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localePathCandidates = (lang) => [
  path.resolve(__dirname, `../../../src/i18n/locales/${lang}.json`),
  path.resolve(process.cwd(), `src/i18n/locales/${lang}.json`),
  path.resolve(process.cwd(), `../src/i18n/locales/${lang}.json`),
]

const cache = new Map()

const readLocale = (lang = "ru") => {
  const normalized = ["ru", "uz", "en"].includes(lang) ? lang : "ru"
  if (cache.has(normalized)) return cache.get(normalized)

  let data = {}
  for (const p of localePathCandidates(normalized)) {
    try {
      if (fs.existsSync(p)) {
        data = JSON.parse(fs.readFileSync(p, "utf-8"))
        break
      }
    } catch {}
  }

  cache.set(normalized, data || {})
  return data || {}
}

const getByPath = (obj, dottedKey) => {
  if (!obj || !dottedKey) return undefined
  if (Object.prototype.hasOwnProperty.call(obj, dottedKey)) return obj[dottedKey]
  return dottedKey.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

const humanize = (raw) => {
  if (!raw) return ""
  const clean = String(raw).replace(/^services\./, "").replace(/^categories\./, "")
  const spaced = clean.replace(/[_-]+/g, " ").trim()
  if (!spaced) return raw
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const translate = (key, lang = "ru") => {
  if (!key) return ""
  const locales = readLocale(lang)
  const val = getByPath(locales, key)
  if (typeof val === "string" && val.trim()) return val
  return key
}

export const translateService = (nameKey, lang = "ru") => {
  if (!nameKey) return ""
  const serviceLeaf = String(nameKey).replace(/^services\./, "")
  const key = `services.${serviceLeaf}`
  const translated = translate(key, lang)
  if (translated === key) {
    console.warn(`[i18n] Missing service translation (${lang}): ${key}`)
    return humanize(serviceLeaf)
  }
  return translated
}

export const translateCategory = (category, lang = "ru") => {
  if (!category) return ""
  const c = String(category).replace(/^categories\./, "").replace(/^services\./, "")

  // Prefer dedicated categories namespace, fallback to services.<category>
  const byCategory = translate(`categories.${c}`, lang)
  if (byCategory !== `categories.${c}`) return byCategory

  const byService = translate(`services.${c}`, lang)
  if (byService !== `services.${c}`) return byService

  console.warn(`[i18n] Missing category translation (${lang}): ${c}`)
  return humanize(c)
}

