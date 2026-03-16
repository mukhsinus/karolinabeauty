// backend/src/models/Service.js
import mongoose from "mongoose";

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

    // цена услуги
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // длительность в минутах
    duration: {
      type: Number,
      default: 60,
      min: 5,
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
  },
  {
    timestamps: true,
  }
);

// индекс для быстрых фильтров
ServiceSchema.index({ category: 1, isActive: 1 });

export default mongoose.model("Service", ServiceSchema);