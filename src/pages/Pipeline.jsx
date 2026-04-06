import { useState } from 'react'
import { MapPin, Hash, ChevronRight, Phone, Calendar, UtensilsCrossed } from 'lucide-react'
import { pipelineLeads } from '../data/mockData'

const COLUMNS = ['Captado', 'Contatado', 'Respondeu', 'Trial', 'Cliente', 'Perdido']

const NEXT_STATUS = {
  Captado: 'Contatado',
  Contatado: 'Respondeu',
  Respondeu: 'Trial',
  Trial: 'Cliente',
  Cliente: null,
  Perdido: null,
}

const COLUMN_STYLE = {
  Captado:   { dot: 'bg-blue-400',    border: 'border-blue-400/25',    badge: 'bg-blue-400/10 text-blue-400' },
  Contatado: { dot: 'bg-yellow-400',  border: 'border-yellow-400/25',  badge: 'bg-yellow-400/10 text-yellow-400' },
  Respondeu: { dot: 'bg-purple-400',  border: 'border-purple-400/25',  badge: 'bg-purple-400/10 text-purple-400' },
  Trial:     { dot: 'bg-[#FF4D1C]',   border: 'border-[#FF4D1C]/25',   badge: 'bg-[#FF4D1C]/10 text-[#FF4D1C]' },
  Cliente:   { dot: 'bg-emerald-400', border: 'border-emerald-400/25', badge: 'bg-emerald-400/10 text-emerald-400' },
  Perdido:   { dot: 'bg-[#555]',      border: 'border-[#2a2a2a]',      badge: 'bg-[#1f1f1f] text-[#555]' },
}

const SOURCE_STYLE = {
  'Google Maps': 'text-blue-400 bg-blue-400/10',
  'Instagram':   'text-pink-400 bg-pink-400/10',
  'iFood':       'text-[#FF4D1C] bg-[#FF4D1C]/10',
}

function SourceIcon({ source }) {
  if (source === 'Google Maps') return <MapPin size={10} />
  if (source === 'Instagram')   return <Hash size={10} />
  return <UtensilsCrossed size={10} />
}

function formatDate(d) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function LeadCard({ lead, onMove, onLose }) {
  const next = NEXT_STATUS[lead.status]
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors group">
      <p className="text-white text-sm font-semibold leading-tight mb-2">{lead.name}</p>

      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mb-3 ${SOURCE_STYLE[lead.source]}`}>
        <SourceIcon source={lead.source} />
        {lead.source}
      </span>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-[#555] text-xs">
          <Phone size={10} />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#555] text-xs">
          <Calendar size={10} />
          <span>{formatDate(lead.date)}</span>
        </div>
      </div>

      {next && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMove(lead.id)}
            className="w-full flex items-center justify-center gap-1 bg-[#FF4D1C]/10 hover:bg-[#FF4D1C]/20 text-[#FF4D1C] text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            <ChevronRight size={12} />
            Mover para {next}
          </button>
          <button
            onClick={() => onLose(lead.id)}
            className="w-full text-[#3a3a3a] hover:text-[#666] text-xs py-1 transition-colors"
          >
            Marcar como perdido
          </button>
        </div>
      )}
    </div>
  )
}

export default function Pipeline() {
  const [leads, setLeads] = useState(pipelineLeads)

  function moveToNext(id) {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      const next = NEXT_STATUS[l.status]
      return next ? { ...l, status: next } : l
    }))
  }

  function moveToPerdido(id) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'Perdido' } : l))
  }

  const byCol = COLUMNS.reduce((acc, col) => {
    acc[col] = leads.filter(l => l.status === col)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline de Leads</h1>
          <p className="text-[#555] text-sm mt-0.5">{leads.filter(l => l.status !== 'Perdido').length} leads ativos no funil</p>
        </div>
        <div className="flex items-center gap-3">
          {COLUMNS.map(col => (
            <div key={col} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${COLUMN_STYLE[col].dot}`} />
              <span className="text-[#555] text-xs">{byCol[col].length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-4 h-full">
          {COLUMNS.map(col => {
            const s = COLUMN_STYLE[col]
            return (
              <div key={col} className="w-56 flex-shrink-0 flex flex-col">
                {/* Column header */}
                <div className={`flex items-center justify-between mb-3 pb-2.5 border-b ${s.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-white text-xs font-semibold">{col}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                    {byCol[col].length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">
                  {byCol[col].length === 0 && (
                    <div className="border border-dashed border-[#1f1f1f] rounded-xl py-8 flex items-center justify-center">
                      <p className="text-[#333] text-xs">Vazio</p>
                    </div>
                  )}
                  {byCol[col].map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onMove={moveToNext}
                      onLose={moveToPerdido}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
