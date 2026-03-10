// backend/src/models/booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
  },

  serviceName: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
    minlength: 2,
  },

  phone: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "confirmed",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BookingSchema.index({ date: 1, time: 1 }, { unique: true });

export default mongoose.model("Booking", BookingSchema);