// backend/src/models/Service.js
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  duration: {
    type: Number,
    default: 60,
  },

  category: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Service", ServiceSchema);