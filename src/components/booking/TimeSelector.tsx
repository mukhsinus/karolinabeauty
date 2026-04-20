// src/components/booking/TimeSelector.tsx

import { Clock } from "lucide-react"
import type { AvailabilitySlot } from "@/lib/api"
import { isYmdTodayInBookingTz } from "@/utils/booking"

interface Props {
  slots: AvailabilitySlot[]
  booking: { date: string; time: string }
  isLoading: boolean
  isManual: boolean
  selectTime: (time: string) => void
  resetTime: () => void
  t: (key: string) => string
}

export default function TimeSelector({
  slots,
  booking,
  isLoading,
  isManual,
  selectTime,
  resetTime,
  t
}: Props) {
  if (!booking.date) return null

  if (isManual) {
    return (
      <div className="mb-14 p-6 border rounded-2xl bg-muted/30 text-center text-muted-foreground">
        {t("booking.manual_contact")}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} />
        <h3 className="text-xl font-display">
          {t("booking.select_time")}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {t("booking.slots_hint")}
      </p>

      {isLoading ? (
        <div className="text-sm text-muted-foreground mb-14">
          {t("booking.loading_slots")}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-sm text-muted-foreground mb-14 py-4 px-2 border border-dashed rounded-xl">
          {isYmdTodayInBookingTz(booking.date)
            ? t("booking.no_slots_today")
            : t("booking.no_slots_day")}
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-14">
          {slots.map((slot) => {
            const selected = booking.time === slot.time

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                title={
                  !slot.available
                    ? t("booking.slot_unavailable")
                    : ""
                }
                onClick={() => slot.available && selectTime(slot.time)}
                className={`py-3 rounded-xl border text-sm relative transition-colors
                  ${
                    !slot.available
                      ? "opacity-40 cursor-not-allowed border-border bg-muted/40 text-muted-foreground"
                      : selected
                        ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                        : slot.isVip
                          ? "border-primary bg-primary/5 text-primary hover:border-primary"
                          : "border-border hover:border-primary"
                  }`}
              >
                <span>{slot.time}</span>

                {slot.isVip && slot.available && (
                  <span className="absolute top-1 right-2 text-[10px] font-medium text-primary">
                    VIP
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {booking.time && (
        <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">
          <div className="font-medium">
            {booking.time}
          </div>

          <button
            type="button"
            onClick={resetTime}
            className="text-sm text-primary"
          >
            {t("common.change")}
          </button>
        </div>
      )}
    </>
  )
}
