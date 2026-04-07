export const API = 'https://salad-dispatched-dry-gets.trycloudflare.com'

export async function fetchLeads() {
  const res = await fetch(`${API}/leads`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.leads
}

export async function patchLeadStatus(id, status) {
  const res = await fetch(`${API}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export async function deleteLead(id) {
  const res = await fetch(`${API}/leads/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export async function scrapeMaps({ categoria, cidade, bairro, quantidade }) {
  const res = await fetch(`${API}/scrape/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria, cidade, bairro, quantidade }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

// ── WhatsApp ──────────────────────────────────────────────
export async function waStatus() {
  const res = await fetch(`${API}/whatsapp/status`)
  return res.json()
}

export async function waConnect() {
  const res = await fetch(`${API}/whatsapp/connect`, { method: 'POST' })
  return res.json()
}

export async function waQRCode() {
  const res = await fetch(`${API}/whatsapp/qrcode`)
  return res.json()
}

export async function waDisconnect() {
  const res = await fetch(`${API}/whatsapp/disconnect`, { method: 'DELETE' })
  return res.json()
}

export async function waSend(numero, mensagem) {
  const res = await fetch(`${API}/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero, mensagem }),
  })
  return res.json()
}
