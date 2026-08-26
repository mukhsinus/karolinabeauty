import { Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookAnother: () => void
  t: (key: string) => string
}

export default function AlreadyBookedDialog({
  open,
  onOpenChange,
  onBookAnother,
  t
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl text-center sm:text-center">
        <DialogHeader className="items-center space-y-3 text-center sm:text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-[check-pop_0.45s_ease-out]">
            <Check size={32} strokeWidth={2.4} />
          </div>
          <DialogTitle className="font-display text-2xl">
            {t("booking.already_title")}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {t("booking.already_message")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full bg-primary py-3 text-white transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("booking.got_it")}
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onBookAnother()
            }}
            className="w-full rounded-full border border-border py-3 text-sm text-foreground transition hover:bg-secondary/50"
          >
            {t("booking.book_another")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
