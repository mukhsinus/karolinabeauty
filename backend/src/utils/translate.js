// backend/src/utils/translate.js
import fs from "fs"
import path from "path"


const translationsPath = path.resolve(
  process.cwd(),
  "../src/i18n/locales/ru.json"
)

let translations = {}

try {

  const raw = fs.readFileSync(translationsPath, "utf-8")
  translations = JSON.parse(raw)

} catch (error) {

  console.error("Translation file not found:", translationsPath)

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