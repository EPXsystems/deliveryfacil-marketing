import { useState, useEffect } from 'react'
import { MapPin, Plus, X, Search, Phone, ChevronDown, Loader2, Star } from 'lucide-react'
import { fetchLeads, deleteLead, patchLeadStatus } from '../api'

const STATUSES = ['Todos', 'Captado', 'Contatado', 'Respondeu', 'Trial', 'Cliente', 'Perdido']

const STATUS_STYLE = {
  Captado:   'bg-blue-400/10 text-blue-400',
  Contatado: 'bg-yellow-400/10 text-yellow-400',
  Respondeu: 'bg-purple-400/10 text-purple-400',
  Trial:     'bg-[#FF6000]/10 text-[#FF6000]',
  Cliente:   'bg-emerald-400/10 text-emerald-400',
  Perdido:   'bg-[#1f1f1f] text-[#555]',
}

function formatDate(d) {
  if (!d) return ''
  const date = d.slice(0, 10)
  const [y, m, day] = date.split('-')
  return `${day}/${m}/${y}`
}

export default function Leads() {
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [search, setSearch]         = useState('')
  const [editingId, setEditingId]   = useState(null)

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = leads.filter(l => {
    const matchStatus = filterStatus === 'Todos' || l.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (l.nome     || '').toLowerCase().includes(q) ||
      (l.telefone || '').includes(q) ||
      (l.cidade   || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  async function handleDelete(id) {
    try {
      await deleteLead(id)
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await patchLeadStatus(id, status)
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      setEditingId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Lista de Leads</h1>
          <p className="text-[#555] text-sm mt-0.5">{filtered.length} de {leads.length} leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1f1f1f] flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#444] text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-[#111111] border border-[#1f1f1f] text-[#888] text-xs rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-[#FF6000]/50 cursor-pointer"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#FF6000]" />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                {['Nome', 'Cidade', 'Telefone', 'Avaliação', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[#444] text-xs font-semibold uppercase tracking-wider pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#333] text-sm">
                    {leads.length === 0
                      ? 'Nenhum lead ainda — capture na página de Captação'
                      : 'Nenhum lead com esses filtros'}
                  </td>
                </tr>
              )}
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-[#111111] hover:bg-[#111111] transition-colors group">
                  <td className="py-3 pr-4">
                    <div>
                      <span className="text-white text-sm font-medium">{lead.nome}</span>
                      {lead.categoria && (
                        <p className="text-[#444] text-xs mt-0.5 flex items-center gap-1">
                          <MapPin size={9} /> {lead.categoria}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#666] text-xs">{lead.cidade || '—'}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {lead.telefone ? (
                      <span className="text-[#666] text-xs font-mono flex items-center gap-1">
                        <Phone size={10} className="text-[#444]" />{lead.telefone}
                      </span>
                    ) : <span className="text-[#333] text-xs">—</span>}
                  </td>
                  <td className="py-3 pr-4">
                    {lead.avaliacao ? (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star size={10} className="fill-yellow-400" />{lead.avaliacao}
                      </span>
                    ) : <span className="text-[#333] text-xs">—</span>}
                  </td>
                  <td className="py-3 pr-4">
                    {editingId === lead.id ? (
                      <select
                        autoFocus
                        defaultValue={lead.status}
                        onBlur={() => setEditingId(null)}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className="bg-[#1a1a1a] border border-[#333] text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                      >
                        {STATUSES.filter(s => s !== 'Todos').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingId(lead.id)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLE[lead.status]}`}
                      >
                        {lead.status}
                      </button>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#555] text-xs">{formatDate(lead.criado_em)}</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#333] hover:text-red-400 transition-all p-1 rounded"
                      title="Remover lead"
                    >
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
