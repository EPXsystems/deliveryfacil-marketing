import { useState } from 'react'
import { MapPin, Hash, UtensilsCrossed, Plus, X, Search, Phone, ChevronDown } from 'lucide-react'
import { pipelineLeads } from '../data/mockData'

const SOURCES = ['Todos', 'Google Maps', 'Instagram', 'iFood']
const STATUSES = ['Todos', 'Captado', 'Contatado', 'Respondeu', 'Trial', 'Cliente', 'Perdido']

const STATUS_STYLE = {
  Captado:   'bg-blue-400/10 text-blue-400',
  Contatado: 'bg-yellow-400/10 text-yellow-400',
  Respondeu: 'bg-purple-400/10 text-purple-400',
  Trial:     'bg-[#FF4D1C]/10 text-[#FF4D1C]',
  Cliente:   'bg-emerald-400/10 text-emerald-400',
  Perdido:   'bg-[#1f1f1f] text-[#555]',
}

const SOURCE_STYLE = {
  'Google Maps': 'text-blue-400 bg-blue-400/10',
  'Instagram':   'text-pink-400 bg-pink-400/10',
  'iFood':       'text-[#FF4D1C] bg-[#FF4D1C]/10',
}

function SourceIcon({ source, size = 11 }) {
  if (source === 'Google Maps') return <MapPin size={size} />
  if (source === 'Instagram')   return <Hash size={size} />
  return <UtensilsCrossed size={size} />
}

function formatDate(d) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const emptyForm = { name: '', source: 'Google Maps', phone: '', status: 'Captado', date: '' }

export default function Leads() {
  const [leads, setLeads] = useState(pipelineLeads)
  const [filterSource, setFilterSource] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [search, setSearch]             = useState('')
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(emptyForm)

  const filtered = leads.filter(l => {
    const matchSource = filterSource === 'Todos' || l.source === filterSource
    const matchStatus = filterStatus === 'Todos' || l.status === filterStatus
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.phone.includes(search)
    return matchSource && matchStatus && matchSearch
  })

  function handleAdd(e) {
    e.preventDefault()
    const newLead = {
      ...form,
      id: Date.now(),
      date: form.date || new Date().toISOString().split('T')[0],
    }
    setLeads(prev => [newLead, ...prev])
    setForm(emptyForm)
    setShowModal(false)
  }

  function handleDelete(id) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Lista de Leads</h1>
          <p className="text-[#555] text-sm mt-0.5">{filtered.length} de {leads.length} leads</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Adicionar Lead
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1f1f1f] flex items-center gap-3 flex-shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#444] text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
          />
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1">
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterSource === s
                  ? 'bg-[#FF4D1C] text-white'
                  : 'bg-[#111111] border border-[#1f1f1f] text-[#666] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-[#111111] border border-[#1f1f1f] text-[#888] text-xs rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-[#FF4D1C]/50 cursor-pointer"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f1f]">
              {['Nome', 'Fonte', 'Telefone', 'Status', 'Data', 'Ações'].map(h => (
                <th key={h} className="text-left text-[#444] text-xs font-semibold uppercase tracking-wider pb-3 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#333] text-sm">
                  Nenhum lead encontrado com esses filtros.
                </td>
              </tr>
            )}
            {filtered.map(lead => (
              <tr
                key={lead.id}
                className="border-b border-[#111111] hover:bg-[#111111] transition-colors group"
              >
                <td className="py-3 pr-4">
                  <span className="text-white text-sm font-medium">{lead.name}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_STYLE[lead.source]}`}>
                    <SourceIcon source={lead.source} />
                    {lead.source}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-[#666] text-xs font-mono">{lead.phone}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-[#555] text-xs">{formatDate(lead.date)}</span>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-base">Novo Lead</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#555] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-[#666] text-xs font-medium block mb-1.5">Nome do Restaurante *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Pizzaria São Paulo"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Fonte</label>
                  <select
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50"
                  >
                    <option>Google Maps</option>
                    <option>Instagram</option>
                    <option>iFood</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50"
                  >
                    {STATUSES.filter(s => s !== 'Todos').map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#666] text-xs font-medium block mb-1.5">Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 99999-0000"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50"
                />
              </div>

              <div>
                <label className="text-[#666] text-xs font-medium block mb-1.5">Data de Entrada</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50 [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-[#888] text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
