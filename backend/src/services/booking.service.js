// backend/src/services/booking.service.js
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Branch from "../models/Branch.js";

/*
normalize phone

+998901234567
998901234567
90 123 45 67
*/

const normalizePhone = (phone) => {
  return phone.replace(/[^\d+]/g, "");
};


/*
CREATE BOOKING
*/

export const createBooking = async (payload) => {

  const {
    branchId,
    serviceId,
    serviceName,
    serviceLevel,
    price,
    date,
    time,
    name,
    phone,
    notes = ""
  } = payload;

  // проверяем филиал

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  // проверяем услугу

  const service = await Service.findById(serviceId);

  if (!service || !service.isActive) {
    throw new Error("Service not available");
  }

  // проверяем слот

  const existing = await Booking.findOne({
    branchId,
    date,
    time,
    status: "confirmed"
  });

  if (existing) {
    throw new Error("Time slot already booked");
  }

  // создаем запись

  const resolvedPrice =
    typeof price === "number" && !Number.isNaN(price)
      ? price
      : Array.isArray(service.prices) && service.prices.length > 0
        ? service.prices[0].price
        : null

  if (typeof resolvedPrice !== "number") {
    throw new Error("Service price is not defined")
  }

  const booking = await Booking.create({

    branchId,

    serviceId: service._id,

    serviceName: serviceName || service.nameKey,
    serviceLevel: serviceLevel || "",

    serviceDuration: service.duration,

    price: resolvedPrice,

    date,

    time,

    name,

    phone: normalizePhone(phone),

    notes,

    source: "website"

  });

  return booking;

};


/*
GET AVAILABILITY
*/

export const getAvailability = async (branchId, date) => {

  const bookings = await Booking.find({
    branchId,
    date,
    status: "confirmed"
  }).select("time");

  const bookedSlots = bookings.map(
    (b) => `${date}-${b.time}`
  );

  return bookedSlots;

};


/*
CANCEL BOOKING
*/

export const cancelBooking = async (bookingId) => {

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.status = "cancelled";

  await booking.save();

  return booking;

};


/*
GET BOOKINGS BY DATE
*/

export const getBookingsByDate = async (branchId, date) => {

  const bookings = await Booking.find({
    branchId,
    date
  })
  .populate("branchId", "name address")
  .sort({ time: 1 });

  return bookings;

};