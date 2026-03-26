export const formatDate = (dateString) => {
  // UI-only formatter: "YYYY-MM-DD" -> "DD.MM.YYYY"
  // Never use locale-dependent formatting here.
  if (typeof dateString !== "string") return ""
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString

  const [yyyy, mm, dd] = dateString.split("-")
  return `${dd}.${mm}.${yyyy}`
}

