import { useState, useEffect, useRef } from 'react'
import {
  Workflow, Play, Pause, RefreshCw, ChevronRight,
  Loader2, CheckCircle2, XCircle, Clock, Target,
  ArrowRight, TrendingUp, Calendar, RotateCcw,
  AlertCircle, Zap,
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

// ── Progress icon ─────────────────────────────────────────
function ProgressIcon({ status }) {
  if (status === 'gerando')  return <Loader2 size={12} className="animate-spin text-yellow-400 flex-shrink-0" />
  if (status === 'enviando') return <Loader2 size={12} className="animate-spin text-[#FF4D1C] flex-shrink-0" />
  if (status === 'ok')       return <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
  if (status === 'erro')     return <XCircle size={12} className="text-red-400 flex-shrink-0" />
  return <div className="w-3 h-3 rounded-full bg-[#333] flex-shrink-0" />
}

// ── Funil step ────────────────────────────────────────────
function FunilStep({ label, value, pct, cor, isLast }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 text-center">
        <div className={`text-2xl font-bold ${cor}`}>{value}</div>
        <div className="text-[#555] text-[10px] mt-0.5">{label}</div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mt-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-700 ${cor.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {!isLast && (
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <ArrowRight size={14} className="text-[#333]" />
          {pct > 0 && <span className="text-[#444] text-[9px]">{pct}%</span>}
        </div>
      )}
    </div>
  )
}

export default function Automacao() {
  const [modoTeste, setModoTeste]   = useState(false)
  const [testNumber, setTestNumber] = useState('5551981538335')
  const [status, setStatus]         = useState(null)
  const [ativo, setAtivo]           = useState(false)
  const [loading, setLoading]       = useState(true)

  // Cards data
  const [ciclos, setCiclos]       = useState([])
  const [remarketing, setRemarketing] = useState([])

  // Config
  const [cfg, setCfg] = useState({
    meta_dia: 10, delay_min_seg: 60, delay_max_seg: 180,
    horario_inicio: '08:00', horario_fim: '20:00',
    remarketing_ativo: true,
  })
  const [salvando, setSalvando]   = useState(false)

  // Execução
  const [executando, setExecutando] = useState(false)
  const [progresso, setProgresso]   = useState([])
  const [aguardando, setAguardando] = useState(null)
  const [fase, setFase]             = useState('')
  const [resumo, setResumo]         = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/teste/status`)
      .then(r => r.json())
      .then(d => { if (d.success) { setModoTeste(d.modo_teste); setTestNumber(d.test_number || '5551981538335') } })
      .catch(() => {})
    fetchAll()
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [progresso, aguardando])

  async function fetchAll() {
    setLoading(true)
    try {
      const [sRes, cRes, rRes] = await Promise.all([
        fetch(`${API}/automacao/status`).then(r => r.json()),
        fetch(`${API}/automacao/ciclos`).then(r => r.json()),
        fetch(`${API}/automacao/remarketing`).then(r => r.json()),
      ])
      if (sRes.success) {
        setStatus(sRes)
        setAtivo(sRes.ativo)
        setCfg(c => ({
          ...c,
          meta_dia: sRes.hoje?.meta || 10,
        }))
      }
      if (cRes.success) setCiclos(cRes.ciclos || [])
      if (rRes.success) setRemarketing(rRes.remarketing || [])
    } catch {}
    setLoading(false)
  }

  async function handleToggle() {
    const novoAtivo = !ativo
    setAtivo(novoAtivo)
    try {
      await fetch(`${API}/automacao/toggle`, { method: 'POST' })
      fetchAll()
    } catch { setAtivo(!novoAtivo) }
  }

  async function salvarConfig() {
    setSalvando(true)
    try {
      await fetch(`${API}/automacao/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      })
      fetchAll()
    } catch {}
    setSalvando(false)
  }

  async function executarAgora() {
    if (executando) return
    setExecutando(true)
    setProgresso([])
    setAguardando(null)
    setFase('')
    setResumo(null)

    try {
      const res = await fetch(`${API}/automacao/executar-agora`, { method: 'POST' })
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

            if (evt.tipo === 'inicio' || evt.tipo === 'fase') {
              setFase(evt.msg || `Fase: ${evt.fase}`)
            } else if (evt.tipo === 'captacao_ok') {
              setFase(`Captados: ${evt.captados} novos leads (${evt.duplicatas} duplicatas ignoradas)`)
            } else if (evt.tipo === 'captacao_erro') {
              setFase(`Captação: ${evt.msg} — continuando com leads existentes`)
            } else if (evt.tipo === 'progresso') {
              setAguardando(null)
              setProgresso(prev => {
                const idx = prev.findIndex(p => p.lead === evt.lead)
                if (idx >= 0) {
                  const next = [...prev]; next[idx] = { ...next[idx], ...evt }; return next
                }
                return [...prev, evt]
              })
            } else if (evt.tipo === 'aguardando') {
              setAguardando(evt)
            } else if (evt.tipo === 'fim') {
              setAguardando(null)
              setResumo(evt)
              fetchAll()
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

  // Funil
  const f = status?.funil || {}
  const total = (f.captados || 0) + (f.contatados || 0)
  const funilSteps = [
    { label: 'Captados',    value: f.captados    || 0, base: Math.max(1, f.captados || 1),   cor: 'text-white' },
    { label: 'Contatados',  value: f.contatados  || 0, base: Math.max(1, f.captados || 1),    cor: 'text-[#FF4D1C]' },
    { label: 'Responderam', value: f.responderam || 0, base: Math.max(1, f.contatados || 1),  cor: 'text-yellow-400' },
    { label: 'Trial',       value: f.trial       || 0, base: Math.max(1, f.responderam || 1), cor: 'text-blue-400' },
    { label: 'Clientes',    value: f.clientes    || 0, base: Math.max(1, f.trial || 1),        cor: 'text-emerald-400' },
  ]

  const hojeContatados = status?.hoje?.contatados || 0
  const hojeMetaPct    = Math.min(100, Math.round((hojeContatados / (cfg.meta_dia || 10)) * 100))

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#FF4D1C]" />
        <p className="text-[#555] text-sm">Carregando automação...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Modo Teste */}
      {modoTeste && <TesteBanner testNumber={testNumber} />}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Automação</h1>
          <p className="text-[#555] text-sm mt-0.5">
            {status?.proximo_ciclo
              ? <span>{ativo ? '🟢' : '⚫'} {status.proximo_ciclo}</span>
              : 'Ciclo automático diário de captação + SDR'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            status?.executando ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
            ativo              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' :
                                 'bg-[#1a1a1a] border-[#2a2a2a] text-[#555]'
          }`}>
            {status?.executando ? <Loader2 size={11} className="animate-spin" /> :
             ativo              ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> :
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#444]" />}
            {status?.executando ? 'Executando' : ativo ? 'Rodando' : 'Pausado'}
          </div>
          <span className="text-[#666] text-sm font-medium">
            {ativo ? 'LIGADO' : 'DESLIGADO'}
          </span>
          <Toggle active={ativo} onChange={handleToggle} size="lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* ── Card 1: Ciclo de hoje ────────────────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target size={15} className="text-[#FF4D1C]" />
                <h2 className="text-white text-sm font-semibold">Ciclo de Hoje</h2>
                {status?.hoje?.cidade && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4D1C]/10 text-[#FF4D1C] border border-[#FF4D1C]/20">
                    {status.hoje.categoria} · {status.hoje.cidade}
                  </span>
                )}
              </div>
              <p className="text-[#444] text-xs mb-4">
                {hojeContatados} de {cfg.meta_dia} leads contatados hoje
              </p>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-gradient-to-r from-[#FF4D1C] to-[#ff7a52] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${hojeMetaPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[#444] text-[10px]">0</span>
                <span className="text-[#FF4D1C] text-[10px] font-semibold">{hojeMetaPct}%</span>
                <span className="text-[#444] text-[10px]">{cfg.meta_dia}</span>
              </div>
            </div>

            <button
              onClick={executarAgora}
              disabled={executando}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0 ${
                executando
                  ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
                  : 'bg-[#FF4D1C] hover:bg-[#e63d0e] text-white'
              }`}
            >
              {executando ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {executando ? 'Executando...' : 'Executar agora'}
            </button>
          </div>

          {/* SSE Progress */}
          {(executando || progresso.length > 0 || fase) && (
            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden mt-4">
              {/* Status bar */}
              {resumo ? (
                <div className={`px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-3 ${resumo.erro ? 'bg-red-400/5' : 'bg-emerald-400/5'}`}>
                  {resumo.erro
                    ? <><XCircle size={14} className="text-red-400" /><span className="text-red-400 text-xs font-semibold">{resumo.erro}</span></>
                    : <><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold">Ciclo completo · {resumo.captados || 0} captados · {resumo.contatados || 0} contatados · {resumo.erros || 0} erros</span></>
                  }
                </div>
              ) : fase ? (
                <div className="px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-2 bg-[#FF4D1C]/5">
                  <Loader2 size={12} className="animate-spin text-[#FF4D1C]" />
                  <span className="text-[#FF4D1C] text-xs font-semibold">{fase}</span>
                </div>
              ) : null}

              {/* Lead list */}
              <div ref={scrollRef} className="max-h-52 overflow-y-auto">
                {progresso.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#0D0D0D] last:border-0">
                    <ProgressIcon status={p.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-medium truncate">{p.lead}</span>
                        {p.status === 'gerando'  && <span className="text-yellow-400 text-[10px]">gerando...</span>}
                        {p.status === 'enviando' && <span className="text-[#FF4D1C] text-[10px]">enviando...</span>}
                        {p.status === 'ok'       && <span className="text-emerald-400 text-[10px]">enviado</span>}
                        {p.status === 'erro'     && <span className="text-red-400 text-[10px] truncate max-w-[160px]">{p.erro}</span>}
                      </div>
                      {p.mensagem && p.status === 'ok' && (
                        <p className="text-[#444] text-[10px] mt-0.5 truncate">{p.mensagem}</p>
                      )}
                    </div>
                    <span className="text-[#333] text-[10px] font-mono flex-shrink-0">{p.telefone}</span>
                  </div>
                ))}
                {aguardando && (
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-[#1f1f1f]">
                    <Clock size={12} className="text-[#FF4D1C] animate-pulse flex-shrink-0" />
                    <span className="text-[#FF4D1C] text-xs">
                      Aguardando <strong>{aguardando.label}</strong>{aguardando.proximo ? ` antes de "${aguardando.proximo}"` : ''}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Row: Config + Fila ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Card 2: Configurações */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Workflow size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Configurações</h2>
            </div>
            <div className="space-y-4">
              {/* Meta */}
              <div>
                <label className="text-[#666] text-xs font-medium block mb-1.5">
                  Meta diária — <span className="text-white font-bold">{cfg.meta_dia} leads</span>
                </label>
                <input
                  type="range" min={10} max={50} step={5}
                  value={cfg.meta_dia}
                  onChange={e => setCfg(c => ({ ...c, meta_dia: +e.target.value }))}
                  className="w-full accent-[#FF4D1C]"
                />
                <div className="flex justify-between text-[#444] text-[10px] mt-0.5">
                  <span>10</span><span>50</span>
                </div>
              </div>

              {/* Delays */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Delay mínimo (min)</label>
                  <input
                    type="number" min={1} max={30}
                    value={Math.round(cfg.delay_min_seg / 60)}
                    onChange={e => setCfg(c => ({ ...c, delay_min_seg: +e.target.value * 60 }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Delay máximo (min)</label>
                  <input
                    type="number" min={1} max={60}
                    value={Math.round(cfg.delay_max_seg / 60)}
                    onChange={e => setCfg(c => ({ ...c, delay_max_seg: +e.target.value * 60 }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
              </div>

              {/* Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Início</label>
                  <input
                    type="time"
                    value={cfg.horario_inicio}
                    onChange={e => setCfg(c => ({ ...c, horario_inicio: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs font-medium block mb-1.5">Fim</label>
                  <input
                    type="time"
                    value={cfg.horario_fim}
                    onChange={e => setCfg(c => ({ ...c, horario_fim: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF4D1C]/50"
                  />
                </div>
              </div>

              {/* Remarketing toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-medium">Remarketing automático</p>
                  <p className="text-[#444] text-[10px]">D+1, D+3, D+7 e 30 dias</p>
                </div>
                <Toggle
                  active={cfg.remarketing_ativo}
                  onChange={() => setCfg(c => ({ ...c, remarketing_ativo: !c.remarketing_ativo }))}
                />
              </div>

              <button
                onClick={salvarConfig}
                disabled={salvando}
                className="w-full bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </div>
          </div>

          {/* Card 3: Fila de rotação */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Próximos Ciclos</h2>
              <span className="text-[#444] text-[10px]">rotação automática</span>
            </div>
            <div className="space-y-2">
              {(status?.fila || []).length === 0 ? (
                <p className="text-[#444] text-xs text-center py-4">Fila vazia</p>
              ) : (
                (status?.fila || []).map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                      i === 0
                        ? 'bg-[#FF4D1C]/10 border-[#FF4D1C]/25'
                        : 'bg-[#0D0D0D] border-[#1a1a1a]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-[#FF4D1C] text-white' : 'bg-[#1f1f1f] text-[#444]'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${i === 0 ? 'text-white' : 'text-[#666]'}`}>
                        {item.categoria} · {item.cidade}
                      </p>
                      <p className={`text-[10px] ${i === 0 ? 'text-[#FF4D1C]' : 'text-[#444]'}`}>
                        {item.data_prevista}
                      </p>
                    </div>
                    {i === 0 && <ChevronRight size={13} className="text-[#FF4D1C] flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Card 4: Funil completo ───────────────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Funil de Conversão</h2>
            <span className="text-[#444] text-[10px]">dados reais do banco</span>
          </div>
          <div className="flex items-stretch gap-1">
            {funilSteps.map((step, i) => {
              const prev = i > 0 ? funilSteps[i - 1].value : step.value
              const pct  = prev > 0 ? Math.round((step.value / prev) * 100) : 0
              return (
                <FunilStep
                  key={step.label}
                  label={step.label}
                  value={step.value}
                  pct={i === 0 ? 100 : pct}
                  cor={step.cor}
                  isLast={i === funilSteps.length - 1}
                />
              )
            })}
          </div>
        </div>

        {/* ── Card 5: Remarketing ──────────────────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[#FF4D1C]" />
              <h2 className="text-white text-sm font-semibold">Remarketing</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                cfg.remarketing_ativo
                  ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#444]'
              }`}>
                {cfg.remarketing_ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          {remarketing.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#444] text-xs">Nenhum lead pendente de follow-up</p>
              <p className="text-[#333] text-[10px] mt-1">Aparece aqui quando leads são contatados via SDR</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#1f1f1f]">
                    {['Lead', 'Tipo', 'Agendado para', 'Status'].map(h => (
                      <th key={h} className="text-left text-[#444] text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {remarketing.map((r, i) => (
                    <tr key={i} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D] transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-white text-xs font-medium">{r.lead_nome || '—'}</p>
                        <p className="text-[#444] text-[10px] font-mono">{r.telefone}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.tipo === 'D+1' ? 'bg-yellow-400/10 text-yellow-400' :
                          r.tipo === 'D+3' ? 'bg-orange-400/10 text-orange-400' :
                          r.tipo === 'D+7' ? 'bg-red-400/10 text-red-400' :
                                             'bg-purple-400/10 text-purple-400'
                        }`}>{r.tipo}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[#555] text-xs font-mono">{r.agendado_para}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          r.status === 'enviado'  ? 'bg-emerald-400/10 text-emerald-400' :
                          r.status === 'erro'     ? 'bg-red-400/10 text-red-400' :
                                                    'bg-[#1a1a1a] text-[#555]'
                        }`}>
                          {r.status === 'enviado' ? 'Enviado' : r.status === 'erro' ? 'Erro' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Card 6: Histórico de ciclos ──────────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Histórico de Ciclos</h2>
          </div>
          {ciclos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#444] text-xs">Nenhum ciclo executado ainda</p>
              <p className="text-[#333] text-[10px] mt-1">Clique em "Executar agora" para iniciar o primeiro ciclo</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#1f1f1f]">
                    {['Data', 'Cidade', 'Categoria', 'Captados', 'Contatados', 'Respostas', 'Conversões'].map(h => (
                      <th key={h} className="text-left text-[#444] text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ciclos.map(c => (
                    <tr key={c.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D] transition-colors">
                      <td className="px-4 py-2.5 text-[#555] text-xs font-mono whitespace-nowrap">
                        {c.criado_em?.slice(0, 16).replace('T', ' ') || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-white text-xs font-medium">{c.cidade}</td>
                      <td className="px-4 py-2.5 text-[#666] text-xs">{c.categoria}</td>
                      <td className="px-4 py-2.5 text-white text-xs font-bold">{c.captados}</td>
                      <td className="px-4 py-2.5 text-[#FF4D1C] text-xs font-bold">{c.contatados}</td>
                      <td className="px-4 py-2.5 text-yellow-400 text-xs font-bold">{c.respostas}</td>
                      <td className="px-4 py-2.5 text-emerald-400 text-xs font-bold">{c.conversoes}</td>
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
