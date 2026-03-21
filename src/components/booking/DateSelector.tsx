// src/components/booking/DateSelector.tsx

import { Calendar } from "lucide-react"

interface Props {
  dates: string[]
  booking: any

  selectDate: (date: string) => void
  resetDate: () => void

  formatDateLocal: (date: string) => string
  t: (key: string) => string
}

export default function DateSelector({
  dates,
  booking,
  selectDate,
  resetDate,
  formatDateLocal,
  t
}: Props) {

  return (
    <div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} />
        <h3 className="text-xl font-display">
          {t("booking.select_date")}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-14">

        {dates.map((date) => (

          <button
            key={date}
            onClick={() => selectDate(date)}
            className={`p-3 rounded-xl border text-sm
            ${
              booking.date === date
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary"
            }`}
          >
            {formatDateLocal(date)}
          </button>

        ))}

      </div>

      {booking.date && (
        <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">

          <div className="font-medium">
            {formatDateLocal(booking.date)}
          </div>

          <button
            onClick={resetDate}
            className="text-sm text-primary"
          >
            {t("common.change")}
          </button>

        </div>
      )}

    </div>
  )
}