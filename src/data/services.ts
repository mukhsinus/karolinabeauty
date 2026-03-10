// src/data/services.ts
export interface ServiceItem {
  id: string
  nameKey: string
  price: number
  duration: number
  isFrom?: boolean
}

export interface ServiceCategory {
  id: string
  nameKey: string
  icon: string
  services: ServiceItem[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "lashes",
    nameKey: "services.lashes",
    icon: "✨",
    services: [
      { id: "lash_lamination", nameKey: "services.lash_lamination", price: 100000, duration: 60 },
      { id: "lash_lamination_plus", nameKey: "services.lash_lamination_plus", price: 150000, duration: 75 },
      { id: "classic_extension", nameKey: "services.classic_extension", price: 200000, duration: 120 },
      { id: "led_extension", nameKey: "services.led_extension", price: 250000, duration: 120 },
      { id: "colored_lashes", nameKey: "services.colored_lashes", price: 50000, duration: 45 },
      { id: "lash_removal", nameKey: "services.lash_removal", price: 50000, duration: 30 },
    ],
  },

  {
    id: "nails",
    nameKey: "services.nails",
    icon: "💅",
    services: [
      { id: "combo_mani_pedi", nameKey: "services.combo_mani_pedi", price: 290000, duration: 120 },

      { id: "manicure", nameKey: "services.manicure", price: 170000, duration: 60 },
      { id: "manicure_plus", nameKey: "services.manicure_plus", price: 220000, duration: 75 },

      { id: "smart_pedicure", nameKey: "services.smart_pedicure", price: 170000, duration: 60 },
      { id: "smart_pedicure_plus", nameKey: "services.smart_pedicure_plus", price: 220000, duration: 75 },

      { id: "japanese_manicure", nameKey: "services.japanese_manicure", price: 250000, duration: 60 },
      { id: "japanese_pedicure", nameKey: "services.japanese_pedicure", price: 250000, duration: 60 },

      { id: "nail_removal", nameKey: "services.nail_removal", price: 40000, duration: 30 },

      { id: "designs", nameKey: "services.designs", price: 50000, duration: 30, isFrom: true },
      { id: "french", nameKey: "services.french", price: 50000, duration: 30 },
      { id: "ombre", nameKey: "services.ombre", price: 50000, duration: 30 },

      { id: "nail_repair", nameKey: "services.nail_repair", price: 15000, duration: 20, isFrom: true },

      { id: "paraffin_spa", nameKey: "services.paraffin_spa", price: 50000, duration: 30 },
      { id: "smart_oil_spa", nameKey: "services.smart_oil_spa", price: 50000, duration: 30 },
    ],
  },

  {
    id: "brows",
    nameKey: "services.brows",
    icon: "🪶",
    services: [
      { id: "brow_architecture", nameKey: "services.brow_architecture", price: 100000, duration: 45 },
      { id: "brow_styling", nameKey: "services.brow_styling", price: 100000, duration: 45 },
      { id: "brow_coloring", nameKey: "services.brow_coloring", price: 100000, duration: 45 },
      { id: "muslim_lightening", nameKey: "services.muslim_lightening", price: 100000, duration: 45 },
    ],
  },

  {
    id: "depilation",
    nameKey: "services.depilation",
    icon: "🌸",
    services: [
      { id: "promo_depilation", nameKey: "services.promo_depilation", price: 250000, duration: 90 },
      { id: "deep_bikini", nameKey: "services.deep_bikini", price: 150000, duration: 45 },

      { id: "armpits", nameKey: "services.armpits", price: 50000, duration: 20 },
      { id: "legs_to_knee", nameKey: "services.legs_to_knee", price: 100000, duration: 30 },
      { id: "full_legs", nameKey: "services.full_legs", price: 150000, duration: 60 },

      { id: "arms_to_elbow", nameKey: "services.arms_to_elbow", price: 60000, duration: 25 },
      { id: "full_arms", nameKey: "services.full_arms", price: 90000, duration: 40 },

      { id: "face_dep", nameKey: "services.face", price: 70000, duration: 30 },

      { id: "stomach", nameKey: "services.stomach", price: 60000, duration: 25 },
      { id: "back", nameKey: "services.back", price: 60000, duration: 30 },

      { id: "upper_lip", nameKey: "services.upper_lip", price: 30000, duration: 15 },
    ],
  },
]

export const getAllServices = (): ServiceItem[] => {
  return serviceCategories.flatMap((category) => category.services)
}

export const getServiceById = (id: string): ServiceItem | undefined => {
  return getAllServices().find((service) => service.id === id)
}