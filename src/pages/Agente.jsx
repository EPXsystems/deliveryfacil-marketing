import { useState } from 'react'
import {
  Bot, MessageSquare, ArrowRight, CheckCircle2, PhoneCall,
  Activity, BookOpen, Zap, Edit3,
  ChevronDown, ChevronUp, TrendingUp, Loader2, XCircle, Play,
} from 'lucide-react'
import { API } from '../api'

// ── Toggle ────────────────────────────────────────────────
function Toggle({ active, onChange, size = 'md' }) {
  const w = size === 'lg' ? 'w-14 h-7' : 'w-10 h-5'
  const b = size === 'lg' ? 'w-6 h-6 top-0.5 left-0.5' : 'w-4 h-4 top-0.5 left-0.5'
  const t = size === 'lg' ? 'translate-x-7' : 'translate-x-5'
  return (
    <button
      onClick={onChange}
      className={`relative ${w} rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-[#FF4D1C]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute ${b} bg-white rounded-full shadow transition-transform duration-200 ${active ? t : 'translate-x-0'}`} />
    </button>
  )
}

// ── Editable text block ───────────────────────────────────
function EditableMsg({ label, value, onChange, badge }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#FF4D1C] text-xs font-bold">{label}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4D1C]/10 text-[#FF4D1C] border border-[#FF4D1C]/20">{badge}</span>
          )}
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-[#444] hover:text-white transition-colors"
        >
          <Edit3 size={13} />
        </button>
      </div>
      {editing ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus
          className="w-full bg-[#111111] border border-[#FF4D1C]/30 text-white text-xs rounded-lg p-3 focus:outline-none resize-none leading-relaxed"
        />
      ) : (
        <p className="text-[#888] text-xs leading-relaxed">{value}</p>
      )}
    </div>
  )
}

