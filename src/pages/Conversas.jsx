import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Phone, Send, Search, WifiOff, Loader2, RefreshCw,
  Trash2, AlertTriangle, X, CheckCircle2, MessageSquare,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API, authFetch, waStatus, waSend } from '../api'

// ── Helpers ───────────────────────────────────────────────
function formatNumero(numero = '') {
  const num = numero.replace(/\D/g, '')
  if (num.startsWith('55') && num.length >= 12) {
    const ddd  = num.slice(2, 4)
    const rest = num.slice(4)
    return `(${ddd}) ${rest.length === 9 ? rest.slice(0, 5) + '-' + rest.slice(5) : rest.slice(0, 4) + '-' + rest.slice(4)}`
  }
  return num
}

function timeLabel(ts) {
  if (!ts) return ''
  const d   = new Date(ts)
  const now = new Date()
  if (d.getDate() === now.getDate() && (now - d) < 86400000)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if ((now - d) < 172800000) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ── Toast ─────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-in slide-in-from-bottom-4 ${
      type === 'success' ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300' : 'bg-red-900/90 border-red-500/40 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

// ── Modal de confirmação ───────────────────────────────────
function ConfirmModal({ title, body, confirmLabel = 'Confirmar', loading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base mb-1">{title}</h2>
            <p className="text-[#666] text-sm leading-relaxed">{body}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-[#888] text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function Conversas() {
  const navigate  = useNavigate()
  const pollRef   = useRef(null)
  const bottomRef = useRef(null)

  const [waPhase, setWaPhase]         = useState('loading')
  const [conversas, setConversas]     = useState([])
  const [ativa, setAtiva]             = useState(null)
  const [mensagens, setMensagens]     = useState([])
  const [input, setInput]             = useState('')
  const [search, setSearch]           = useState('')
  const [loadingConv, setLoadingConv] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending]         = useState(false)

  // Modal + Toast
  const [modal, setModal]             = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [toast, setToast]             = useState(null)

  function showToast(msg, type = 'success') { setToast({ msg, type }) }

  // ── WA status polling ────────────────────────────────────
  const checkWA = useCallback(async () => {
    try {
      const s = await waStatus()
      const connected = s.status === 'connected'
      setWaPhase(connected ? 'connected' : 'disconnected')
    } catch { setWaPhase('disconnected') }
  }, [])

  useEffect(() => {
    checkWA()
    const waTimer = setInterval(checkWA, 10000)
    return () => clearInterval(waTimer)
  }, [])

  // ── Auto-refresh: conversas a cada 5s, mensagens a cada 3s ──
  const ativaRef = useRef(null)
  useEffect(() => { ativaRef.current = ativa }, [ativa])

  useEffect(() => {
    if (waPhase !== 'connected') return
    loadConversas()
    const convTimer = setInterval(loadConversas, 5000)
    return () => clearInterval(convTimer)
  }, [waPhase])

  useEffect(() => {
    if (!ativa) return
    const msgTimer = setInterval(() => {
      if (ativaRef.current) loadMensagens(ativaRef.current.numero)
    }, 3000)
    return () => clearInterval(msgTimer)
  }, [ativa?.numero])

  // ── Carregar conversas do SQLite ─────────────────────────
  async function loadConversas() {
    setLoadingConv(true)
    try {
      const res  = await authFetch(`${API}/api/conversas`)
      const data = await res.json()
      setConversas(data.conversas || [])
    } catch (e) { console.error(e) }
    finally { setLoadingConv(false) }
  }

  // ── Carregar mensagens do SQLite ─────────────────────────
  async function loadMensagens(numero) {
    setLoadingMsgs(true)
    setMensagens([])
    try {
      const res  = await authFetch(`${API}/api/conversas/${encodeURIComponent(numero)}/mensagens`)
      const data = await res.json()
      setMensagens(data.mensagens || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) { console.error(e) }
    finally { setLoadingMsgs(false) }
  }

  function selectConv(conv) {
    setAtiva(conv)
    loadMensagens(conv.numero)
  }

  // ── Enviar mensagem (Evolution API) ──────────────────────
  async function enviar(e) {
    e.preventDefault()
    if (!input.trim() || !ativa || sending) return
    const texto = input.trim()
    setInput('')
    setSending(true)
    const fake = { id: 'local_' + Date.now(), role: 'assistant', conteudo: texto, criado_em: new Date().toISOString(), _fake: true }
    setMensagens(prev => [...prev, fake])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    try {
      await waSend(ativa.numero.replace(/\D/g, ''), texto)
      await loadMensagens(ativa.numero)
    } catch {
      setMensagens(prev => prev.filter(m => !m._fake))
      showToast('Erro ao enviar mensagem', 'error')
    }
    setSending(false)
  }

  // ── Limpar histórico de uma conversa ─────────────────────
  async function confirmarLimpar() {
    setModalLoading(true)
    try {
      await authFetch(`${API}/api/conversas/${encodeURIComponent(modal.numero)}`, { method: 'DELETE' })
      setConversas(prev => prev.filter(c => c.numero !== modal.numero))
      if (ativa?.numero === modal.numero) { setAtiva(null); setMensagens([]) }
      showToast(`Histórico de ${modal.nome} limpo`)
    } catch {
      showToast('Erro ao limpar histórico', 'error')
    }
    setModalLoading(false)
    setModal(null)
  }

  // ── Limpar todos ─────────────────────────────────────────
  async function confirmarLimparTodos() {
    setModalLoading(true)
    try {
      const res  = await authFetch(`${API}/api/conversas`, { method: 'DELETE' })
      const data = await res.json()
      setConversas([])
      setAtiva(null)
      setMensagens([])
      showToast(`${data.deletadas} conversas limpas`)
    } catch {
      showToast('Erro ao limpar conversas', 'error')
    }
    setModalLoading(false)
    setModal(null)
  }

  const filtradas = conversas.filter(c => {
    const q = search.toLowerCase()
    return !q ||
      (c.lead_nome || '').toLowerCase().includes(q) ||
      formatNumero(c.numero).includes(q)
  })

  // ── Estados ──────────────────────────────────────────────
  if (waPhase === 'loading') return (
    <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
      <Loader2 size={28} className="animate-spin text-[#FF6000]" />
    </div>
  )

  if (waPhase === 'disconnected') return (
    <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
        <div className="w-20 h-20 rounded-3xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
          <WifiOff size={36} className="text-[#444]" />
        </div>
        <div>
          <p className="text-white text-lg font-bold mb-2">WhatsApp não conectado</p>
          <p className="text-[#555] text-sm leading-relaxed">
            Conecte seu WhatsApp para visualizar e enviar mensagens para seus leads.
          </p>
        </div>
        <button
          onClick={() => navigate('/configuracoes')}
          className="flex items-center gap-2 bg-[#FF6000] hover:bg-[#E55500] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Conectar WhatsApp
        </button>
        <p className="text-[#333] text-xs">Verificando a cada 10 segundos...</p>
      </div>
    </div>
  )

  // ── Layout principal ──────────────────────────────────────
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* ── Coluna esquerda ── */}
        <div className="w-[350px] flex-shrink-0 border-r border-[#1f1f1f] flex flex-col bg-[#0D0D0D]">
          <div className="px-4 py-4 border-b border-[#1f1f1f]">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-white font-bold text-base">Conversas</h1>
              <div className="flex items-center gap-2">
                {conversas.length > 0 && (
                  <button
                    onClick={() => setModal({ type: 'all' })}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Limpar todas as conversas"
                  >
                    <Trash2 size={11} />
                    Limpar todas
                  </button>
                )}
                <button
                  onClick={loadConversas}
                  disabled={loadingConv}
                  className="text-[#444] hover:text-white transition-colors disabled:opacity-40 p-1"
                  title="Atualizar"
                >
                  <RefreshCw size={14} className={loadingConv ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
              <input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#333] text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loadingConv && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#FF6000]" />
              </div>
            )}
            {!loadingConv && filtradas.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                <MessageSquare size={24} className="text-[#222]" />
                <p className="text-[#333] text-sm">Nenhuma conversa ainda</p>
                <p className="text-[#222] text-xs text-center">As conversas do Thomas aparecem aqui quando leads respondem</p>
              </div>
            )}
            {filtradas.map(conv => {
              const nome    = conv.lead_nome || conv.contato_nome || formatNumero(conv.numero)
              const isAtiva = ativa?.numero === conv.numero
              return (
                <div
                  key={conv.numero}
                  className={`group relative border-b border-[#111111] transition-colors ${
                    isAtiva ? 'bg-[#FF6000]/8 border-l-2 border-l-[#FF6000]' : 'hover:bg-[#111111]'
                  }`}
                >
                  <button
                    onClick={() => selectConv(conv)}
                    className="w-full text-left px-4 py-3.5 pr-10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold border border-[#2a2a2a]">
                        {nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white text-xs font-semibold truncate pr-2">{nome}</span>
                          <span className="text-[#444] text-[10px] flex-shrink-0">{timeLabel(conv.ultima_hora)}</span>
                        </div>
                        <p className="text-[#555] text-[11px] truncate mb-1">
                          {conv.ultima_role === 'assistant' ? '🤖 ' : ''}{conv.ultima_msg || '...'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[#333] font-mono">{formatNumero(conv.numero)}</span>
                          <span className="text-[9px] text-[#222]">· {conv.total_msgs} msgs</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setModal({ type: 'single', numero: conv.numero, nome })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title={`Limpar histórico de ${nome}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Coluna direita ── */}
        {ativa ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0 bg-[#111111]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold border border-[#2a2a2a]">
                  {(ativa.lead_nome || ativa.contato_nome || formatNumero(ativa.numero)).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">
                    {ativa.lead_nome || ativa.contato_nome || formatNumero(ativa.numero)}
                  </p>
                  <span className="text-[#555] text-xs flex items-center gap-1">
                    <Phone size={10} /> {formatNumero(ativa.numero)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal({ type: 'single', numero: ativa.numero, nome: ativa.lead_nome || formatNumero(ativa.numero) })}
                  className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={12} /> Limpar
                </button>
                <button
                  onClick={() => loadMensagens(ativa.numero)}
                  className="text-[#444] hover:text-white transition-colors p-1"
                  title="Atualizar mensagens"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[#0D0D0D]">
              {loadingMsgs && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={22} className="animate-spin text-[#FF6000]" />
                </div>
              )}
              {!loadingMsgs && mensagens.map((msg, i) => {
                const fromMe  = msg.role === 'assistant'
                const hora    = msg.criado_em
                  ? new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : ''
                const agente  = msg.agente_ativo || 'THOMAS'
                const AGENTE_COR = {
                  THOMAS: '#FF6000', SOFIA: '#60a5fa', ANA: '#c084fc',
                  MAX: '#34d399', DOUGLAS: '#facc15',
                }
                const cor = AGENTE_COR[agente] || '#FF6000'
                return (
                  <div key={msg.id || i} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[68%] flex flex-col gap-0.5 ${fromMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        fromMe
                          ? 'text-white rounded-tr-sm'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] rounded-tl-sm'
                      }`} style={fromMe ? { backgroundColor: cor + 'e6' } : {}}>
                        {msg.conteudo}
                      </div>
                      <div className={`flex items-center gap-1.5 px-1 ${fromMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[#333] text-[10px]">{hora}</span>
                        {fromMe && (
                          <span className="text-[10px] font-semibold" style={{ color: cor }}>
                            {agente.charAt(0) + agente.slice(1).toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-[#1f1f1f] bg-[#111111] flex-shrink-0">
              <form onSubmit={enviar} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF6000]/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-[#FF6000] hover:bg-[#E55500] disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0D0D] gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#1f1f1f] flex items-center justify-center">
              <MessageSquare size={24} className="text-[#333]" />
            </div>
            <p className="text-[#333] text-sm">Selecione uma conversa para ver o histórico</p>
          </div>
        )}
      </div>

      {/* ── Modais ── */}
      {modal?.type === 'single' && (
        <ConfirmModal
          title="Limpar histórico"
          body={`Apagar todo o histórico da conversa com "${modal.nome}" do banco de dados? O Thomas vai começar do zero com esse lead.`}
          confirmLabel="Limpar histórico"
          loading={modalLoading}
          onConfirm={confirmarLimpar}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'all' && (
        <ConfirmModal
          title="Limpar todas as conversas"
          body={`Apagar o histórico de TODAS as ${conversas.length} conversas do banco? Esta ação não pode ser desfeita.`}
          confirmLabel={`Limpar todas (${conversas.length})`}
          loading={modalLoading}
          onConfirm={confirmarLimparTodos}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
