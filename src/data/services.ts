// src/data/services.ts
// Category shell only (icons, i18n keys). Service rows come from /api/services via mapServices.

import {
  Sparkles,
  Scissors,
  Eye,
  Droplets,
  Wand2,
  Syringe
} from "lucide-react"

export interface ServiceItem {
  id: string
  nameKey: string
  price: number
  duration: number
  isFrom?: boolean
  isPromo?: boolean
  prices?: Array<{ level: string; price: number }>
  mongoId?: string
  _id?: string
  category?: string
  currency?: string
}

export interface ServiceGroup {
  id: string
  titleKey: string
  services: ServiceItem[]
}

export interface ServiceCategory {
  id: string
  nameKey: string
  icon: typeof Sparkles
  groups: ServiceGroup[]
}

const emptyGroup = (id: string, titleKey: string): ServiceGroup => ({
  id,
  titleKey,
  services: []
})

export const serviceCategories: ServiceCategory[] = [
  {
    id: "lashes",
    nameKey: "services.lashes",
    icon: Sparkles,
    groups: [emptyGroup("lashes_all", "services.lashes")]
  },
  {
    id: "nails",
    nameKey: "services.nails",
    icon: Scissors,
    groups: [emptyGroup("nails_all", "services.nails")]
  },
  {
    id: "brows",
    nameKey: "services.brows",
    icon: Eye,
    groups: [emptyGroup("brows_all", "services.brows")]
  },
  {
    id: "hair",
    nameKey: "services.hair",
    icon: Wand2,
    groups: [emptyGroup("hair_all", "services.hair")]
  },
  {
    id: "permanent",
    nameKey: "services.permanent",
    icon: Syringe,
    groups: [emptyGroup("permanent_all", "services.permanent")]
  },
  {
    id: "removal",
    nameKey: "services.removal",
    icon: Droplets,
    groups: [emptyGroup("removal_all", "services.removal")]
  }
]
