// backend/src/services/services.service.js
import Service from "../models/Service.js"
import { inferListingCurrency } from "../utils/servicePrice.util.js"

const LIST_FIELDS =
  "_id nameKey category prices duration isFrom isPromo slotInterval requiredMasters vipAllowed isManualBooking"

/** Retired duplicate of classic_extension premium tier — keep out of listings; findById still works for legacy rows. */
const EXCLUDED_PUBLIC_NAME_KEYS = ["services.classic"]

/**
 * Active services for public API — order is stable for clients.
 */
export async function listActiveServices() {
  const rows = await Service.find({
    isActive: true,
    nameKey: { $nin: EXCLUDED_PUBLIC_NAME_KEYS },
  })
    .select(LIST_FIELDS)
    .sort({ category: 1, nameKey: 1 })
    .lean()

  return rows.map((s) => ({
    ...s,
    currency: inferListingCurrency(s),
  }))
}
