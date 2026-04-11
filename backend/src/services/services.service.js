// backend/src/services/services.service.js
import Service from "../models/Service.js"
import { inferListingCurrency } from "../utils/servicePrice.util.js"

const LIST_FIELDS =
  "_id nameKey category prices duration isFrom isPromo slotInterval requiredMasters vipAllowed isManualBooking"

/**
 * Active services for public API — no nameKey filtering; order is stable for clients.
 */
export async function listActiveServices() {
  const rows = await Service.find({ isActive: true })
    .select(LIST_FIELDS)
    .sort({ category: 1, nameKey: 1 })
    .lean()

  return rows.map((s) => ({
    ...s,
    currency: inferListingCurrency(s),
  }))
}
