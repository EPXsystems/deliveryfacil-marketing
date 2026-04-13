import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronRight, Phone, Calendar, Loader2, Zap } from 'lucide-react'
import { API, authFetch, patchLeadStatus } from '../api'

const COLUMNS = ['Captado', 'Contatado', 'Respondeu', 'Trial', 'Cliente', 'Sem WA', 'Perdido']

const NEXT_STATUS = {
  Captado:   'Contatado',
  Contatado: 'Respondeu',
  Respondeu: 'Trial',
  Trial:     'Cliente',
  Cliente:   null,
  'Sem WA':  null,
  Perdido:   null,
}

const COLUMN_STYLE = {
  Captado:   { dot: 'bg-blue-400',    border: 'border-blue-400/25',    badge: 'bg-blue-400/10 text-blue-400' },
  Contatado: { dot: 'bg-yellow-400',  border: 'border-yellow-400/25',  badge: 'bg-yellow-400/10 text-yellow-400' },
  Respondeu: { dot: 'bg-purple-400',  border: 'border-purple-400/25',  badge: 'bg-purple-400/10 text-purple-400' },
  Trial:     { dot: 'bg-[#FF6000]',   border: 'border-[#FF6000]/25',   badge: 'bg-[#FF6000]/10 text-[#FF6000]' },
  Cliente:   { dot: 'bg-emerald-400', border: 'border-emerald-400/25', badge: 'bg-emerald-400/10 text-emerald-400' },
  'Sem WA':  { dot: 'bg-rose-400',    border: 'border-rose-400/25',    badge: 'bg-rose-400/10 text-rose-400' },
  Perdido:   { dot: 'bg-[#555]',      border: 'border-[#2a2a2a]',      badge: 'bg-[#1f1f1f] text-[#555]' },
}

function formatDate(d) {
  if (!d) return ''
  const date = d.slice(0, 10)
  const [y, m, day] = date.split('-')
  return `${day}/${m}/${y}`
}

function LeadCard({ lead, onMove, onLose, sdrAtual }) {
  const next       = NEXT_STATUS[lead.status]
  const emDisparo  = sdrAtual && lead.nome === sdrAtual

  return (
    <div className={`bg-[#111111] border rounded-xl p-4 transition-all ${
      emDisparo
        ? 'border-[#FF6000]/60 shadow-[0_0_12px_rgba(255,96,0,0.15)] animate-pulse-subtle'
        : 'border-[#1f1f1f] hover:border-[#2a2a2a]'
    }`}>
      {emDisparo && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6000] animate-ping" />
          <span className="text-[#FF6000] text-[10px] font-semibold">SDR disparando agora...</span>
        </div>
      )}

      <p className="text-white text-sm font-semibold leading-tight mb-2">{lead.nome}</p>

      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mb-3 bg-blue-400/10 text-blue-400">
        <MapPin size={10} />
        {lead.fonte || lead.categoria || 'Google Maps'}
      </span>

      <div className="space-y-1.5 mb-4">
        {lead.telefone && (
          <div className="flex items-center gap-1.5 text-[#555] text-xs">
            <Phone size={10} />
            <span>{lead.telefone}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[#555] text-xs">
          <Calendar size={10} />
          <span>{formatDate(lead.criado_em)}</span>
        </div>
      </div>

      {next && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onMove(lead.id, next)}
            className="w-full flex items-center justify-center gap-1 bg-[#FF6000]/10 hover:bg-[#FF6000]/20 text-[#FF6000] text-xs font-semibold py-2 rounded-lg transition-colors"
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
  const [byCol, setByCol]       = useState(COLUMNS.reduce((a, c) => ({ ...a, [c]: [] }), {}))
  const [loading, setLoading]   = useState(true)
  const [sdrStatus, setSdrStatus] = useState({ rodando: false, lead_atual: null, total: 0, enviados: 0 })
  const wasRunning = useRef(false)

  async function fetchPipeline() {
    try {
      const res  = await authFetch(`${API}/api/pipeline`)
      const data = await res.json()
      if (data.success) setByCol(data.pipeline)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function pollSdrStatus() {
    try {
      const res  = await authFetch(`${API}/api/sdr/status`)
      const data = await res.json()
      if (data.success) {
        setSdrStatus({ rodando: data.rodando, lead_atual: data.lead_atual, total: data.total, enviados: data.enviados })
        // Quando SDR termina, atualiza o pipeline para refletir mudanças de status
        if (wasRunning.current && !data.rodando) fetchPipeline()
        wasRunning.current = data.rodando
      }
    } catch {}
  }

  useEffect(() => {
    fetchPipeline()
    pollSdrStatus()

    // Polling: pipeline a cada 8s, SDR status a cada 3s
    const timerPipeline = setInterval(fetchPipeline, 8000)
    const timerSdr      = setInterval(pollSdrStatus, 3000)
    return () => { clearInterval(timerPipeline); clearInterval(timerSdr) }
  }, [])

  async function moveToNext(id, nextStatus) {
    try {
      await patchLeadStatus(id, nextStatus)
      setByCol(prev => {
        const next = { ...prev }
        for (const col of COLUMNS) {
          const lead = next[col]?.find(l => l.id === id)
          if (lead) {
            next[col] = next[col].filter(l => l.id !== id)
            next[nextStatus] = [{ ...lead, status: nextStatus }, ...(next[nextStatus] || [])]
            break
          }
        }
        return next
      })
    } catch (err) { console.error(err) }
  }

  async function moveToPerdido(id) {
    try {
      await patchLeadStatus(id, 'Perdido')
      setByCol(prev => {
        const next = { ...prev }
        for (const col of COLUMNS) {
          const lead = next[col]?.find(l => l.id === id)
          if (lead) {
            next[col] = next[col].filter(l => l.id !== id)
            next['Perdido'] = [{ ...lead, status: 'Perdido' }, ...(next['Perdido'] || [])]
            break
          }
        }
        return next
      })
    } catch (err) { console.error(err) }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline de Leads</h1>
          <p className="text-[#555] text-sm mt-0.5">
            {COLUMNS.filter(c => c !== 'Perdido').reduce((s, c) => s + (byCol[c]?.length || 0), 0)} leads ativos no funil
          </p>
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

      {/* Banner SDR em execução */}
      {sdrStatus.rodando && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-[#FF6000]/10 border-b border-[#FF6000]/20 flex-shrink-0">
          <Zap size={14} className="text-[#FF6000] animate-pulse flex-shrink-0" />
          <span className="text-[#FF6000] text-xs font-semibold">
            SDR em execução
            {sdrStatus.lead_atual ? ` — disparando para "${sdrStatus.lead_atual}"` : ' — preparando disparos...'}
          </span>
          {sdrStatus.total > 0 && (
            <span className="ml-auto text-[#FF6000]/60 text-xs font-mono">
              {sdrStatus.enviados}/{sdrStatus.total}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={28} className="animate-spin text-[#FF6000]" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full">
            {COLUMNS.map(col => {
              const s = COLUMN_STYLE[col]
              return (
                <div key={col} className="w-56 flex-shrink-0 flex flex-col">
                  <div className={`flex items-center justify-between mb-3 pb-2.5 border-b ${s.border}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-white text-xs font-semibold">{col}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                      {byCol[col].length}
                    </span>
                  </div>

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
                        sdrAtual={sdrStatus.rodando ? sdrStatus.lead_atual : null}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
