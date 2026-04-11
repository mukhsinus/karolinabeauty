// src/components/booking/ServiceModal.tsx

import { serviceDetails } from "@/utils/booking"

interface Props {
  modalService: any
  setModalService: (s: any | null) => void

  selectService: (serviceId: string, level: string) => void
  formatPrice: (price: number) => string

  t: (key: string) => string
}

const defaultBookLevel = (service: { prices?: { level?: string }[] }) => {
  const prices = service?.prices
  if (!Array.isArray(prices) || prices.length === 0) return "master"
  const m = prices.find((p) => p.level === "master")
  if (m?.level) return m.level
  return String(prices[0]?.level ?? "master")
}

export default function ServiceModal({
  modalService,
  setModalService,
  selectService,
  formatPrice,
  t
}: Props) {

  if (!modalService) return null

  const details = serviceDetails[modalService.nameKey] || {}

  const currency =
    modalService?.currency === "USD" || modalService?.category === "hair"
      ? "USD"
      : t("services.currency")

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={() => setModalService(null)}
    >

      <div
        className="bg-white max-w-md w-full rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="space-y-4">

          {/* TITLE */}
          <h3 className="text-xl font-display whitespace-pre-line">
            {details.title || t(modalService.nameKey)}
          </h3>

          {/* DESCRIPTION */}
          {details.description && (
            <p className="text-sm text-muted-foreground">
              {details.description}
            </p>
          )}

          {/* EXTRA */}
          {details.extra && (
            <p className="text-sm">
              {details.extra}
            </p>
          )}

          {/* PRICE */}
          <div className="text-lg font-semibold text-primary pt-2">
            {formatPrice(modalService.price)} {currency}
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex gap-3">

            <button
              onClick={() => {
                selectService(modalService.id, defaultBookLevel(modalService))
                setModalService(null)
              }}
              className="flex-1 bg-primary text-white py-3 rounded-full"
            >
              {t("services.book")}
            </button>

            <button
              onClick={() => setModalService(null)}
              className="px-4 py-3 border rounded-full"
            >
              {t("common.close")}
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}