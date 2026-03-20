// backend/src/models/Booking.js

import mongoose from "mongoose"

const BookingSchema = new mongoose.Schema(
{
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
    index: true
  },

  serviceId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  serviceName: {
    type: String,
    required: true,
    trim: true
  },

  serviceLevel: {
    type: String,
    trim: true,
    default: ""
  },

  serviceDuration: {
    type: Number,
    required: true,
    min: 5
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  date: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },

  time: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{2}:\d{2}$/,
    index: true
  },

  name: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed",
    index: true
  },

  notes: {
    type: String,
    trim: true,
    default: ""
  },

  source: {
    type: String,
    enum: ["website", "telegram", "admin"],
    default: "website",
    index: true
  }
},
{
  timestamps: true
}
)

/*
PREVENT DOUBLE BOOKING
*/

BookingSchema.index(
{ branchId: 1, date: 1, time: 1 },
{ unique: true }
)

/*
SEARCH CLIENT BOOKINGS
*/

BookingSchema.index({ phone: 1 })

export default mongoose.model("Booking", BookingSchema)