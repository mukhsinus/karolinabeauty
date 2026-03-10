// backend/src/models/booking.js

import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    serviceId: {
      type: String,
      required: true,
      index: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    serviceDuration: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    time: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
IMPORTANT INDEX

Теперь уникальность записи определяется:

branchId + date + time

Это позволяет:

филиал A → 14:00
филиал B → 14:00

оба слота валидны
*/

BookingSchema.index(
  { branchId: 1, date: 1, time: 1 },
  { unique: true }
);

export default mongoose.model("Booking", BookingSchema);