// ── Fluxo Step ────────────────────────────────────────────
function FluxoStep({ icon: Icon, cor, label, children, last = false }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cor}`}>
          <Icon size={16} className="text-white" />
        </div>
        {!last && <div className="w-px flex-1 bg-[#1f1f1f] mt-1 mb-1" />}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-white text-xs font-semibold mb-3">{label}</p>
        {children}
      </div>
    </div>
  )
}

const INITIAL_MSGS = {
  d0: 'Olá! 👋 Vi que vocês estão entre os restaurantes mais bem avaliados da cidade! Sou do Delivery Fácil — sistema de delivery próprio que aumenta em média 30% o faturamento sem pagar comissão por pedido. Tem 2 minutinhos para eu te mostrar como funciona?',
  d1: 'Oi! Passando para retomar nosso contato 🙂 Sei que é corrido no dia a dia de restaurante. O Delivery Fácil pode realmente fazer diferença no seu faturamento. Posso te mostrar em 5 minutos?',
  d3: 'Última tentativa de contato! Caso queira conhecer como o Delivery Fácil está ajudando restaurantes como o seu a venderem mais com delivery próprio, é só me responder. Se não for o momento, sem problema — guardamos seu contato para quando precisar! 🚀',
}

const MOCK_LOGS = [
  { id: 1, hora: '09:42', lead: 'Mamma Pizza | Campo Bom', acao: 'Mensagem D+0 enviada', status: 'ok' },
  { id: 2, hora: '09:38', lead: 'Pizzaria Manjericão', acao: 'Lead respondeu — qualificando interesse', status: 'ok' },
  { id: 3, hora: '09:15', lead: 'Burger House NH', acao: 'Proposta de ligação enviada', status: 'ok' },
  { id: 4, hora: '08:57', lead: 'Sushi Nakamura', acao: 'Lead recusou contato — marcado como Perdido', status: 'warn' },
  { id: 5, hora: '08:30', lead: 'Açaí do Bem', acao: 'Mensagem D+1 enviada', status: 'ok' },
  { id: 6, hora: '08:00', lead: 'Pastelaria Central', acao: 'Falha ao enviar — WhatsApp offline', status: 'erro' },
]

const BASE_INICIAL = {
  produto: 'Delivery Fácil é um sistema completo de gestão e delivery para restaurantes. Permite criar cardápio digital, receber pedidos pelo WhatsApp e app próprio, sem pagar comissão por pedido.',
  features: '• Cardápio digital personalizado\n• Pedidos via WhatsApp automatizado\n• App próprio para Android e iOS\n• Integração com iFood e Rappi\n• Relatórios de vendas em tempo real\n• Programa de fidelidade integrado\n• Gestão de estoque e financeiro',
  preco: 'Plano Básico: R$ 197/mês. Plano Pro: R$ 397/mês. Plano Enterprise: sob consulta. Sem comissão por pedido, sem taxa de adesão.',
  diferenciais: 'Zero comissão por pedido (iFood cobra até 30%), canal de venda próprio, suporte 24/7, onboarding gratuito, cancelamento sem multa.',
  objecoes: 'Já uso iFood: Complementamos o iFood — você tem canal próprio sem pagar 30% de comissão.\nCaro demais: Um pedido a mais por dia já paga o sistema. ROI médio em 15 dias.\nNão tenho tempo: Setup em 2 horas, nossa equipe faz tudo por você.',
}

export default function Agente() {
  const [ativo, setAtivo]         = useState(true)
  const [msgs, setMsgs]           = useState(INITIAL_MSGS)
  const [base, setBase]           = useState(BASE_INICIAL)
  const [baseOpen, setBaseOpen]   = useState(false)

  // Execução real
  const [executando, setExecutando] = useState(false)
  const [progresso, setProgresso]   = useState([])   // { lead, telefone, status, erro }
  const [resumo, setResumo]         = useState(null)  // { enviados, erros, total }

  async function executarAgente() {
    if (executando) return
    setExecutando(true)
    setProgresso([])
    setResumo(null)

    try {
      const res = await fetch(`${API}/agente/executar`, { method: 'POST' })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.tipo === 'progresso') {
              setProgresso(prev => {
                const exists = prev.find(p => p.lead === evt.lead)
                if (exists) return prev.map(p => p.lead === evt.lead ? { ...p, ...evt } : p)
                return [...prev, evt]
              })
            } else if (evt.tipo === 'fim') {
              setResumo(evt)
            } else if (evt.tipo === 'erro') {
              setResumo({ erro: evt.msg })
            }
          } catch {}
        }
      }
    } catch (e) {
      setResumo({ erro: e.message })
    }
    setExecutando(false)
  }

  const metricas = [
    { label: 'Mensagens hoje',      value: 24,    cor: 'text-[#FF4D1C]' },
    { label: 'Taxa de resposta',    value: '34%', cor: 'text-yellow-400' },
    { label: 'Conversões semana',   value: 3,     cor: 'text-emerald-400' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Agente de Vendas</h1>
          <p className="text-[#555] text-sm mt-0.5">IA que aborda leads e tenta fechar automaticamente</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold ${ativo ? 'text-emerald-400' : 'text-[#555]'}`}>
            {ativo ? 'Ativo' : 'Pausado'}
          </span>
          <Toggle active={ativo} onChange={() => setAtivo(v => !v)} size="lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Status banner */}
        <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${
          ativo
            ? 'bg-emerald-400/5 border-emerald-400/15'
            : 'bg-[#1f1f1f] border-[#2a2a2a]'
        }`}>
          <div className="flex items-center gap-3">
            {ativo
              ? <><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-emerald-400 text-sm font-semibold">Agente rodando em segundo plano</span></>
              : <><div className="w-2 h-2 rounded-full bg-[#444]" /><span className="text-[#555] text-sm font-semibold">Agente pausado</span></>
            }
          </div>
          {/* Métricas */}
          <div className="flex items-center gap-6">
            {metricas.map(m => (
              <div key={m.label} className="text-center">
                <div className={`text-xl font-bold ${ativo ? m.cor : 'text-[#333]'}`}>{m.value}</div>
                <div className="text-[#444] text-[10px]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Executar agente */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-sm font-semibold">Disparar Ciclo Agora</h2>
              <p className="text-[#444] text-xs mt-0.5">Envia mensagem D+0 para todos os leads com status "Captado"</p>
            </div>
            <button
              onClick={executarAgente}
              disabled={executando || !ativo}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${
                executando || !ativo
                  ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
                  : 'bg-[#FF4D1C] hover:bg-[#e63d0e] text-white'
              }`}
            >
              {executando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {executando ? 'Executando...' : 'Executar agora'}
            </button>
          </div>

          {/* Progresso em tempo real */}
          {(executando || progresso.length > 0) && (
            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden">
              {/* Resumo */}
              {resumo && (
                <div className={`px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-3 ${
                  resumo.erro ? 'bg-red-400/5' : 'bg-emerald-400/5'
                }`}>
                  {resumo.erro
                    ? <><XCircle size={14} className="text-red-400" /><span className="text-red-400 text-xs font-semibold">{resumo.erro}</span></>
                    : <><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold">{resumo.enviados} mensagens enviadas · {resumo.erros} erros</span></>
                  }
                </div>
              )}
              {executando && !resumo && (
                <div className="px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-2 bg-[#FF4D1C]/5">
                  <Loader2 size={12} className="animate-spin text-[#FF4D1C]" />
                  <span className="text-[#FF4D1C] text-xs font-semibold">Enviando mensagens...</span>
                </div>
              )}
              {/* Itens */}
              <div className="max-h-52 overflow-y-auto">
                {progresso.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#0D0D0D] last:border-0">
                    {p.status === 'enviando' && <Loader2 size={11} className="animate-spin text-[#FF4D1C] flex-shrink-0" />}
                    {p.status === 'ok'       && <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />}
                    {p.status === 'erro'     && <XCircle size={11} className="text-red-400 flex-shrink-0" />}
                    <span className="text-white text-xs font-medium flex-1 truncate">{p.lead}</span>
                    <span className="text-[#444] text-xs font-mono flex-shrink-0">{p.telefone}</span>
                    {p.erro && <span className="text-red-400 text-[10px] flex-shrink-0 max-w-[120px] truncate">{p.erro}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fluxo de abordagem */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={15} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Fluxo de Abordagem</h2>
            <span className="text-[10px] text-[#555] ml-1">— clique no lápis para editar as mensagens</span>
          </div>

          <div className="space-y-0">
            <FluxoStep icon={MessageSquare} cor="bg-[#FF4D1C]" label="D+0 — Mensagem de abertura">
              <EditableMsg
                label="Mensagem inicial"
                value={msgs.d0}
                onChange={v => setMsgs(m => ({ ...m, d0: v }))}
                badge="Enviada ao captar lead"
              />
            </FluxoStep>

            <FluxoStep icon={ArrowRight} cor="bg-yellow-500" label="D+1 — Follow-up (sem resposta)">
              <EditableMsg
                label="Follow-up automático"
                value={msgs.d1}
                onChange={v => setMsgs(m => ({ ...m, d1: v }))}
                badge="24h sem resposta"
              />
            </FluxoStep>

            <FluxoStep icon={MessageSquare} cor="bg-purple-500" label="D+3 — Última tentativa">
              <EditableMsg
                label="Última tentativa"
                value={msgs.d3}
                onChange={v => setMsgs(m => ({ ...m, d3: v }))}
                badge="72h sem resposta"
              />
            </FluxoStep>

            {/* Branches */}
            <div className="ml-[52px] grid grid-cols-2 gap-3 mb-6">
              <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold">Interessado</span>
                </div>
                <p className="text-[#555] text-xs leading-relaxed">Qualifica automaticamente → envia link do trial → tenta fechar a venda</p>
              </div>
              <div className="bg-[#FF4D1C]/5 border border-[#FF4D1C]/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <PhoneCall size={13} className="text-[#FF4D1C]" />
                  <span className="text-[#FF4D1C] text-xs font-semibold">Não fecha sozinho</span>
                </div>
                <p className="text-[#555] text-xs leading-relaxed">Propõe ligação com consultor → notifica você via WhatsApp</p>
              </div>
            </div>

            <FluxoStep icon={TrendingUp} cor="bg-emerald-500" label="Fechamento" last>
              <div className="bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl p-3">
                <p className="text-[#666] text-xs">Lead converte → status muda para <strong className="text-emerald-400">Trial</strong> automaticamente → Onboarding iniciado</p>
              </div>
            </FluxoStep>
          </div>
        </div>

        {/* Base de conhecimento */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <button
            onClick={() => setBaseOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Base de Conhecimento</h2>
              <span className="text-[10px] text-[#555]">— o agente usa isso para responder dúvidas</span>
            </div>
            {baseOpen ? <ChevronUp size={15} className="text-[#444]" /> : <ChevronDown size={15} className="text-[#444]" />}
          </button>

          {baseOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-[#1f1f1f] pt-4">
              {[
                { key: 'produto',      label: '📦 O que é o produto' },
                { key: 'features',     label: '✅ Principais funcionalidades' },
                { key: 'preco',        label: '💰 Preços e planos' },
                { key: 'diferenciais', label: '🚀 Diferenciais' },
                { key: 'objecoes',     label: '💬 Objeções comuns e respostas' },
              ].map(({ key, label }) => (
                <EditableMsg
                  key={key}
                  label={label}
                  value={base[key]}
                  onChange={v => setBase(b => ({ ...b, [key]: v }))}
                />
              ))}
              <button className="w-full bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Salvar base de conhecimento
              </button>
            </div>
          )}
        </div>

        {/* Log de atividades */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Log de Atividades</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#1f1f1f]">
                  {['Horário', 'Lead', 'Ação', 'Status'].map(h => (
                    <th key={h} className="text-left text-[#444] text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LOGS.map(log => (
                  <tr key={log.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D] transition-colors">
                    <td className="px-4 py-2.5 text-[#444] text-xs font-mono">{log.hora}</td>
                    <td className="px-4 py-2.5 text-white text-xs font-medium">{log.lead}</td>
                    <td className="px-4 py-2.5 text-[#666] text-xs">{log.acao}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        log.status === 'ok'   ? 'bg-emerald-400/10 text-emerald-400' :
                        log.status === 'warn' ? 'bg-yellow-400/10 text-yellow-400'   :
                                                'bg-red-400/10 text-red-400'
                      }`}>
                        {log.status === 'ok' ? 'Sucesso' : log.status === 'warn' ? 'Aviso' : 'Erro'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
