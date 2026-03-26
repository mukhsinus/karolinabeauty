const MAX_STACK = 25

export const NAV_CB = {
  BACK: "crm_nav:back"
}

export const ensureNav = (ctx) => {
  if (!ctx.session) ctx.session = {}
  if (!ctx.session.payload) ctx.session.payload = {}
  if (!ctx.session.payload.nav) ctx.session.payload.nav = { stack: [] }
  if (!Array.isArray(ctx.session.payload.nav.stack)) ctx.session.payload.nav.stack = []
}

export const resetNav = (ctx) => {
  ensureNav(ctx)
  ctx.session.payload.nav.stack = []
}

export const pushNav = (ctx, entry) => {
  ensureNav(ctx)
  const safe = entry && typeof entry === "object" ? entry : null
  if (!safe || typeof safe.flow !== "string" || typeof safe.step !== "string") return

  const stack = ctx.session.payload.nav.stack
  const last = stack[stack.length - 1]
  // Avoid duplicates when re-rendering same screen
  if (last && last.flow === safe.flow && last.step === safe.step) {
    const lastParams = JSON.stringify(last.params || {})
    const newParams = JSON.stringify(safe.params || {})
    if (lastParams === newParams) return
  }

  stack.push({
    flow: safe.flow,
    step: safe.step,
    params: safe.params || {}
  })

  if (stack.length > MAX_STACK) {
    ctx.session.payload.nav.stack = stack.slice(stack.length - MAX_STACK)
  }
}

export const popNav = (ctx) => {
  ensureNav(ctx)
  return ctx.session.payload.nav.stack.pop()
}

export const peekNav = (ctx) => {
  ensureNav(ctx)
  const stack = ctx.session.payload.nav.stack
  return stack.length ? stack[stack.length - 1] : null
}

