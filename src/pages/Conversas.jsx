import { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, UserCheck, Send, Bot, User, Search, WifiOff, Loader2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API, waStatus, waSend } from '../api'

// ── Helpers ───────────────────────────────────────────────
function extractText(msg) {
  if (!msg) return ''
  const m = msg.message || {}
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.templateMessage?.hydratedFourRowTemplate?.hydratedContentText ||
    m.buttonsMessage?.contentText ||
    m.listMessage?.description ||
    '[mídia]'
  )
}

function formatJid(jid = '') {
  const num = jid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@c.us', '')
  if (num.startsWith('55') && num.length >= 12) {
    const ddd = num.slice(2, 4)
    const rest = num.slice(4)
    return `(${ddd}) ${rest.length === 9 ? rest.slice(0, 5) + '-' + rest.slice(5) : rest.slice(0, 4) + '-' + rest.slice(4)}`
  }
  return num
}

function timeLabel(ts) {
  if (!ts) return ''
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 86400 && d.getDate() === now.getDate())
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ── Main ──────────────────────────────────────────────────
export default function Conversas() {
  const navigate = useNavigate()
  const pollRef  = useRef(null)
  const bottomRef = useRef(null)

  const [waPhase, setWaPhase]   = useState('loading')
  const [chats, setChats]       = useState([])
  const [ativa, setAtiva]       = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [input, setInput]       = useState('')
  const [search, setSearch]     = useState('')
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMsgs, setLoadingMsgs]   = useState(false)
  const [sending, setSending]   = useState(false)

  // Verifica status WA
  const checkWA = useCallback(async () => {
    try {
      const s = await waStatus()
      const connected = s.status === 'connected'
      setWaPhase(connected ? 'connected' : 'disconnected')
      if (connected && chats.length === 0) loadChats()
    } catch { setWaPhase('disconnected') }
  }, [chats.length])

  useEffect(() => {
    checkWA()
    pollRef.current = setInterval(checkWA, 10000)
    return () => clearInterval(pollRef.current)
  }, [])

  async function loadChats() {
    setLoadingChats(true)
    try {
      const res  = await fetch(`${API}/whatsapp/chats`)
      const data = await res.json()
      setChats(data.chats || [])
    } catch (e) { console.error(e) }
    finally { setLoadingChats(false) }
  }

  async function loadMensagens(jid) {
    setLoadingMsgs(true)
    setMensagens([])
    try {
      const res  = await fetch(`${API}/whatsapp/messages/${encodeURIComponent(jid)}`)
      const data = await res.json()
      const msgs = (data.messages || []).sort((a, b) => a.messageTimestamp - b.messageTimestamp)
      setMensagens(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) { console.error(e) }
    finally { setLoadingMsgs(false) }
  }

  function selectChat(chat) {
    setAtiva(chat)
    loadMensagens(chat.remoteJid)
  }

  async function enviar(e) {
    e.preventDefault()
    if (!input.trim() || !ativa || sending) return
    const texto = input.trim()
    setInput('')
    setSending(true)
    // Otimista — adiciona mensagem antes da confirmação
    const fake = { key: { fromMe: true, id: 'local_' + Date.now() }, messageTimestamp: Date.now() / 1000, _fake: true, message: { conversation: texto } }
    setMensagens(prev => [...prev, fake])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    try {
      await waSend(formatJid(ativa.remoteJid).replace(/\D/g, ''), texto)
      // Recarrega mensagens para pegar o id real
      await loadMensagens(ativa.remoteJid)
    } catch (e) {
      console.error(e)
      setMensagens(prev => prev.filter(m => !m._fake))
    }
    setSending(false)
  }

  const filtrados = chats.filter(c => {
    const q = search.toLowerCase()
    return !q ||
      (c.pushName || '').toLowerCase().includes(q) ||
      formatJid(c.remoteJid).includes(q)
  })

  // ── Estados de carregamento / desconectado ────────────────
  if (waPhase === 'loading') return (
    <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
      <Loader2 size={28} className="animate-spin text-[#FF4D1C]" />
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
            Conecte seu WhatsApp para visualizar e gerenciar suas conversas com leads.
          </p>
        </div>
        <button
          onClick={() => navigate('/configuracoes')}
          className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Conectar WhatsApp
        </button>
        <p className="text-[#333] text-xs">Verificando a cada 10 segundos...</p>
      </div>
    </div>
  )

  // ── Layout principal ──────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Coluna esquerda ── */}
      <div className="w-[350px] flex-shrink-0 border-r border-[#1f1f1f] flex flex-col bg-[#0D0D0D]">
        <div className="px-4 py-4 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white font-bold text-base">Conversas</h1>
            <button
              onClick={loadChats}
              disabled={loadingChats}
              className="text-[#444] hover:text-white transition-colors disabled:opacity-40"
              title="Atualizar"
            >
              <RefreshCw size={14} className={loadingChats ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#333] text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingChats && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#FF4D1C]" />
            </div>
          )}
          {!loadingChats && filtrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-[#333] text-sm">Nenhuma conversa encontrada</p>
            </div>
          )}
          {filtrados.map(chat => {
            const nome      = chat.pushName || formatJid(chat.remoteJid)
            const ultimaTxt = extractText(chat.lastMessage)
            const hora      = chat.lastMessage?.messageTimestamp
              ? timeLabel(chat.lastMessage.messageTimestamp)
              : timeLabel(chat.updatedAt)
            const isAtiva   = ativa?.remoteJid === chat.remoteJid

            return (
              <button
                key={chat.remoteJid}
                onClick={() => selectChat(chat)}
                className={`w-full text-left px-4 py-3.5 border-b border-[#111111] transition-colors ${
                  isAtiva ? 'bg-[#FF4D1C]/8 border-l-2 border-l-[#FF4D1C]' : 'hover:bg-[#111111]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold">
                    {chat.profilePicUrl
                      ? <img src={chat.profilePicUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                      : nome.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white text-xs font-semibold truncate pr-2">{nome}</span>
                      <span className="text-[#444] text-[10px] flex-shrink-0">{hora}</span>
                    </div>
                    <p className="text-[#555] text-[11px] truncate mb-1">{ultimaTxt || '...'}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-[#333] font-mono">{formatJid(chat.remoteJid)}</span>
                      {(chat.unreadCount > 0) && (
                        <span className="w-4 h-4 rounded-full bg-[#FF4D1C] text-white text-[9px] font-bold flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
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
              <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold border border-[#2a2a2a] overflow-hidden">
                {ativa.profilePicUrl
                  ? <img src={ativa.profilePicUrl} alt="" className="w-full h-full object-cover" />
                  : (ativa.pushName || formatJid(ativa.remoteJid)).slice(0, 2).toUpperCase()
                }
              </div>
              <div>
                <p className="text-white text-sm font-bold">{ativa.pushName || formatJid(ativa.remoteJid)}</p>
                <span className="text-[#555] text-xs flex items-center gap-1">
                  <Phone size={10} /> {formatJid(ativa.remoteJid)}
                </span>
              </div>
            </div>
            <button
              onClick={() => loadMensagens(ativa.remoteJid)}
              className="text-[#444] hover:text-white transition-colors"
              title="Atualizar mensagens"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[#0D0D0D]">
            {loadingMsgs && (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-[#FF4D1C]" />
              </div>
            )}
            {!loadingMsgs && mensagens.map((msg, i) => {
              const fromMe = msg.key?.fromMe
              const texto  = extractText(msg)
              const hora   = msg.messageTimestamp
                ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : ''
              if (!texto || texto === '[mídia]' && !fromMe) return null
              return (
                <div key={msg.id || i} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[68%] flex flex-col gap-0.5 ${fromMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      fromMe
                        ? 'bg-[#FF4D1C]/90 text-white rounded-tr-sm'
                        : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] rounded-tl-sm'
                    }`}>
                      {texto}
                    </div>
                    <span className="text-[#333] text-[10px] px-1">{hora}</span>
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
                className="flex-1 bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4D1C]/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0D0D] gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#1f1f1f] flex items-center justify-center">
            <Bot size={28} className="text-[#333]" />
          </div>
          <p className="text-[#333] text-sm">Selecione uma conversa para abrir o chat</p>
        </div>
      )}
    </div>
  )
}
