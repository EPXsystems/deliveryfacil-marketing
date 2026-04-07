import { useState, useEffect, useRef } from 'react'
import {
  Bot, MessageSquare, ArrowRight, CheckCircle2, PhoneCall,
  Activity, BookOpen, Zap, Edit3, Settings2,
  ChevronDown, ChevronUp, TrendingUp, Loader2, XCircle, Play,
  Clock, Target, Pause, Eye, EyeOff,
} from 'lucide-react'
import { API } from '../api'
import TesteBanner from '../components/TesteBanner'

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
        <button onClick={() => setEditing(e => !e)} className="text-[#444] hover:text-white transition-colors">
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
  d0: 'Olá! Vi que vocês estão entre os restaurantes mais bem avaliados da cidade! Sou do Delivery Fácil — sistema de delivery próprio que aumenta em média 30% o faturamento sem pagar comissão por pedido. Tem 2 minutinhos para eu te mostrar como funciona?',
  d1: 'Oi! Passando para retomar nosso contato. Sei que é corrido no dia a dia de restaurante. O Delivery Fácil pode realmente fazer diferença no seu faturamento. Posso te mostrar em 5 minutos?',
  d3: 'Última tentativa de contato! Caso queira conhecer como o Delivery Fácil está ajudando restaurantes como o seu a venderem mais com delivery próprio, é só me responder. Se não for o momento, sem problema — guardamos seu contato para quando precisar!',
}

const BASE_INICIAL = {
  produto:      'Delivery Fácil é um sistema completo de gestão e delivery para restaurantes. Permite criar cardápio digital, receber pedidos pelo WhatsApp e app próprio, sem pagar comissão por pedido.',
  features:     '• Cardápio digital personalizado\n• Pedidos via WhatsApp automatizado\n• App próprio para Android e iOS\n• Integração com iFood e Rappi\n• Relatórios de vendas em tempo real\n• Programa de fidelidade integrado',
  preco:        'Plano Básico: R$ 197/mês. Plano Pro: R$ 397/mês. Sem comissão por pedido, sem taxa de adesão.',
  diferenciais: 'Zero comissão por pedido (iFood cobra até 30%), canal de venda próprio, suporte 24/7, onboarding gratuito, cancelamento sem multa.',
  objecoes:     'Já uso iFood: Complementamos o iFood — você tem canal próprio sem pagar 30% de comissão.\nCaro demais: Um pedido a mais por dia já paga o sistema.\nNão tenho tempo: Setup em 2 horas, nossa equipe faz tudo por você.',
}

// ── Status icon do item de progresso ─────────────────────
function ProgressIcon({ status }) {
  if (status === 'gerando')  return <Loader2 size={12} className="animate-spin text-yellow-400 flex-shrink-0" />
  if (status === 'enviando') return <Loader2 size={12} className="animate-spin text-[#FF4D1C] flex-shrink-0" />
  if (status === 'ok')       return <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
  if (status === 'erro')     return <XCircle size={12} className="text-red-400 flex-shrink-0" />
  return <div className="w-3 h-3 rounded-full bg-[#333] flex-shrink-0" />
}

