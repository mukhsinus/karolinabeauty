// src/components/booking/BookingForm.tsx
import { User } from "lucide-react"

interface Props {
  booking: any

  setName: (name: string) => void
  setPhone: (phone: string) => void

  handleConfirm: () => void

  t: (key: string) => string
}

export default function BookingForm({
  booking,
  setName,
  setPhone,
  handleConfirm,
  t
}: Props) {

  if (!booking.time) return null

  return (
    <div className="w-full max-w-lg">

      <div className="flex items-center gap-2 mb-4">
        <User size={18} />
        <h3 className="text-xl font-display">
          {t("booking.details")}
        </h3>
      </div>

      <div className="space-y-4">

        <input
          type="text"
          placeholder={t("booking.name")}
          value={booking.name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border bg-background rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />

        <input
          type="tel"
          placeholder={t("booking.phone")}
          value={booking.phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-border bg-background rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />

        <button
          onClick={handleConfirm}
          className="w-full bg-primary text-white py-3 rounded-full transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          {t("booking.confirm_booking")}
        </button>

      </div>

    </div>
  )
}