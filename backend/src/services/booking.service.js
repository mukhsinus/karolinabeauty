// backend/src/services/booking.service.js

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Branch from "../models/Branch.js";
import mongoose from "mongoose";
import { isBlockedSlot } from "./blockedSlot.service.js";
import {
  generateAvailableSlots,
  assignMastersForSlot,
  assertServiceAllowsTime,
} from "./availability.service.js";
import { assertPremiumAllowedForBranch } from "../utils/branchPremium.util.js";

/*
NORMALIZE PHONE
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

  // ❗ ВАЖНО: проверка обязательных параметров

  if (!serviceLevel) {
    throw new Error("Service level is required");
  }

  // проверяем филиал

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  assertPremiumAllowedForBranch(branch, serviceLevel);

  // проверяем услугу

  const service = await Service.findById(serviceId);

  if (!service || !service.isActive) {
    throw new Error("Service not available");
  }

  if (service.isManualBooking) {
    throw new Error("This service is booked manually — contact the salon");
  }

  const blocked = await isBlockedSlot({ branchId, date, time });
  if (blocked) {
    throw new Error("Time slot is blocked");
  }

  assertServiceAllowsTime(service, time);

  // цена

  const levelPrice = Array.isArray(service.prices)
    ? service.prices.find((p) => p.level === serviceLevel)
    : null;

  const resolvedPrice =
    typeof price === "number" && !Number.isNaN(price)
      ? price
      : levelPrice?.price ??
        (Array.isArray(service.prices) && service.prices.length > 0
          ? service.prices[0].price
          : null);

  if (typeof resolvedPrice !== "number") {
    throw new Error("Service price is not defined");
  }

  // создаем запись

  const createWithinSession = async (session) => {
    const { masterIds, start, end } = await assignMastersForSlot({
      branchId,
      serviceId,
      date,
      time,
    });

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

          masters: masterIds,
          start,
          end,

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

  return generateAvailableSlots({
    branchId,
    serviceId,
    date,
    serviceLevel,
  });
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

    const svcDoc = await Service.findById(newServiceId, null, opts).lean();
    if (!svcDoc || svcDoc.isManualBooking) {
      throw new Error("Service not available for online reschedule");
    }

    const branchDoc = await Branch.findById(newBranchId, null, opts);
    if (!branchDoc) throw new Error("Branch not found");
    assertPremiumAllowedForBranch(branchDoc, newServiceLevel);

    assertServiceAllowsTime(svcDoc, newTime);

    const { masterIds, start, end } = await assignMastersForSlot({
      branchId: newBranchId,
      serviceId: newServiceId,
      date: newDate,
      time: newTime,
      excludeBookingId: booking._id,
    });

    booking.branchId = newBranchId;
    booking.serviceId = newServiceId;
    booking.serviceLevel = newServiceLevel;
    booking.date = newDate;
    booking.time = newTime;
    booking.masters = masterIds;
    booking.start = start;
    booking.end = end;
    booking.serviceDuration = svcDoc.duration || booking.serviceDuration;

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