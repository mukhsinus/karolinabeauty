// src/components/booking/BookingSummary.tsx
interface Props {
  booking: any
  selectedService: any
  selectedPrice: any
  finalPrice: number
  isVipSelected: boolean
  branch: any

  formatPrice: (price: number) => string
  formatDate: (date: string) => string
  t: (key: string) => string

  branchNamesMap: Record<string, string>
}

export default function BookingSummary({
  booking,
  selectedService,
  selectedPrice,
  finalPrice,
  isVipSelected,
  branch,
  formatPrice,
  formatDate,
  t,
  branchNamesMap
}: Props) {
  const currency = selectedService?.category === "hair"
    ? "USD"
    : t("services.currency")
  const rawLevel = selectedPrice?.level || booking?.service?.split("_")[1] || ""
  const levelLabelMap: Record<string, string> = {
    master: "Мастер",
    top: "Топ мастер",
    premium: "Премиум",
    promo: "Промо"
  }
  const selectedLevelLabel = levelLabelMap[rawLevel] || rawLevel

  return (
    <div className="lg:sticky lg:top-28 h-fit bg-card border rounded-2xl p-6">

      <h3 className="font-display text-lg mb-6">
        {t("booking.summary")}
      </h3>

      <div className="space-y-4 text-sm">

        {/* BRANCH */}
        <div>
          <div className="text-muted-foreground">
            {t("booking.branch")}
          </div>

          <div className="font-medium">
            {branch
              ? (branchNamesMap[branch.name] || branch.name)
              : t("common.empty")}
          </div>
        </div>

        {/* SERVICE */}
        <div>
          <div className="text-muted-foreground">
            {t("booking.service")}
          </div>

          <div className="font-medium">
            {selectedService
              ? t(selectedService.nameKey)
              : t("common.empty")}
          </div>
        </div>

        {/* LEVEL */}
        {selectedService && selectedLevelLabel && (
          <div>
            <div className="text-muted-foreground">
              Уровень
            </div>
            <div className="font-medium">
              {selectedLevelLabel}
            </div>
          </div>
        )}

        {/* DATE */}
        <div>
          <div className="text-muted-foreground">
            {t("booking.date")}
          </div>

          <div>
            {booking.date
              ? formatDate(booking.date)
              : t("common.empty")}
          </div>
        </div>

        {/* TIME */}
        <div>
          <div className="text-muted-foreground">
            {t("booking.time")}
          </div>

          <div>
            {booking.time
              ? booking.time
              : t("common.empty")}
          </div>
        </div>

        {/* PRICE */}
        {selectedService && (
          <div className="pt-4 border-t">

            <div className="text-muted-foreground">
              {t("booking.price")}
            </div>

            <div className="text-primary text-lg font-semibold">

              {formatPrice(finalPrice)} {currency}

              {isVipSelected && (
                <span className="text-xs text-primary ml-2">
                  VIP
                </span>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  )
}