// src/components/booking/TimeSelector.tsx

import { Clock } from "lucide-react"
import { isVipTime } from "@/utils/booking"

interface Props {
  timeSlots: string[]
  booking: any

  bookedSlots: string[]

  selectTime: (time: string) => void
  resetTime: () => void

  t: (key: string) => string
}

export default function TimeSelector({
  timeSlots,
  booking,
  bookedSlots,
  selectTime,
  resetTime,
  t
}: Props) {

  if (!booking.date) return null

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} />
        <h3 className="text-xl font-display">
          {t("booking.select_time")}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Студия работает с 10:00 до 20:00. Ранние и поздние записи — VIP (+доплата).
      </p>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-14">

        {timeSlots.map((time) => {

          // 🔥 ФИКС: теперь просто time
          const isBooked = bookedSlots.includes(time)

          const isVip = isVipTime(time)

          return (
            <button
              key={time}
              disabled={isBooked}
              title={isBooked ? "Уже занято" : ""}

              onClick={() => selectTime(time)}

              className={`py-3 rounded-xl border text-sm relative
              ${isBooked && "opacity-30 cursor-not-allowed"}
              ${
                isVip
                  ? "border-primary bg-primary/5 text-primary"
                  : booking.time === time
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary"
              }`}
            >

              <span>{time}</span>

              {isVip && (
                <span className="absolute top-1 right-2 text-[10px] font-medium text-primary">
                  VIP
                </span>
              )}

            </button>
          )
        })}

      </div>

      {booking.time && (
        <div className="mb-6 p-4 border rounded-xl flex justify-between items-center">

          <div className="font-medium">
            {booking.time}
          </div>

          <button
            onClick={resetTime}
            className="text-sm text-primary"
          >
            Изменить
          </button>

        </div>
      )}
    </>
  )
}