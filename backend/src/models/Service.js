// backend/src/models/Service.js
import mongoose from "mongoose"

/**
 * Подсхема для уровней цен
 * (master / top / premium / promo)
 */
const priceSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ["master", "top", "premium", "promo"]
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
)

const ServiceSchema = new mongoose.Schema(
  {
    // ключ перевода (например services.classic_extension)
    nameKey: {
      type: String,
      required: true,
      trim: true,
    },

    // категория (lashes, nails, brows и тд)
    category: {
      type: String,
      required: true,
      index: true,
    },

    // ✅ НОВАЯ СТРУКТУРА ЦЕН
    prices: {
      type: [priceSchema],
      required: true,
      validate: {
        validator: (val) => val.length > 0,
        message: "Service must have at least one price"
      }
    },

    // длительность в минутах
    duration: {
      type: Number,
      default: 60,
      min: 5,
    },

    /** Шаг сетки слотов (минуты) */
    slotInterval: {
      type: Number,
      default: 30,
      min: 5,
    },

    /** Сколько мастеров нужно одновременно (например 2 для «4 руки») */
    requiredMasters: {
      type: Number,
      default: 1,
      min: 1,
    },

    /** Ранние/поздние слоты (VIP) разрешены для этой услуги */
    vipAllowed: {
      type: Boolean,
      default: true,
    },

    /** Время по договорённости — без онлайн-слотов */
    isManualBooking: {
      type: Boolean,
      default: false,
    },

    // для цен "от 50 000"
    isFrom: {
      type: Boolean,
      default: false,
    },

    // можно выключить услугу не удаляя
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // акция (для UI бейджа)
    isPromo: {
      type: Boolean,
      default: false,
      index: true
    },
  },
  {
    timestamps: true,
  }
)

// индексы
ServiceSchema.index({ category: 1, isActive: 1 })
ServiceSchema.index({ nameKey: 1 })

export default mongoose.model("Service", ServiceSchema)