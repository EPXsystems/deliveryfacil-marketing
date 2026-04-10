import { useState, useEffect, useCallback, useRef } from 'react'
import { Bot, MessageSquare, Loader2, Code, X, ChevronRight, User, Cpu } from 'lucide-react'
import { API, authFetch } from '../api'
import { SYSTEM_PROMPT as THOMAS_PROMPT    } from '../data/agents/thomas'
import { SOFIA_PROMPT                       } from '../data/agents/sofia'
import { ANA_PROMPT                         } from '../data/agents/ana'
import { MAX_PROMPT                          } from '../data/agents/max'
import { DOUGLAS_PROMPT                     } from '../data/agents/douglas'

const AGENTES_DEF = [
  { nome: 'THOMAS',  label: 'Thomas',  papel: 'SDR + Closer', cor: '#FF6000', prompt: THOMAS_PROMPT  },
  { nome: 'SOFIA',   label: 'Sofia',   papel: 'Suporte',      cor: '#60a5fa', prompt: SOFIA_PROMPT   },
  { nome: 'ANA',     label: 'Ana',     papel: 'Reativação',   cor: '#c084fc', prompt: ANA_PROMPT     },
  { nome: 'MAX',     label: 'Max',     papel: 'Onboarding',   cor: '#34d399', prompt: MAX_PROMPT     },
  { nome: 'DOUGLAS', label: 'Douglas', papel: 'Financeiro',   cor: '#facc15', prompt: DOUGLAS_PROMPT },
]

// ── Toggle ────────────────────────────────────────────────
function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-[#FF6000]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute w-6 h-6 top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return `${Math.round(diff)}s`
  if (diff < 3600) return `${Math.round(diff / 60)}min`
  return `${Math.round(diff / 3600)}h`
}

