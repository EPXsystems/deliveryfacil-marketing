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

export async function scrapeMaps({ categoria, cidade, quantidade }) {
  const res = await fetch(`${API}/scrape/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria, cidade, quantidade }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}
