// src/components/booking/BranchSelector.tsx
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

interface Props {
  branches: any[]
  branchId: string | null

  selectBranch: (id: string) => void

  branchNamesMap: Record<string, string>

  isLoading: boolean

  t: (key: string) => string
}

const cardTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as const
}

export default function BranchSelector({
  branches,
  branchId,
  selectBranch,
  branchNamesMap,
  isLoading,
  t
}: Props) {

  return (
    <div className="mb-16">

      {/* HEADER */}
      <h3 className="text-xl font-display mb-6 flex items-center gap-2">
        <MapPin size={18} />
        {t("booking.select_branch")}
      </h3>

      {/* CONTENT */}
      <div className="grid md:grid-cols-2 gap-4 min-h-[5.5rem]">

        {isLoading ? (

          <div className="text-sm text-muted-foreground">
            Загрузка филиалов...
          </div>

        ) : (

          branches.map((branch) => {
            const selected = branchId === branch._id
            return (
              <motion.button
                key={branch._id}
                type="button"
                onClick={() => selectBranch(branch._id)}
                initial={false}
                animate={{
                  scale: selected ? 1 : 0.98,
                  opacity: 1
                }}
                transition={cardTransition}
                whileHover={{ scale: selected ? 1 : 0.995 }}
                whileTap={{ scale: 0.97 }}
                className={`p-6 border rounded-2xl text-left will-change-transform
                  transition-[box-shadow,border-color,background-color] duration-200 ease-out
                  ${
                    selected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/15 ring-2 ring-primary/25"
                      : "border-border shadow-sm hover:shadow-md hover:border-primary/30"
                  }`}
              >

                <div className="font-semibold">
                  {branchNamesMap[branch.name] || branch.name}
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  {branch.address}
                </div>

              </motion.button>
            )
          })

        )}

      </div>

    </div>
  )
}