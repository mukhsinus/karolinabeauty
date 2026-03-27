import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Locale JSON lives at repo-root `src/i18n/locales/{lang}.json`.
 * This file is `backend/src/telegram/utils/serviceI18n.js`.
 *
 * Resolution uses only __dirname (never process.cwd()):
 * 1) Monorepo: four levels up → repository root → `src/i18n/locales`.
 * 2) Backend-only image (e.g. WORKDIR is backend root): three levels up → `src/i18n/locales` under that root.
 */
const localePathCandidates = (lang) => {
  const file = `${lang}.json`
  return [
    path.resolve(__dirname, "../../../../src/i18n/locales", file),
    path.resolve(__dirname, "../../../src/i18n/locales", file),
  ]
}

const cache = new Map()
const I18N_DIAG = process.env.I18N_DIAG === "1"

const readLocale = (lang = "ru") => {
  const normalized = ["ru", "uz", "en"].includes(lang) ? lang : "ru"
  if (cache.has(normalized)) return cache.get(normalized)

  const candidates = localePathCandidates(normalized)

  let data = {}
  let usedPath = null
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        data = JSON.parse(fs.readFileSync(p, "utf-8"))
        usedPath = p
        break
      }
    } catch (err) {
      console.warn(`[i18n] Failed to read locale file: ${p}`, err?.message || err)
    }
  }

  if (!usedPath) {
    console.warn(
      `[i18n] Locale file not found for "${normalized}". Tried (in order): ${candidates.join(" | ")} (__dirname=${__dirname})`
    )
  } else if (I18N_DIAG) {
    console.log(
      "[i18n diag] readLocale",
      JSON.stringify(
        {
          lang: normalized,
          __dirname,
          usedPath,
          keysCount: Object.keys(data || {}).length,
        },
        null,
        2
      )
    )
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
  const out = typeof val === "string" && val.trim() ? val : key
  if (I18N_DIAG) {
    console.log(
      "[i18n diag] translate",
      JSON.stringify(
        {
          key,
          lang,
          resolved: typeof val === "string" && Boolean(val.trim()),
          out: out === key ? out : out.slice(0, 80),
        },
        null,
        2
      )
    )
  }
  return out
}

export const translateService = (nameKey, lang = "ru") => {
  if (!nameKey) return ""
  const serviceLeaf = String(nameKey).replace(/^services\./, "")
  const key = `services.${serviceLeaf}`
  const translated = translate(key, lang)
  if (translated === key) {
    console.warn(`[i18n] Missing service translation (${lang}): ${key}`)
    const fallback = humanize(serviceLeaf)
    if (I18N_DIAG) {
      console.log(
        "[i18n diag] translateService → humanize",
        JSON.stringify({ nameKey, lang, key, translated, fallback }, null, 2)
      )
    }
    return fallback
  }
  if (I18N_DIAG) {
    console.log("[i18n diag] translateService → ok", JSON.stringify({ nameKey, lang, key, translated }, null, 2))
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

