// src/components/booking/BranchSelector.tsx
import { MapPin } from "lucide-react"

interface Props {
  branches: any[]
  branchId: string | null

  selectBranch: (id: string) => void

  branchNamesMap: Record<string, string>

  isLoading: boolean

  t: (key: string) => string
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
      <div className="grid md:grid-cols-2 gap-4">

        {isLoading ? (

          <div className="text-sm text-muted-foreground">
            Загрузка филиалов...
          </div>

        ) : (

          branches.map((branch) => (

            <button
              key={branch._id}
              onClick={() => selectBranch(branch._id)}

              className={`p-6 border rounded-2xl text-left transition hover:shadow-md
              ${
                branchId === branch._id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >

              <div className="font-semibold">
                {branchNamesMap[branch.name] || branch.name}
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                {branch.address}
              </div>

            </button>

          ))

        )}

      </div>

    </div>
  )
}