function formatHora(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

// ── Visualizador de Conversa ───────────────────────────────
function ConversaModal({ numero, agente, onClose }) {
  const [msgs, setMsgs] = useState([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    authFetch(`${API}/api/conversas/${encodeURIComponent(numero)}/mensagens`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setMsgs(d.mensagens || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [numero])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[480px] sm:max-w-lg bg-[#111] border border-[#222] rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] flex-shrink-0">
          <div>
            <p className="text-white text-sm font-bold font-mono">{numero}</p>
            <p className="text-[#555] text-xs mt-0.5">Agente: <span style={{ color: AGENTES_DEF.find(a => a.nome === agente)?.cor || '#888' }}>{agente}</span></p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-[#FF6000]" />
            </div>
          ) : msgs.length === 0 ? (
            <p className="text-[#444] text-xs text-center py-10">Nenhuma mensagem no histórico</p>
          ) : (
            msgs.map((m, i) => {
              const isUser = m.role === 'user'
              // Split pipe-separated agent blocks into separate bubbles
              const blocos = isUser
                ? [m.conteudo]
                : m.conteudo.split(' | ').filter(Boolean)
              return (
                <div key={i} className={`flex flex-col gap-1 ${isUser ? 'items-start' : 'items-end'}`}>
                  {blocos.map((bloco, bi) => (
                    <div
                      key={bi}
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#1a1a1a] text-[#ccc] rounded-tl-sm'
                          : 'bg-[#FF6000] text-white rounded-tr-sm'
                      }`}
                    >
                      {bloco}
                    </div>
                  ))}
                  <div className={`flex items-center gap-1 ${isUser ? 'pl-1' : 'pr-1'}`}>
                    {isUser
                      ? <User size={9} className="text-[#333]" />
                      : <Cpu size={9} className="text-[#333]" />
                    }
                    <span className="text-[#333] text-[9px]">{formatHora(m.criado_em)}</span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}

export default function Agentes() {
  const [selected, setSelected]         = useState('THOMAS')
  const [statuses, setStatuses]         = useState({})
  const [conversas, setConversas]       = useState([])
  const [loadingConversas, setLoadingConversas] = useState(false)
  const [toggling, setToggling]         = useState(false)
  const [viewConversa, setViewConversa] = useState(null) // { numero, agente }

  const agente = AGENTES_DEF.find(a => a.nome === selected)

  // Carrega status de todos os agentes
  useEffect(() => {
    AGENTES_DEF.forEach(a => {
      authFetch(`${API}/api/agents/${a.nome}/status`)
        .then(r => r.json())
        .then(d => { if (d.success) setStatuses(prev => ({ ...prev, [a.nome]: d })) })
        .catch(() => {})
    })
  }, [])

  const fetchConversas = useCallback(async () => {
    if (!selected) return
    setLoadingConversas(true)
    try {
      const r = await authFetch(`${API}/api/agents/${selected}/conversas`)
      const d = await r.json()
      if (d.success) setConversas(d.conversas)
    } catch {}
    setLoadingConversas(false)
  }, [selected])

  useEffect(() => {
    setConversas([])
    fetchConversas()
    const id = setInterval(fetchConversas, 5000)
    return () => clearInterval(id)
  }, [fetchConversas])

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    try {
      const r = await authFetch(`${API}/api/agents/${selected}/toggle`, { method: 'PATCH' })
      const d = await r.json()
      if (d.success) setStatuses(prev => ({ ...prev, [selected]: { ...prev[selected], ativo: d.ativo } }))
    } catch {}
    setToggling(false)
  }

  const status = statuses[selected]
  const ativo  = status?.ativo !== false

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Modal visualizador */}
      {viewConversa && (
        <ConversaModal
          numero={viewConversa.numero}
          agente={viewConversa.agente}
          onClose={() => setViewConversa(null)}
        />
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot size={20} className="text-[#FF6000]" /> Agentes
        </h1>
        <p className="text-[#555] text-sm mt-0.5">Multi-agente SDR — gestão e monitoramento</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-6 pt-0 flex-shrink-0 border-b border-[#1f1f1f]">
        {AGENTES_DEF.map(a => {
          const s    = statuses[a.nome]
          const isAt = s?.ativo !== false
          return (
            <button
              key={a.nome}
              onClick={() => setSelected(a.nome)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                selected === a.nome
                  ? 'border-[#FF6000] text-white'
                  : 'border-transparent text-[#555] hover:text-[#888]'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isAt ? '#34d399' : '#555' }} />
              {a.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* Status + Toggle */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: ativo ? '#34d399' : '#555' }} />
              <h2 className="text-white text-lg font-bold">{agente.label}</h2>
              <span className="text-[#555] text-sm">— {agente.papel}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                ativo
                  ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#555]'
              }`}>
                {ativo ? 'Ativo' : 'Pausado'}
              </span>
            </div>
            <p className="text-[#555] text-xs pl-5">{status?.conversas_hoje ?? 0} conversas hoje</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#555] text-sm font-medium">{ativo ? 'LIGADO' : 'DESLIGADO'}</span>
            <Toggle active={ativo} onChange={handleToggle} />
          </div>
        </div>

        {/* Conversas ativas */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <MessageSquare size={14} className="text-[#FF6000]" />
              Conversas ativas <span className="text-[#444] font-normal text-xs">(últimas 2h)</span>
            </h3>
            {loadingConversas && <Loader2 size={13} className="animate-spin text-[#444]" />}
          </div>
          {conversas.length === 0 ? (
            <p className="text-[#444] text-xs text-center py-6">
              {loadingConversas ? 'Carregando...' : 'Nenhuma conversa ativa nas últimas 2 horas'}
            </p>
          ) : (
            <div className="space-y-2">
              {conversas.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setViewConversa({ numero: c.numero, agente: selected })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0D0D0D] hover:bg-[#151515] hover:border-[#FF6000]/20 border border-transparent transition-all text-left group"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-mono truncate">{c.numero}</p>
                    {c.ultimo_conteudo && (
                      <p className="text-[#555] text-[10px] truncate mt-0.5">{c.ultimo_conteudo}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#444] text-[10px]">{timeAgo(c.ultima_msg)} atrás</p>
                    <p className="text-[#333] text-[10px]">{c.total_msgs} msgs</p>
                  </div>
                  <ChevronRight size={12} className="text-[#333] group-hover:text-[#FF6000] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System Prompt */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
            <Code size={14} className="text-[#FF6000]" /> System Prompt
            <span className="text-[#444] font-normal text-xs">— somente leitura</span>
          </h3>
          {agente.prompt ? (
            <textarea
              readOnly
              value={agente.prompt}
              rows={14}
              className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-[#888] text-xs font-mono rounded-lg p-4 resize-none focus:outline-none leading-relaxed"
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-[#444] text-xs">Prompt ainda não configurado para este agente</p>
              <p className="text-[#333] text-[10px] mt-1">
                Edite <span className="font-mono">src/data/agents/{agente.nome.toLowerCase()}.js</span>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
