const KEY = 'cart_session_id'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSessionId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = uuid()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function resetSessionId() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}