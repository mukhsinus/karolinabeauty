// backend/src/services/booking.service.js

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Branch from "../models/Branch.js";
import mongoose from "mongoose";
import { getSlotCapacity } from "./capacity.service.js";
import { getBlockedInfoForDate, isBlockedSlot } from "./blockedSlot.service.js";

/*
NORMALIZE PHONE
*/

const normalizePhone = (phone) => {
  return phone.replace(/[^\d+]/g, "");
};

const generateTimeSlots = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const isWeekend = day === 0 || day === 6;

  const start = isWeekend ? 10 : 9;
  const end = isWeekend ? 22 : 21;

  const slots = [];
  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }

  return slots;
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

  // ❗ ВАЖНО: проверка обязательных параметров

  if (!serviceLevel) {
    throw new Error("Service level is required");
  }

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

  const capacity = await getSlotCapacity({
    branchId,
    serviceId,
    serviceLevel,
    date
  });

  const blocked = await isBlockedSlot({ branchId, date, time });
  if (blocked) {
    throw new Error("Time slot is blocked");
  }

  // цена

  const resolvedPrice =
    typeof price === "number" && !Number.isNaN(price)
      ? price
      : Array.isArray(service.prices) && service.prices.length > 0
        ? service.prices[0].price
        : null;

  if (typeof resolvedPrice !== "number") {
    throw new Error("Service price is not defined");
  }

  // создаем запись

  const assertSlotAvailable = async (
    { branchId, serviceId, serviceLevel, date, time, capacity, excludeBookingId },
    session
  ) => {
    const query = {
      branchId,
      serviceId,
      serviceLevel,
      date,
      time,
      status: "confirmed"
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const count = await Booking.countDocuments(
      query,
      session ? { session } : undefined
    );

    if (count >= capacity) {
      throw new Error("Time slot is full");
    }
  };

  // Try to enforce capacity atomically (replica set / transactions),
  // fallback to non-transactional check if transactions aren't available.
  const createWithinSession = async (session) => {
    await assertSlotAvailable(
      { branchId, serviceId, serviceLevel, date, time, capacity },
      session
    );

    const [created] = await Booking.create(
      [
        {
          branchId,

          // keep consistent with Booking schema (String)
          serviceId,

          serviceName: serviceName || service.nameKey,

          serviceLevel,

          serviceDuration: service.duration,

          price: resolvedPrice,

          date,
          time,

          name,

          phone: normalizePhone(phone),

          notes,

          source: "website"
        }
      ],
      session ? { session } : undefined
    );

    return created;
  };

  let booking;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    booking = await createWithinSession(session);
    await session.commitTransaction();
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {
      // ignore
    }

    // If transactions aren't supported (common on standalone Mongo),
    // retry without transaction but still enforce the same rule.
    const msg = String(err?.message || "");
    const canRetryWithoutTxn =
      msg.includes("Transaction") ||
      msg.includes("replica set") ||
      msg.includes("not supported");

    if (!canRetryWithoutTxn) throw err;

    booking = await createWithinSession(undefined);
  } finally {
    session.endSession();
  }

  return booking;
};


/*
GET AVAILABILITY
Теперь учитывает serviceId + serviceLevel
*/

export const getAvailability = async (
  branchId,
  serviceId,
  serviceLevel,
  date
) => {

  if (!serviceId || !serviceLevel) {
    throw new Error("serviceId and serviceLevel are required");
  }

  const capacity = await getSlotCapacity({
    branchId,
    serviceId,
    serviceLevel,
    date
  });

  const { isDayBlocked, times: blockedTimes } = await getBlockedInfoForDate({
    branchId,
    date
  });

  if (isDayBlocked) {
    return generateTimeSlots(date);
  }

  const fullTimesAgg = await Booking.aggregate([
    {
      $match: {
        branchId: typeof branchId === "string" ? new mongoose.Types.ObjectId(branchId) : branchId,
        serviceId,
        serviceLevel,
        date,
        status: "confirmed"
      }
    },
    { $group: { _id: "$time", count: { $sum: 1 } } },
    { $match: { count: { $gte: capacity } } },
    { $project: { _id: 0, time: "$_id" } },
    { $sort: { time: 1 } }
  ]);

  const fullTimes = fullTimesAgg.map((x) => x.time);
  const merged = new Set([...(blockedTimes || []), ...fullTimes]);
  return Array.from(merged).sort();
};

/*
RESCHEDULE BOOKING
Uses the same capacity-based availability checks as createBooking/getAvailability.
Blocked slots will be integrated later in the same check.
*/

export const rescheduleBooking = async (
  bookingId,
  { branchId, serviceId, serviceLevel, date, time }
) => {
  const session = await mongoose.startSession();

  const run = async (sessionOrNull) => {
    const opts = sessionOrNull ? { session: sessionOrNull } : undefined;

    const booking = await Booking.findById(bookingId, null, opts);
    if (!booking) throw new Error("Booking not found");

    const newBranchId = branchId || booking.branchId;
    const newServiceId = serviceId || booking.serviceId;
    const newServiceLevel = serviceLevel || booking.serviceLevel;
    const newDate = date || booking.date;
    const newTime = time || booking.time;

    const blocked = await isBlockedSlot({
      branchId: newBranchId,
      date: newDate,
      time: newTime
    });
    if (blocked) {
      throw new Error("Time slot is blocked");
    }

    const capacity = await getSlotCapacity({
      branchId: newBranchId,
      serviceId: newServiceId,
      serviceLevel: newServiceLevel,
      date: newDate
    });

    const query = {
      branchId: newBranchId,
      serviceId: newServiceId,
      serviceLevel: newServiceLevel,
      date: newDate,
      time: newTime,
      status: "confirmed",
      _id: { $ne: booking._id }
    };

    const count = await Booking.countDocuments(query, opts);
    if (count >= capacity) {
      throw new Error("Time slot is full");
    }

    booking.branchId = newBranchId;
    booking.serviceId = newServiceId;
    booking.serviceLevel = newServiceLevel;
    booking.date = newDate;
    booking.time = newTime;

    await booking.save(opts);
    return booking;
  };

  try {
    session.startTransaction();
    const updated = await run(session);
    await session.commitTransaction();
    return updated;
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {
      // ignore
    }

    const msg = String(err?.message || "");
    const canRetryWithoutTxn =
      msg.includes("Transaction") ||
      msg.includes("replica set") ||
      msg.includes("not supported");

    if (!canRetryWithoutTxn) throw err;
    return await run(null);
  } finally {
    session.endSession();
  }
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
COMPLETE BOOKING
*/

export const completeBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.status = "completed";

  await booking.save();

  return booking;
};


/*
GET BOOKINGS BY DATE
(оставляем как есть, но можно расширить позже)
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