export default function Agente() {
  const [modoTeste, setModoTeste]   = useState(false)
  const [testNumber, setTestNumber] = useState('5551981538335')
  const [ativo, setAtivo]           = useState(true)
  const [msgs, setMsgs]             = useState(INITIAL_MSGS)
  const [base, setBase]         = useState(BASE_INICIAL)
  const [baseOpen, setBaseOpen] = useState(false)
  const [cfgOpen, setCfgOpen]   = useState(false)

  // Meta do dia
  const [metaDia, setMetaDia] = useState(null)

  // Execução SDR
  const [executando, setExecutando]   = useState(false)
  const [progresso, setProgresso]     = useState([])
  const [aguardando, setAguardando]   = useState(null)  // { label, proximo }
  const [resumo, setResumo]           = useState(null)
  const progressoRef = useRef(null)

  // Logs reais
  const [logs, setLogs] = useState([])

  // Config SDR
  const [cfg, setCfg] = useState({
    meta_dia: 10, delay_min_seg: 180, delay_max_seg: 480,
    horario_inicio: '08:00', horario_fim: '20:00',
    usar_ia: false, tom: 'misto', claude_api_key: '',
  })
  const [showKey, setShowKey] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Carrega config, meta e logs ao montar
  useEffect(() => {
    fetch(`${API}/teste/status`)
      .then(r => r.json())
      .then(d => { if (d.success) { setModoTeste(d.modo_teste); setTestNumber(d.test_number || '5551981538335') } })
      .catch(() => {})
    fetchMeta()
    fetchLogs()
    fetch(`${API}/agente/config`)
      .then(r => r.json())
      .then(d => {
        if (d.config) {
          setAtivo(!!d.config.ativo)
          setCfg({
            meta_dia:      d.config.meta_dia      || 10,
            delay_min_seg: d.config.delay_min_seg || 180,
            delay_max_seg: d.config.delay_max_seg || 480,
            horario_inicio: d.config.horario_inicio || '08:00',
            horario_fim:    d.config.horario_fim    || '20:00',
            usar_ia:        !!d.config.usar_ia,
            tom:            d.config.tom || 'misto',
            claude_api_key: d.config.claude_api_key || '',
          })
          if (d.config.msg_d0) setMsgs(m => ({ ...m, d0: d.config.msg_d0 }))
          if (d.config.msg_d1) setMsgs(m => ({ ...m, d1: d.config.msg_d1 }))
          if (d.config.msg_d3) setMsgs(m => ({ ...m, d3: d.config.msg_d3 }))
        }
      })
      .catch(() => {})
  }, [])

  function fetchMeta() {
    fetch(`${API}/agente/meta-dia`)
      .then(r => r.json())
      .then(d => { if (d.success) setMetaDia(d) })
      .catch(() => {})
  }

  function fetchLogs() {
    fetch(`${API}/agente/sdr-logs`)
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.logs || []) })
      .catch(() => {})
  }

  // Auto-scroll progresso
  useEffect(() => {
    if (progressoRef.current) {
      progressoRef.current.scrollTop = progressoRef.current.scrollHeight
    }
  }, [progresso, aguardando])

  async function salvarConfig() {
    setSalvando(true)
    try {
      await fetch(`${API}/agente/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ativo: ativo ? 1 : 0,
          msg_d0: msgs.d0, msg_d1: msgs.d1, msg_d3: msgs.d3,
          horario_inicio: cfg.horario_inicio, horario_fim: cfg.horario_fim,
          dias_ativos: 'seg,ter,qua,qui,sex', delay_minutos: 3,
          meta_dia:      cfg.meta_dia,
          delay_min_seg: cfg.delay_min_seg,
          delay_max_seg: cfg.delay_max_seg,
          usar_ia:       cfg.usar_ia ? 1 : 0,
          tom:           cfg.tom,
          claude_api_key: cfg.claude_api_key || null,
        }),
      })
    } catch {}
    setSalvando(false)
  }

  async function executarSDR() {
    if (executando) return
    setExecutando(true)
    setProgresso([])
    setAguardando(null)
    setResumo(null)

    try {
      const res = await fetch(`${API}/agente/executar-sdr`, { method: 'POST' })
      const reader  = res.body.getReader()
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

            if (evt.tipo === 'inicio') {
              // noop — progresso vazio é suficiente
            } else if (evt.tipo === 'progresso') {
              setAguardando(null)
              setProgresso(prev => {
                const idx = prev.findIndex(p => p.lead === evt.lead)
                if (idx >= 0) {
                  const next = [...prev]
                  next[idx] = { ...next[idx], ...evt }
                  return next
                }
                return [...prev, evt]
              })
            } else if (evt.tipo === 'aguardando') {
              setAguardando(evt)
            } else if (evt.tipo === 'fim') {
              setAguardando(null)
              setResumo(evt)
              fetchMeta()
              fetchLogs()
            } else if (evt.tipo === 'erro') {
              setAguardando(null)
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

  const metaPct = metaDia ? Math.min(100, Math.round((metaDia.enviados_hoje / metaDia.meta) * 100)) : 0

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Modo Teste */}
      {modoTeste && <TesteBanner testNumber={testNumber} />}

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Agente SDR</h1>
          <p className="text-[#555] text-sm mt-0.5">Lucas — IA que aborda leads e qualifica automaticamente</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold ${ativo ? 'text-emerald-400' : 'text-[#555]'}`}>
            {ativo ? 'Ativo' : 'Pausado'}
          </span>
          <Toggle active={ativo} onChange={() => { setAtivo(v => !v) }} size="lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Meta do dia */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Meta do Dia</h2>
            </div>
            <div className="flex items-center gap-4">
              {metaDia && (
                <>
                  <span className="text-[#555] text-xs">
                    <span className="text-white font-bold">{metaDia.enviados_hoje}</span>
                    <span className="text-[#444]">/{metaDia.meta} leads contatados</span>
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    metaDia.restantes === 0
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-[#FF4D1C]/10 text-[#FF4D1C]'
                  }`}>
                    {metaDia.restantes === 0 ? 'Meta atingida!' : `${metaDia.restantes} restantes`}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF4D1C] to-[#ff7a52] h-2 rounded-full transition-all duration-700"
              style={{ width: `${metaPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[#444] text-[10px]">0</span>
            <span className="text-[#FF4D1C] text-[10px] font-semibold">{metaPct}%</span>
            <span className="text-[#444] text-[10px]">{metaDia?.meta || 10}</span>
          </div>
        </div>

        {/* Iniciar SDR */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-sm font-semibold">Iniciar SDR Hoje</h2>
              <p className="text-[#444] text-xs mt-0.5">
                Delay {cfg.delay_min_seg / 60}–{cfg.delay_max_seg / 60} min · Máx {cfg.meta_dia}/dia · {cfg.horario_inicio}–{cfg.horario_fim}
                {cfg.usar_ia && <span className="text-[#FF4D1C] ml-1">· IA ativa</span>}
              </p>
            </div>
            <button
              onClick={executarSDR}
              disabled={executando || !ativo}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${
                executando || !ativo
                  ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
                  : 'bg-[#FF4D1C] hover:bg-[#e63d0e] text-white'
              }`}
            >
              {executando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {executando ? 'Executando...' : 'Iniciar SDR'}
            </button>
          </div>

          {/* Painel de progresso */}
          {(executando || progresso.length > 0) && (
            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden">
              {/* Resumo */}
              {resumo && (
                <div className={`px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-3 ${resumo.erro ? 'bg-red-400/5' : 'bg-emerald-400/5'}`}>
                  {resumo.erro
                    ? <><XCircle size={14} className="text-red-400" /><span className="text-red-400 text-xs font-semibold">{resumo.erro}</span></>
                    : <><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold">{resumo.enviados} enviadas · {resumo.erros} erros{resumo.msg ? ` — ${resumo.msg}` : ''}</span></>
                  }
                </div>
              )}
              {executando && !resumo && (
                <div className="px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-2 bg-[#FF4D1C]/5">
                  <Loader2 size={12} className="animate-spin text-[#FF4D1C]" />
                  <span className="text-[#FF4D1C] text-xs font-semibold">SDR em execução...</span>
                </div>
              )}

              {/* Lista de leads */}
              <div ref={progressoRef} className="max-h-64 overflow-y-auto">
                {progresso.map((p, i) => (
                  <div key={i} className="border-b border-[#0D0D0D] last:border-0">
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <ProgressIcon status={p.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-medium truncate">{p.lead}</span>
                          {p.status === 'gerando'  && <span className="text-yellow-400 text-[10px]">gerando mensagem...</span>}
                          {p.status === 'enviando' && <span className="text-[#FF4D1C] text-[10px]">enviando...</span>}
                          {p.status === 'ok'       && <span className="text-emerald-400 text-[10px]">enviado</span>}
                          {p.status === 'erro'     && <span className="text-red-400 text-[10px] truncate max-w-[140px]">{p.erro}</span>}
                        </div>
                        {p.mensagem && p.status === 'ok' && (
                          <p className="text-[#444] text-[10px] mt-0.5 truncate">{p.mensagem}</p>
                        )}
                      </div>
                      <span className="text-[#333] text-[10px] font-mono flex-shrink-0">{p.telefone}</span>
                    </div>
                  </div>
                ))}

                {/* Aguardando */}
                {aguardando && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#FF4D1C]/3 border-t border-[#1f1f1f]">
                    <Clock size={12} className="text-[#FF4D1C] flex-shrink-0 animate-pulse" />
                    <span className="text-[#FF4D1C] text-xs">
                      Aguardando <strong>{aguardando.label}</strong> antes de contatar{aguardando.proximo ? ` "${aguardando.proximo}"` : ''}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configuração SDR */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <button
            onClick={() => setCfgOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Configuração do SDR</h2>
            </div>
            {cfgOpen ? <ChevronUp size={15} className="text-[#444]" /> : <ChevronDown size={15} className="text-[#444]" />}
          </button>

          {cfgOpen && (
            <div className="px-5 pb-5 border-t border-[#1f1f1f] pt-4 space-y-5">
              {/* Meta + delay */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Meta diária</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={5} max={50} step={5}
                      value={cfg.meta_dia}
                      onChange={e => setCfg(c => ({ ...c, meta_dia: +e.target.value }))}
                      className="flex-1 accent-[#FF4D1C]"
                    />
                    <span className="text-white text-sm font-bold w-8 text-right">{cfg.meta_dia}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Delay mínimo (min)</label>
                  <input
                    type="number" min={1} max={60}
                    value={Math.round(cfg.delay_min_seg / 60)}
                    onChange={e => setCfg(c => ({ ...c, delay_min_seg: +e.target.value * 60 }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Delay máximo (min)</label>
                  <input
                    type="number" min={1} max={120}
                    value={Math.round(cfg.delay_max_seg / 60)}
                    onChange={e => setCfg(c => ({ ...c, delay_max_seg: +e.target.value * 60 }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
              </div>

              {/* Horário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Horário início</label>
                  <input
                    type="time"
                    value={cfg.horario_inicio}
                    onChange={e => setCfg(c => ({ ...c, horario_inicio: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Horário fim</label>
                  <input
                    type="time"
                    value={cfg.horario_fim}
                    onChange={e => setCfg(c => ({ ...c, horario_fim: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
              </div>

              {/* IA + Tom */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Toggle active={cfg.usar_ia} onChange={() => setCfg(c => ({ ...c, usar_ia: !c.usar_ia }))} />
                  <div>
                    <p className="text-white text-xs font-medium">Personalizar com IA</p>
                    <p className="text-[#444] text-[10px]">Claude Haiku gera mensagem única por lead</p>
                  </div>
                </div>
                {cfg.usar_ia && (
                  <div className="flex items-center gap-2">
                    <label className="text-[#666] text-xs font-medium">Tom:</label>
                    {['casual', 'misto', 'profissional'].map(t => (
                      <button
                        key={t}
                        onClick={() => setCfg(c => ({ ...c, tom: t }))}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                          cfg.tom === t
                            ? 'bg-[#FF4D1C]/15 border-[#FF4D1C]/40 text-[#FF4D1C]'
                            : 'bg-[#0D0D0D] border-[#1f1f1f] text-[#555] hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Claude API Key */}
              {cfg.usar_ia && (
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-2">Claude API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-ant-..."
                      value={cfg.claude_api_key}
                      onChange={e => setCfg(c => ({ ...c, claude_api_key: e.target.value }))}
                      className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-[#FF4D1C]/50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-[#444] text-[10px] mt-1">Armazenada no servidor, nunca exposta ao browser</p>
                </div>
              )}

              <button
                onClick={salvarConfig}
                disabled={salvando}
                className="w-full bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </div>
          )}
        </div>

        {/* Fluxo de abordagem */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={15} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Fluxo de Abordagem</h2>
            <span className="text-[10px] text-[#555] ml-1">— clique no lápis para editar</span>
          </div>

          <div className="space-y-0">
            <FluxoStep icon={MessageSquare} cor="bg-[#FF4D1C]" label="D+0 — Mensagem de abertura">
              <EditableMsg label="Mensagem inicial" value={msgs.d0} onChange={v => setMsgs(m => ({ ...m, d0: v }))} badge="Enviada ao captar lead" />
            </FluxoStep>

            <FluxoStep icon={ArrowRight} cor="bg-yellow-500" label="D+1 — Follow-up (sem resposta)">
              <EditableMsg label="Follow-up automático" value={msgs.d1} onChange={v => setMsgs(m => ({ ...m, d1: v }))} badge="24h sem resposta" />
            </FluxoStep>

            <FluxoStep icon={MessageSquare} cor="bg-purple-500" label="D+3 — Última tentativa">
              <EditableMsg label="Última tentativa" value={msgs.d3} onChange={v => setMsgs(m => ({ ...m, d3: v }))} badge="72h sem resposta" />
            </FluxoStep>

            <div className="ml-[52px] grid grid-cols-2 gap-3 mb-6">
              <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold">Interessado</span>
                </div>
                <p className="text-[#555] text-xs leading-relaxed">Lucas qualifica → envia link do trial → tenta fechar</p>
              </div>
              <div className="bg-[#FF4D1C]/5 border border-[#FF4D1C]/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <PhoneCall size={13} className="text-[#FF4D1C]" />
                  <span className="text-[#FF4D1C] text-xs font-semibold">Não fecha sozinho</span>
                </div>
                <p className="text-[#555] text-xs leading-relaxed">Propõe ligação com consultor → notifica você</p>
              </div>
            </div>

            <FluxoStep icon={TrendingUp} cor="bg-emerald-500" label="Fechamento" last>
              <div className="bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl p-3">
                <p className="text-[#666] text-xs">Lead converte → status muda para <strong className="text-emerald-400">Trial</strong> automaticamente</p>
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
              <span className="text-[10px] text-[#555]">— Lucas usa isso para responder dúvidas</span>
            </div>
            {baseOpen ? <ChevronUp size={15} className="text-[#444]" /> : <ChevronDown size={15} className="text-[#444]" />}
          </button>

          {baseOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-[#1f1f1f] pt-4">
              {[
                { key: 'produto',      label: 'O que é o produto' },
                { key: 'features',     label: 'Principais funcionalidades' },
                { key: 'preco',        label: 'Preços e planos' },
                { key: 'diferenciais', label: 'Diferenciais' },
                { key: 'objecoes',     label: 'Objeções comuns e respostas' },
              ].map(({ key, label }) => (
                <EditableMsg key={key} label={label} value={base[key]} onChange={v => setBase(b => ({ ...b, [key]: v }))} />
              ))}
              <button
                onClick={salvarConfig}
                disabled={salvando}
                className="w-full bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar base de conhecimento'}
              </button>
            </div>
          )}
        </div>

        {/* Log do SDR */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Log de Disparos</h2>
            </div>
            <button onClick={fetchLogs} className="text-[#444] hover:text-white transition-colors text-xs">
              Atualizar
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-[#444] text-xs">
              Nenhum disparo registrado ainda. Inicie o SDR para começar.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#1f1f1f]">
                    {['Horário', 'Lead', 'Mensagem', 'Status'].map(h => (
                      <th key={h} className="text-left text-[#444] text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D] transition-colors">
                      <td className="px-4 py-2.5 text-[#444] text-xs font-mono whitespace-nowrap">
                        {log.criado_em?.slice(11, 16) || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-white text-xs font-medium max-w-[140px]">
                        <span className="truncate block">{log.lead_nome || log.telefone}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[#555] text-xs max-w-[260px]">
                        <span className="truncate block">{log.mensagem}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          log.status === 'ok'   ? 'bg-emerald-400/10 text-emerald-400' :
                                                  'bg-red-400/10 text-red-400'
                        }`}>
                          {log.status === 'ok' ? 'Enviado' : 'Erro'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
