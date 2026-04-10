export const API = 'https://amp-bristol-lucy-mills.trycloudflare.com'

// ── Auth helpers ──────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('token')
}

export async function authFetch(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }
  return res
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
  return data
}

// ── Leads ─────────────────────────────────────────────────
export async function fetchLeads() {
  const res = await authFetch(`${API}/leads`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.leads
}

export async function patchLeadStatus(id, status) {
  const res = await authFetch(`${API}/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export async function deleteLead(id) {
  const res = await authFetch(`${API}/leads/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export async function scrapeMaps({ categoria, cidade, bairro, quantidade }) {
  const res = await authFetch(`${API}/scrape/maps`, {
    method: 'POST',
    body: JSON.stringify({ categoria, cidade, bairro, quantidade }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

// ── WhatsApp ──────────────────────────────────────────────
export async function waStatus() {
  const res = await authFetch(`${API}/whatsapp/status`)
  return res.json()
}

export async function waConnect() {
  const res = await authFetch(`${API}/whatsapp/connect`, { method: 'POST' })
  return res.json()
}

export async function waQRCode() {
  const res = await authFetch(`${API}/whatsapp/qrcode`)
  return res.json()
}

export async function waDisconnect() {
  const res = await authFetch(`${API}/whatsapp/disconnect`, { method: 'DELETE' })
  return res.json()
}

export async function waSend(numero, mensagem) {
  const res = await authFetch(`${API}/whatsapp/send`, {
    method: 'POST',
    body: JSON.stringify({ numero, mensagem }),
  })
  return res.json()
}
