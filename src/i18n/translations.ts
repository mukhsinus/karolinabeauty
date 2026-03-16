// rc/src/i18n/translations.ts
import en from "./locales/en.json"
import ru from "./locales/ru.json"
import uz from "./locales/uz.json"

export type Lang = "ru" | "uz" | "en"

const translations: Record<Lang, Record<string, string>> = {
  en,
  ru,
  uz
}

export default translations