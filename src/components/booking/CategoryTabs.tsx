// src/components/booking/CategoryTabs.tsx
import { motion } from "framer-motion"
import { useRef } from "react"

interface Props {
  services: any[]
  category: string

  selectCategory: (id: string) => void

  isLoading: boolean
  error: any

  t: (key: string) => string

  showHint: boolean
  setShowHint: (v: boolean) => void
}

export default function CategoryTabs({
  services,
  category,
  selectCategory,
  isLoading,
  error,
  t,
  showHint,
  setShowHint
}: Props) {

  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="relative mb-14">

      <div
        ref={scrollRef}
        onScroll={() => setShowHint(false)}
        className="flex gap-3 overflow-x-auto pb-2 whitespace-nowrap no-scrollbar"
      >

        {isLoading ? (

          <div className="text-sm text-muted-foreground">
            Загрузка услуг...
          </div>

        ) : error ? (

          <div className="text-sm text-red-500">
            Ошибка загрузки
          </div>

        ) : (

          services?.map((cat) => (

            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl border text-sm font-medium
                transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out
                will-change-transform
                hover:scale-[1.02] hover:shadow-md active:scale-[0.98]
              ${
                category === cat.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white border-border hover:border-primary/35"
              }`}
            >

              {/* иконка */}
              {cat.icon && <cat.icon size={18} />}

              {/* название */}
              {t(cat.nameKey)}

            </button>

          ))

        )}

      </div>

      {/* 👉 стрелка (UX подсказка) */}
      {showHint && (
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="lg:hidden absolute right-2 top-full mt-2 text-primary text-sm"
        >
          →
        </motion.div>
      )}

      {/* 👉 градиент справа */}
      <div className="lg:hidden pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />

    </div>
  )
}