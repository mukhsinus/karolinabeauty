// src/data/services.ts

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
}

export interface ServiceGroup {
  id: string
  titleKey: string
  services: ServiceItem[]
}

export interface ServiceCategory {
  id: string
  nameKey: string
  icon: any
  groups: ServiceGroup[]
}

export const serviceCategories: ServiceCategory[] = [

  /* ---------- LASHES ---------- */

  {
    id: "lashes",
    nameKey: "services.lashes",
    icon: Sparkles,
    groups: [

      {
        id: "lashes_basic",
        titleKey: "services.basic_master",
        services: [
          { id: "classic_extension", nameKey: "services.classic_extension", price: 200000, duration: 120 },
          { id: "led_extension", nameKey: "services.led_extension", price: 250000, duration: 120 },
          { id: "colored_lashes", nameKey: "services.colored_lashes", price: 50000, duration: 45 },
          { id: "lash_removal", nameKey: "services.lash_removal", price: 50000, duration: 30 },
        ],
      },

      {
        id: "lashes_top_regina",
        titleKey: "services.top_master_regina",
        services: [
          { id: "regina_classic", nameKey: "services.classic_extension", price: 300000, duration: 120 },
          { id: "regina_led", nameKey: "services.led_extension", price: 400000, duration: 120 },
        ],
      },

      {
        id: "lashes_premium_karolina",
        titleKey: "services.premium_master_karolina",
        services: [
          { id: "karolina_classic", nameKey: "services.classic", price: 400000, duration: 120 },
          { id: "karolina_2_3d", nameKey: "services.lashes_2_3d", price: 500000, duration: 150 },
          { id: "karolina_effect", nameKey: "services.author_effect", price: 550000, duration: 150 },
          { id: "karolina_4_6d", nameKey: "services.lashes_4_6d", price: 600000, duration: 180 },
          { id: "karolina_lamination", nameKey: "services.lash_lamination", price: 300000, duration: 60 },
        ],
      },

      {
        id: "lashes_promo",
        titleKey: "services.promo",
        services: [
          { id: "lash_lamination", nameKey: "services.lash_lamination", price: 100000, duration: 60 },
          { id: "lash_lamination_plus", nameKey: "services.lash_lamination_plus", price: 150000, duration: 75 },
        ],
      },

    ],
  },

  /* ---------- NAILS ---------- */

  {
    id: "nails",
    nameKey: "services.nails",
    icon: Scissors,
    groups: [

      {
        id: "nails_main",
        titleKey: "services.manicure_pedicure",
        services: [
          { id: "manicure", nameKey: "services.manicure", price: 170000, duration: 60 },
          { id: "manicure_plus", nameKey: "services.manicure_plus", price: 250000, duration: 75 },
          { id: "pedicure", nameKey: "services.pedicure", price: 190000, duration: 60 },
          { id: "pedicure_plus", nameKey: "services.pedicure_plus", price: 220000, duration: 75 },
          { id: "combo_four_hands", nameKey: "services.combo_four_hands", price: 400000, duration: 120 },
          { id: "combo_promo", nameKey: "services.combo_promo", price: 290000, duration: 120 },
        ],
      },

      {
        id: "nails_japanese",
        titleKey: "services.japanese",
        services: [
          { id: "japanese_manicure", nameKey: "services.japanese_manicure", price: 250000, duration: 60 },
          { id: "japanese_pedicure", nameKey: "services.japanese_pedicure", price: 250000, duration: 60 },
          { id: "japanese_combo", nameKey: "services.japanese_combo", price: 400000, duration: 120 },
        ],
      },

      {
        id: "nails_extra",
        titleKey: "services.extra_services",
        services: [
          { id: "nail_removal", nameKey: "services.nail_removal", price: 40000, duration: 30 },
          { id: "designs", nameKey: "services.designs", price: 50000, duration: 30, isFrom: true },
          { id: "french", nameKey: "services.french", price: 50000, duration: 30 },
          { id: "vtirka", nameKey: "services.vtirka", price: 50000, duration: 30 },
          { id: "nail_repair", nameKey: "services.nail_repair", price: 15000, duration: 20, isFrom: true },
          { id: "paraffin_spa", nameKey: "services.paraffin_spa", price: 50000, duration: 30 },
          { id: "smart_oil_spa", nameKey: "services.smart_oil_spa", price: 50000, duration: 30 },
        ],
      },

    ],
  },

  /* ---------- BROWS ---------- */

  {
    id: "brows",
    nameKey: "services.brows",
    icon: Eye,
    groups: [

      {
        id: "brows_basic",
        titleKey: "services.brows_basic",
        services: [
          { id: "brow_architecture", nameKey: "services.brow_architecture", price: 100000, duration: 45 },
          { id: "brow_styling", nameKey: "services.brow_styling", price: 100000, duration: 45 },
          { id: "brow_coloring", nameKey: "services.brow_coloring", price: 100000, duration: 45 },
          { id: "muslim_lightening", nameKey: "services.muslim_lightening", price: 100000, duration: 45 },
        ],
      },

      {
        id: "brows_karolina",
        titleKey: "services.karolina_brows",
        services: [
          { id: "karolina_brows", nameKey: "services.karolina_brows", price: 350000, duration: 60 },
        ],
      },

    ],
  },

  /* ---------- HAIR ---------- */

  {
    id: "hair",
    nameKey: "services.hair",
    icon: Wand2,
    groups: [

      {
        id: "hair_work",
        titleKey: "services.hair_extension_work",
        services: [
          { id: "hair_work_100g", nameKey: "services.hair_100g_work", price: 650000, duration: 180 },
        ],
      },

      {
        id: "hair_natural",
        titleKey: "services.hair_natural",
        services: [
          { id: "hair_40", nameKey: "services.hair_40_45", price: 2080000, duration: 240 },
          { id: "hair_50", nameKey: "services.hair_50_55", price: 2340000, duration: 240 },
          { id: "hair_60", nameKey: "services.hair_60_65", price: 2600000, duration: 240 },
          { id: "hair_70", nameKey: "services.hair_70_75", price: 2860000, duration: 240 },
          { id: "hair_80", nameKey: "services.hair_80_85", price: 3250000, duration: 240 },
        ],
      },

      {
        id: "hair_bioprotein",
        titleKey: "services.hair_bioprotein",
        services: [
          { id: "bio_60", nameKey: "services.bio_60_70", price: 975000, duration: 180 },
          { id: "bio_80", nameKey: "services.bio_80_90", price: 1170000, duration: 180 },
        ],
      },

    ],
  },

  /* ---------- PERMANENT ---------- */

  {
    id: "permanent",
    nameKey: "services.permanent",
    icon: Syringe,
    groups: [
      {
        id: "permanent_makeup",
        titleKey: "services.permanent_makeup",
        services: [
          { id: "permanent_lips", nameKey: "services.permanent_lips", price: 850000, duration: 120 },
          { id: "permanent_brows", nameKey: "services.permanent_brows", price: 850000, duration: 120 },
          { id: "interlash", nameKey: "services.interlash", price: 800000, duration: 120 },
        ],
      },
    ],
  },

  /* ---------- REMOVAL ---------- */

  {
    id: "removal",
    nameKey: "services.removal",
    icon: Droplets,
    groups: [
      {
        id: "permanent_removal",
        titleKey: "services.permanent_removal",
        services: [
          { id: "laser_removal", nameKey: "services.laser_removal", price: 400000, duration: 60 },
          { id: "remover_removal", nameKey: "services.remover_removal", price: 300000, duration: 60 },
        ],
      },
    ],
  },

]

/* ---------- HELPERS ---------- */

export const getAllServices = (): ServiceItem[] => {
  return serviceCategories.flatMap((cat) =>
    cat.groups.flatMap((group) => group.services)
  )
}

export const getServiceById = (id: string): ServiceItem | undefined => {
  return getAllServices().find((service) => service.id === id)
}