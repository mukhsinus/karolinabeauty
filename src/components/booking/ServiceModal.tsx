// src/components/booking/ServiceModal.tsx
import { serviceDetails } from "@/utils/booking"

interface Props {
  modalService: any
  setModalService: (s: any | null) => void

  selectService: (serviceId: string, level: string) => void
  formatPrice: (price: number) => string

  t: (key: string) => string
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
  const currency = modalService?.category === "hair" ? "USD" : "сум"

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

          {/* PRICE (базовый, без level — как в оригинале) */}
          <div className="text-lg font-semibold text-primary pt-2">
            {formatPrice(modalService.price)} {currency}
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex gap-3">

            {/* ⚠️ ВАЖНО: здесь нельзя просто service.id */}
            {/* поэтому по умолчанию берём master */}
            <button
              onClick={() => {
                selectService(modalService.id, "master")
                setModalService(null)
              }}
              className="flex-1 bg-primary text-white py-3 rounded-full"
            >
              Записаться
            </button>

            <button
              onClick={() => setModalService(null)}
              className="px-4 py-3 border rounded-full"
            >
              Закрыть
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}