import { useState, useEffect, useRef } from 'react'
import { Phone, UserCheck, Send, Bot, User, Search, Circle, WifiOff, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { waStatus } from '../api'

const MOCK_CONVERSAS = [
  {
    id: 1,
    nome: 'Mamma Pizza | Campo Bom',
    telefone: '(51) 3585-1001',
    status_pipeline: 'Contatado',
    modo: 'agente',
    nao_lidas: 2,
    ultima_msg: 'Sim, tenho interesse em saber mais sobre o sistema!',
    ultima_hora: '09:42',
    mensagens: [
      { id: 1, conteudo: 'Olá! Vi que vocês são uma das pizzarias mais bem avaliadas de Campo Bom 🍕 Sou do Delivery Fácil, sistema de gestão de delivery que aumenta em média 30% o faturamento dos restaurantes. Posso te mostrar como funciona?', direcao: 'enviado', autor: 'agente', hora: '09:15' },
      { id: 2, conteudo: 'Oi! Quem é você?', direcao: 'recebido', autor: 'lead', hora: '09:38' },
      { id: 3, conteudo: 'Sou o assistente virtual do Delivery Fácil! Nosso sistema ajuda pizzarias como a sua a gerenciar pedidos, cardápio digital e fidelizar clientes. Tudo num só app. Tem 5 minutos para eu te mostrar?', direcao: 'enviado', autor: 'agente', hora: '09:39' },
      { id: 4, conteudo: 'Sim, tenho interesse em saber mais sobre o sistema!', direcao: 'recebido', autor: 'lead', hora: '09:42' },
    ],
  },
  {
    id: 2,
    nome: 'Pizzaria Manjericão Toscano',
    telefone: '(51) 98045-6466',
    status_pipeline: 'Respondeu',
    modo: 'agente',
    nao_lidas: 0,
    ultima_msg: 'Quanto custa por mês?',
    ultima_hora: '08:57',
    mensagens: [
      { id: 1, conteudo: 'Olá! Vi que o Manjericão Toscano tem 4,7 estrelas no Maps — parabéns! Sou do Delivery Fácil, sistema que ajuda restaurantes a aumentar pedidos online. Posso apresentar?', direcao: 'enviado', autor: 'agente', hora: '08:30' },
      { id: 2, conteudo: 'Oi, pode sim', direcao: 'recebido', autor: 'lead', hora: '08:45' },
      { id: 3, conteudo: 'Ótimo! O Delivery Fácil inclui: cardápio digital, gestão de pedidos, integração com iFood e WhatsApp, relatórios de vendas e programa de fidelidade. Tudo por uma mensalidade fixa, sem comissão por pedido 🚀', direcao: 'enviado', autor: 'agente', hora: '08:46' },
      { id: 4, conteudo: 'Quanto custa por mês?', direcao: 'recebido', autor: 'lead', hora: '08:57' },
    ],
  },
  {
    id: 3,
    nome: 'Burger House Novo Hamburgo',
    telefone: '(51) 99201-3344',
    status_pipeline: 'Trial',
    modo: 'usuario',
    nao_lidas: 0,
    ultima_msg: 'Perfeito, vou agendar a ligação com o Thomas então',
    ultima_hora: 'Ontem',
    mensagens: [
      { id: 1, conteudo: 'Olá Burger House! Sou do Delivery Fácil. Vi que vocês trabalham com delivery — nosso sistema pode te ajudar a aumentar o ticket médio e fidelizar clientes. Quer saber mais?', direcao: 'enviado', autor: 'agente', hora: '14:10' },
      { id: 2, conteudo: 'Já uso o iFood, pra que eu precisaria de mais um sistema?', direcao: 'recebido', autor: 'lead', hora: '14:35' },
      { id: 3, conteudo: 'Ótima pergunta! O Delivery Fácil complementa o iFood — você tem canal próprio sem pagar 30% de comissão, fideliza o cliente no seu WhatsApp e tem relatórios que o iFood não oferece. Prefere eu te ligar para mostrar ao vivo?', direcao: 'enviado', autor: 'agente', hora: '14:36' },
      { id: 4, conteudo: 'Pode ser, mas quero falar com alguém da empresa', direcao: 'recebido', autor: 'lead', hora: '14:50' },
      { id: 5, conteudo: 'Claro! Vou acionar nosso consultor Thomas para entrar em contato. Qual o melhor horário para você?', direcao: 'enviado', autor: 'agente', hora: '14:51' },
      { id: 6, conteudo: 'Amanhã de manhã, entre 9h e 11h', direcao: 'recebido', autor: 'lead', hora: '15:02' },
      { id: 7, conteudo: 'Perfeito, vou agendar a ligação com o Thomas então', direcao: 'enviado', autor: 'usuario', hora: '15:10' },
    ],
  },
  {
    id: 4,
    nome: 'Sushi Nakamura São Leopoldo',
    telefone: '(51) 3022-8800',
    status_pipeline: 'Captado',
    modo: 'agente',
    nao_lidas: 1,
    ultima_msg: 'Não tenho interesse, obrigado',
    ultima_hora: 'Ontem',
    mensagens: [
      { id: 1, conteudo: 'Olá! O Sushi Nakamura tem uma das maiores avaliações de São Leopoldo! Sou do Delivery Fácil, sistema de delivery próprio para restaurantes. Posso apresentar?', direcao: 'enviado', autor: 'agente', hora: '11:00' },
      { id: 2, conteudo: 'Não tenho interesse, obrigado', direcao: 'recebido', autor: 'lead', hora: '11:45' },
    ],
  },
  {
    id: 5,
    nome: 'Açaí do Bem Gravataí',
    telefone: '(51) 98777-2211',
    status_pipeline: 'Captado',
    modo: 'agente',
    nao_lidas: 0,
    ultima_msg: 'Olá! Vi que vocês são referência em açaí em Gravataí...',
    ultima_hora: '2d atrás',
    mensagens: [
      { id: 1, conteudo: 'Olá! Vi que vocês são referência em açaí em Gravataí 🍇 Sou do Delivery Fácil — sistema que ajuda negócios de alimentação a vender mais pelo delivery próprio, sem pagar comissão. Posso te mostrar como funciona?', direcao: 'enviado', autor: 'agente', hora: '16:00' },
    ],
  },
]

const STATUS_PIPELINE_STYLE = {
  Captado:   'bg-blue-400/10 text-blue-400',
  Contatado: 'bg-yellow-400/10 text-yellow-400',
  Respondeu: 'bg-purple-400/10 text-purple-400',
  Trial:     'bg-[#FF4D1C]/10 text-[#FF4D1C]',
  Cliente:   'bg-emerald-400/10 text-emerald-400',
  Perdido:   'bg-[#1f1f1f] text-[#555]',
}

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${active ? 'bg-[#FF4D1C]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export default function Conversas() {
  const navigate = useNavigate()
  const [waPhase, setWaPhase]       = useState('loading') // 'loading' | 'disconnected' | 'connected'
  const pollRef                     = useRef(null)

  const [conversas, setConversas]   = useState(MOCK_CONVERSAS)
  const [ativa, setAtiva]           = useState(MOCK_CONVERSAS[0])
  const [input, setInput]           = useState('')
  const [search, setSearch]         = useState('')

  // Checa status WhatsApp ao montar e a cada 10s
  useEffect(() => {
    async function check() {
      try {
        const s = await waStatus()
        setWaPhase(s.status === 'connected' ? 'connected' : 'disconnected')
      } catch {
        setWaPhase('disconnected')
      }
    }
    check()
    pollRef.current = setInterval(check, 10000)
    return () => clearInterval(pollRef.current)
  }, [])

  // ── Tela de WhatsApp desconectado ────────────────────────
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

  const filtradas = conversas.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  )

  function assumir(id) {
    setConversas(prev => prev.map(c => c.id === id ? { ...c, modo: 'usuario' } : c))
    setAtiva(prev => ({ ...prev, modo: 'usuario' }))
  }

  function enviar(e) {
    e.preventDefault()
    if (!input.trim() || !ativa) return
    const nova = {
      id: Date.now(),
      conteudo: input.trim(),
      direcao: 'enviado',
      autor: ativa.modo === 'usuario' ? 'usuario' : 'agente',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = conversas.map(c =>
      c.id === ativa.id
        ? { ...c, mensagens: [...c.mensagens, nova], ultima_msg: nova.conteudo, ultima_hora: nova.hora }
        : c
    )
    setConversas(updated)
    setAtiva(updated.find(c => c.id === ativa.id))
    setInput('')
  }

  function selectConversa(c) {
    setAtiva(c)
    setConversas(prev => prev.map(x => x.id === c.id ? { ...x, nao_lidas: 0 } : x))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Coluna esquerda ── */}
      <div className="w-[350px] flex-shrink-0 border-r border-[#1f1f1f] flex flex-col bg-[#0D0D0D]">
        {/* Header */}
        <div className="px-4 py-4 border-b border-[#1f1f1f]">
          <h1 className="text-white font-bold text-base mb-3">Conversas</h1>
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

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {filtradas.map(c => (
            <button
              key={c.id}
              onClick={() => selectConversa(c)}
              className={`w-full text-left px-4 py-3.5 border-b border-[#111111] transition-colors ${
                ativa?.id === c.id ? 'bg-[#FF4D1C]/8 border-l-2 border-l-[#FF4D1C]' : 'hover:bg-[#111111]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.nome.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-xs font-semibold truncate pr-2">{c.nome}</span>
                    <span className="text-[#444] text-[10px] flex-shrink-0">{c.ultima_hora}</span>
                  </div>
                  <p className="text-[#555] text-[11px] truncate mb-1.5">{c.ultima_msg}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {c.modo === 'agente' ? (
                        <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                          <Bot size={9} /> Agente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FF4D1C]/10 text-[#FF4D1C]">
                          <User size={9} /> Você
                        </span>
                      )}
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_PIPELINE_STYLE[c.status_pipeline]}`}>
                        {c.status_pipeline}
                      </span>
                    </div>
                    {c.nao_lidas > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF4D1C] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.nao_lidas}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Coluna direita ── */}
      {ativa ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold border border-[#2a2a2a]">
                {ativa.nome.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-bold">{ativa.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#555] text-xs flex items-center gap-1">
                    <Phone size={10} /> {ativa.telefone}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_PIPELINE_STYLE[ativa.status_pipeline]}`}>
                    {ativa.status_pipeline}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Modo badge */}
              {ativa.modo === 'agente' ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                  <Bot size={13} /> Agente respondendo
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FF4D1C]/10 border border-[#FF4D1C]/20 text-[#FF4D1C]">
                  <User size={13} /> Você respondendo
                </span>
              )}

              {/* Assumir */}
              {ativa.modo === 'agente' && (
                <button
                  onClick={() => assumir(ativa.id)}
                  className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <UserCheck size={13} />
                  Assumir conversa
                </button>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#0D0D0D]">
            {ativa.mensagens.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.direcao === 'enviado' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[68%] ${msg.direcao === 'enviado' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {/* Autor label */}
                  <span className="text-[#444] text-[10px] px-1">
                    {msg.autor === 'agente' ? '🤖 Agente' : msg.autor === 'usuario' ? '👤 Você' : '💬 Lead'}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.direcao === 'enviado'
                        ? msg.autor === 'agente'
                          ? 'bg-[#1a2a1a] border border-emerald-900/40 text-[#ccc] rounded-tr-sm'
                          : 'bg-[#FF4D1C]/90 text-white rounded-tr-sm'
                        : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] rounded-tl-sm'
                    }`}
                  >
                    {msg.conteudo}
                  </div>
                  <span className="text-[#333] text-[10px] px-1">{msg.hora}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-[#1f1f1f] bg-[#111111] flex-shrink-0">
            {ativa.modo === 'agente' && (
              <p className="text-[#444] text-xs mb-2 flex items-center gap-1.5">
                <Circle size={8} className="text-emerald-400 fill-emerald-400" />
                Agente está respondendo automaticamente. Clique em "Assumir conversa" para responder manualmente.
              </p>
            )}
            <form onSubmit={enviar} className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={ativa.modo === 'usuario' ? 'Digite sua mensagem...' : 'Enviar mensagem manual (agente pausado nesta conversa)...'}
                className="flex-1 bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4D1C]/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0D0D0D]">
          <p className="text-[#333] text-sm">Selecione uma conversa</p>
        </div>
      )}
    </div>
  )
}
