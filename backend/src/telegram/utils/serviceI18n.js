import { t } from "../../utils/translate.js"

export const translateService = (nameKey) => {
  if (!nameKey) return ""
  const translated = t(nameKey)
  if (translated === nameKey) {
    console.warn(`[i18n] Missing service translation: ${nameKey}`)
  }
  return translated
}

export const translateCategory = (category) => {
  if (!category) return ""

  // Current frontend locale keys store categories under services.<category>
  const key = `services.${category}`
  const translated = t(key)
  if (translated === key) {
    console.warn(`[i18n] Missing category translation: ${key}`)
    return category
  }
  return translated
}

