import { useState, useEffect, useRef } from 'react'
import {
  Zap, Calendar, Settings2, RefreshCw, TrendingUp,
  Plus, Trash2, Play, Loader2, CheckCircle2, XCircle,
  Clock, ArrowRight, ChevronDown, Bike,
} from 'lucide-react'
import { API, authFetch } from '../api'
import TesteBanner from '../components/TesteBanner'

const CATEGORIAS = [
  { valor: 'Hamburgueria',      emoji: '🍔' },
  { valor: 'Pizzaria',          emoji: '🍕' },
  { valor: 'Marmitex',          emoji: '🍱' },
  { valor: 'Açaí',              emoji: '🥤' },
  { valor: 'Frango Grelhados',  emoji: '🍗' },
  { valor: 'Sushi Japonês',     emoji: '🍣' },
  { valor: 'Churrascaria',      emoji: '🥩' },
  { valor: 'Café Padaria',      emoji: '☕' },
  { valor: 'Comida Mexicana',   emoji: '🌮' },
  { valor: 'Comida Saudável',   emoji: '🥗' },
  { valor: 'Italiana',          emoji: '🍝' },
  { valor: 'Bar Petiscos',      emoji: '🍺' },
  { valor: 'Delivery',          emoji: '🏪' },
]

const CIDADES = [
  'Campo Bom', 'Novo Hamburgo', 'São Leopoldo', 'Canoas', 'Porto Alegre',
  'Gramado', 'Caxias do Sul', 'Pelotas', 'Santa Maria', 'Passo Fundo',
  'Florianópolis', 'Blumenau', 'Joinville', 'Curitiba', 'São Paulo',
]

const QUANTITIES = [10, 20, 50]

// ── Toggle ────────────────────────────────────────────────
function Toggle({ active, onChange, size = 'md' }) {
  const w = size === 'lg' ? 'w-14 h-7' : 'w-10 h-5'
  const b = size === 'lg' ? 'w-6 h-6 top-0.5 left-0.5' : 'w-4 h-4 top-0.5 left-0.5'
  const t = size === 'lg' ? 'translate-x-7' : 'translate-x-5'
  return (
    <button
      onClick={onChange}
      className={`relative ${w} rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-[#FF6000]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute ${b} bg-white rounded-full shadow transition-transform duration-200 ${active ? t : 'translate-x-0'}`} />
    </button>
  )
}

// ── Progress icon ─────────────────────────────────────────
function ProgressIcon({ status }) {
  if (status === 'gerando')  return <Loader2 size={12} className="animate-spin text-yellow-400 flex-shrink-0" />
  if (status === 'enviando') return <Loader2 size={12} className="animate-spin text-[#FF6000] flex-shrink-0" />
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
      {!isLast && <ArrowRight size={14} className="text-[#333] flex-shrink-0" />}
    </div>
  )
}

const REMARKETING_DAYS = [
  { key: 'd1',  label: 'D+1',  desc: 'Follow-up leve — sem cobrança', preview: 'Oi! Passando pra ver se ficou alguma dúvida sobre o Delivery Fácil 😊 | O trial de 15 dias ainda tá disponível.' },
  { key: 'd3',  label: 'D+3',  desc: 'Impacto financeiro — dado concreto', preview: 'Restaurantes que criaram canal próprio economizam em média R$800/mês em comissão. | Vale 5 minutos pra conhecer?' },
  { key: 'd7',  label: 'D+7',  desc: 'Última tentativa — urgência suave', preview: 'Última vez que passo por aqui, prometo 😄 | Se não for o momento certo, tudo bem — fica o contato!' },
  { key: 'd30', label: 'D+30', desc: 'Reativação fria — abordagem nova', preview: 'Oi! Vi que vocês estão entre os mais bem avaliados da região 🔥 | Tenho algo que pode aumentar seu faturamento.' },
]

export default function Automacao() {
  const [modoTeste, setModoTeste]   = useState(false)
  const [testNumber, setTestNumber] = useState('5551981538335')

  // ── Seção 1: Agendamento de captação ─────────────────
  const [agendamentos, setAgendamentos] = useState([])
  const [novoAg, setNovoAg] = useState({
    categoria: '', cidade: '', bairro: '', delivery: false,
    quantidade: 20, horario: '08:00', repetir: true, tipo: 'recorrente', data_unica: '',
  })
  const [salvandoAg, setSalvandoAg]   = useState(false)
  const [executando, setExecutando]   = useState(false)
  const [progresso, setProgresso]     = useState([])
  const [aguardando, setAguardando]   = useState(null)
  const [fase, setFase]               = useState('')
  const [resumo, setResumo]           = useState(null)
  const scrollRef = useRef(null)

  // ── Seção 2: Config SDR ───────────────────────────────
  const [sdrCfg, setSdrCfg] = useState({
    ativo: true, meta_dia: 20,
    horario_inicio: '08:00', horario_fim: '20:00',
    delay_min_seg: 300, delay_max_seg: 720,
  })
  const [salvandoSdr, setSalvandoSdr]     = useState(false)
  const [iniciandoSdr, setIniciandoSdr]   = useState(false)
  const [progressoSdr, setProgressoSdr]   = useState([])
  const [faseSdr, setFaseSdr]             = useState('')
  const [resumoSdr, setResumoSdr]         = useState(null)
  const [aguardandoSdr, setAguardandoSdr] = useState(null)
  const [sdrEstado, setSdrEstado]         = useState(null) // polling persistente
  const scrollSdrRef = useRef(null)
  const sdrPollingRef = useRef(null)

  // ── Seção 3: Remarketing ──────────────────────────────
  const [rmkCfg, setRmkCfg] = useState({
    ativo: true, d1: true, d3: true, d7: true, d30: false,
  })
  const [salvandoRmk, setSalvandoRmk] = useState(false)

  // ── Toast ─────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Seção 4: Funil ────────────────────────────────────
  const [funil, setFunil] = useState({})

  async function pollSdrEstado() {
    try {
      const r = await authFetch(`${API}/api/sdr/estado`)
      const d = await r.json()
      if (d.success) {
        setSdrEstado(d)
        // sincroniza estado local com backend
        if (d.rodando) setIniciandoSdr(true)
        else if (!d.rodando && d.log?.length > 0) setIniciandoSdr(false)
      }
    } catch {}
  }

  async function pararSdr() {
    try {
      await authFetch(`${API}/api/sdr/parar`, { method: 'POST' })
      showToast('Parada solicitada — aguardando lead atual...')
    } catch { showToast('Erro ao solicitar parada', 'erro') }
  }

  useEffect(() => {
    authFetch(`${API}/teste/status`)
      .then(r => r.json())
      .then(d => { if (d.success) { setModoTeste(d.modo_teste); setTestNumber(d.test_number || '5551981538335') } })
      .catch(() => {})
    fetchAgendamentos()
    fetchSdrConfig()
    fetchFunil()
    pollSdrEstado()
    sdrPollingRef.current = setInterval(pollSdrEstado, 2000)
    return () => clearInterval(sdrPollingRef.current)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [progresso, aguardando])

  useEffect(() => {
    if (scrollSdrRef.current) scrollSdrRef.current.scrollTop = scrollSdrRef.current.scrollHeight
  }, [progressoSdr, aguardandoSdr])

  async function fetchAgendamentos() {
    try {
      const r = await authFetch(`${API}/api/automacao/agendamentos`)
      const d = await r.json()
      if (d.success) setAgendamentos(d.agendamentos || [])
    } catch {}
  }

  async function fetchSdrConfig() {
    try {
      const r = await authFetch(`${API}/api/automacao/sdr/config`)
      const d = await r.json()
      if (d.success && d.config) {
        setSdrCfg(c => ({ ...c, ...d.config, horario_inicio: d.config.horario_inicio || '08:00' }))
        if (d.config.remarketing_d1 !== undefined) {
          setRmkCfg({
            ativo:  d.config.remarketing_ativo  ?? true,
            d1:     d.config.remarketing_d1     ?? true,
            d3:     d.config.remarketing_d3     ?? true,
            d7:     d.config.remarketing_d7     ?? true,
            d30:    d.config.remarketing_d30    ?? false,
          })
        }
      }
    } catch {}
  }

  async function fetchFunil() {
    try {
      const r = await authFetch(`${API}/automacao/status`)
      const d = await r.json()
      if (d.success) setFunil(d.funil || {})
    } catch {}
  }

  // ── Agendamento ───────────────────────────────────────
  async function salvarAgendamento() {
    if (!novoAg.cidade || !novoAg.categoria) return
    setSalvandoAg(true)
    try {
      const payload = {
        ...novoAg,
        categoria: novoAg.delivery ? `${novoAg.categoria} delivery` : novoAg.categoria,
        tipo: novoAg.tipo || 'recorrente',
      }
      const r = await authFetch(`${API}/api/automacao/agendamento`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (d.success) {
        setNovoAg(c => ({ ...c, cidade: '' }))
        fetchAgendamentos()
        showToast('Agendamento salvo!')
      } else {
        showToast(d.error || 'Erro ao salvar agendamento', 'erro')
      }
    } catch (e) {
      showToast('Erro ao salvar agendamento', 'erro')
    }
    setSalvandoAg(false)
  }

  async function deletarAgendamento(id) {
    try {
      await authFetch(`${API}/api/automacao/agendamento/${id}`, { method: 'DELETE' })
      fetchAgendamentos()
    } catch {}
  }

  async function executarAgora() {
    if (executando) return
    if (!novoAg.categoria || !novoAg.cidade) {
      showToast('Selecione categoria e cidade primeiro', 'erro')
      return
    }
    setExecutando(true)
    setProgresso([])
    setAguardando(null)
    setFase('')
    setResumo(null)
    try {
      const res = await authFetch(`${API}/api/captacao/executar`, {
        method: 'POST',
        body: JSON.stringify({
          categoria: novoAg.delivery ? `${novoAg.categoria} delivery` : novoAg.categoria,
          cidade: novoAg.cidade,
          quantidade: novoAg.quantidade,
        }),
      })
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
              setFase(`Captados: ${evt.captados} novos leads (${evt.duplicatas} ignoradas)`)
            } else if (evt.tipo === 'captacao_erro') {
              setFase(`Captação: ${evt.msg} — continuando com leads existentes`)
            } else if (evt.tipo === 'progresso') {
              setAguardando(null)
              setProgresso(prev => {
                const idx = prev.findIndex(p => p.lead === evt.lead)
                if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], ...evt }; return next }
                return [...prev, evt]
              })
            } else if (evt.tipo === 'aguardando') {
              setAguardando(evt)
            } else if (evt.tipo === 'fim') {
              setAguardando(null)
              setResumo(evt)
              fetchFunil()
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

  // ── SDR Iniciar ──────────────────────────────────────
  async function iniciarSdrAgora() {
    if (iniciandoSdr) return
    if (!sdrCfg.ativo) {
      showToast('SDR está pausado — ative o toggle antes de iniciar', 'erro')
      return
    }
    setIniciandoSdr(true)
    setProgressoSdr([])
    setFaseSdr('Conectando ao servidor...')
    setResumoSdr(null)
    setAguardandoSdr(null)
    try {
      const res = await authFetch(`${API}/api/sdr/iniciar`, {
        method: 'POST',
        body: JSON.stringify({ forcar: true }),
      })
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
              setFaseSdr(`Iniciando disparo para ${evt.total} leads...`)
            } else if (evt.tipo === 'aviso') {
              setFaseSdr(`⚠ ${evt.msg}`)
            } else if (evt.tipo === 'progresso') {
              setAguardandoSdr(null)
              if (evt.atual && evt.total) setFaseSdr(`Disparando ${evt.atual} de ${evt.total}...`)
              setProgressoSdr(prev => {
                const idx = prev.findIndex(p => p.lead === evt.lead)
                if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], ...evt }; return next }
                return [...prev, evt]
              })
            } else if (evt.tipo === 'aguardando') {
              setAguardandoSdr(evt)
            } else if (evt.tipo === 'fim') {
              setAguardandoSdr(null)
              setResumoSdr(evt)
              fetchFunil()
            } else if (evt.tipo === 'erro') {
              setAguardandoSdr(null)
              setResumoSdr({ erro: evt.msg })
            }
          } catch {}
        }
      }
    } catch (e) {
      setResumoSdr({ erro: e.message })
    }
    setIniciandoSdr(false)
  }

  // ── SDR Config ────────────────────────────────────────
  async function salvarSdrConfig() {
    setSalvandoSdr(true)
    try {
      const r = await authFetch(`${API}/api/automacao/sdr/config`, {
        method: 'POST',
        body: JSON.stringify({
          ...sdrCfg,
          remarketing_ativo: rmkCfg.ativo,
          remarketing_d1:    rmkCfg.d1,
          remarketing_d3:    rmkCfg.d3,
          remarketing_d7:    rmkCfg.d7,
          remarketing_d30:   rmkCfg.d30,
        }),
      })
      const d = await r.json()
      if (d.success) showToast('Configurações salvas!')
      else showToast(d.error || 'Erro ao salvar', 'erro')
    } catch {
      showToast('Erro ao salvar configurações', 'erro')
    }
    setSalvandoSdr(false)
  }

  // ── Remarketing ───────────────────────────────────────
  async function salvarRemarketing() {
    setSalvandoRmk(true)
    try {
      await authFetch(`${API}/api/automacao/sdr/config`, {
        method: 'POST',
        body: JSON.stringify({
          remarketing_ativo: rmkCfg.ativo,
          remarketing_d1:    rmkCfg.d1,
          remarketing_d3:    rmkCfg.d3,
          remarketing_d7:    rmkCfg.d7,
          remarketing_d30:   rmkCfg.d30,
        }),
      })
    } catch {}
    setSalvandoRmk(false)
  }

  // ── Funil data ────────────────────────────────────────
  const funilSteps = [
    { label: 'Captados',    value: funil.captados    || 0, cor: 'text-white' },
    { label: 'Contatados',  value: funil.contatados  || 0, cor: 'text-[#FF6000]' },
    { label: 'Responderam', value: funil.responderam || 0, cor: 'text-yellow-400' },
    { label: 'Trial',       value: funil.trial       || 0, cor: 'text-blue-400' },
    { label: 'Clientes',    value: funil.clientes    || 0, cor: 'text-emerald-400' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {modoTeste && <TesteBanner testNumber={testNumber} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl transition-all ${
          toast.type === 'erro' ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
        }`}>
          {toast.type === 'erro' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-[#FF6000]" /> Automação
        </h1>
        <p className="text-[#555] text-sm mt-0.5">Captação, SDR e remarketing automático</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* ── SEÇÃO 1: Agendamento de Captação ─────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={15} className="text-[#FF6000]" />
            <h2 className="text-white text-sm font-semibold">Agendamento de Captação</h2>
          </div>

          {/* Form — linha 1: categoria + cidade + bairro */}
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="min-w-40">
              <label className="text-[#666] text-xs font-medium block mb-1.5">Categoria</label>
              <div className="relative">
                <select
                  value={novoAg.categoria}
                  onChange={e => setNovoAg(c => ({ ...c, categoria: e.target.value }))}
                  className="appearance-none w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#FF6000]/50 cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {CATEGORIAS.map(cat => <option key={cat.valor} value={cat.valor}>{cat.emoji} {cat.valor}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
              </div>
            </div>

            <div className="min-w-40">
              <label className="text-[#666] text-xs font-medium block mb-1.5">Cidade</label>
              <div className="relative">
                <select
                  value={novoAg.cidade}
                  onChange={e => setNovoAg(c => ({ ...c, cidade: e.target.value }))}
                  className="appearance-none w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#FF6000]/50 cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {CIDADES.map(cid => <option key={cid} value={cid}>{cid}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-32">
              <label className="text-[#666] text-xs font-medium block mb-1.5">Bairro <span className="text-[#444]">(opcional)</span></label>
              <input
                type="text"
                placeholder="Ex: Centro..."
                value={novoAg.bairro}
                onChange={e => setNovoAg(c => ({ ...c, bairro: e.target.value }))}
                className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50 placeholder-[#333]"
              />
            </div>
          </div>

          {/* Form — tipo: recorrente / único */}
          <div className="flex items-center gap-3 mb-3">
            <label className="text-[#666] text-xs font-medium">Tipo:</label>
            {['recorrente', 'unico'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setNovoAg(c => ({ ...c, tipo: t, repetir: t === 'recorrente' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  novoAg.tipo === t
                    ? t === 'recorrente'
                      ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                      : 'bg-yellow-400/15 border-yellow-400/40 text-yellow-400'
                    : 'bg-[#0D0D0D] border-[#1f1f1f] text-[#555] hover:text-white'
                }`}
              >
                {t === 'recorrente' ? 'Recorrente (diário)' : 'Único (uma vez)'}
              </button>
            ))}
          </div>

          {/* Data única — só aparece quando tipo === unico */}
          {novoAg.tipo === 'unico' && (
            <div className="flex items-center gap-3 mb-3">
              <div>
                <label className="text-[#666] text-xs font-medium block mb-1.5">Data</label>
                <input
                  type="date"
                  value={novoAg.data_unica}
                  onChange={e => setNovoAg(c => ({ ...c, data_unica: e.target.value }))}
                  className="bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
                />
              </div>
            </div>
          )}

          {/* Form — linha 2: delivery + quantidade + horário + repetir */}
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Delivery</label>
              <button
                type="button"
                onClick={() => setNovoAg(c => ({ ...c, delivery: !c.delivery }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  novoAg.delivery
                    ? 'bg-[#FF6000]/15 border-[#FF6000]/40 text-[#FF6000]'
                    : 'bg-[#0D0D0D] border-[#1f1f1f] text-[#666] hover:text-white'
                }`}
              >
                <Bike size={14} />
                {novoAg.delivery ? 'Ativo' : 'Incluir'}
              </button>
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Quantidade</label>
              <div className="flex gap-1">
                {QUANTITIES.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setNovoAg(c => ({ ...c, quantidade: q }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      novoAg.quantidade === q
                        ? 'bg-[#FF6000] text-white'
                        : 'bg-[#0D0D0D] border border-[#1f1f1f] text-[#666] hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Horário</label>
              <input
                type="time"
                value={novoAg.horario}
                onChange={e => setNovoAg(c => ({ ...c, horario: e.target.value }))}
                className="bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
              />
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Repetir diariamente</label>
              <div className="flex items-center gap-2 py-2">
                <Toggle active={novoAg.repetir} onChange={() => setNovoAg(c => ({ ...c, repetir: !c.repetir }))} />
                <span className="text-[#555] text-xs">{novoAg.repetir ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={salvarAgendamento}
              disabled={salvandoAg || !novoAg.cidade || !novoAg.categoria}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-white transition-colors"
            >
              <Plus size={14} />
              {salvandoAg ? 'Salvando...' : 'Salvar agendamento'}
            </button>
            <button
              onClick={executarAgora}
              disabled={executando}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                executando ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#FF6000] hover:bg-[#E55500] text-white'
              }`}
            >
              {executando ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {executando ? 'Executando...' : 'Executar agora'}
            </button>
          </div>

          {/* SSE Progress */}
          {(executando || progresso.length > 0 || fase) && (
            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden mt-4">
              {resumo ? (
                <div className={`px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-3 ${resumo.erro ? 'bg-red-400/5' : 'bg-emerald-400/5'}`}>
                  {resumo.erro
                    ? <><XCircle size={14} className="text-red-400" /><span className="text-red-400 text-xs font-semibold">{resumo.erro}</span></>
                    : <><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold">Completo · {resumo.captados || 0} captados · {resumo.contatados || 0} contatados · {resumo.erros || 0} erros</span></>}
                </div>
              ) : fase ? (
                <div className="px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-2 bg-[#FF6000]/5">
                  <Loader2 size={12} className="animate-spin text-[#FF6000]" />
                  <span className="text-[#FF6000] text-xs font-semibold">{fase}</span>
                </div>
              ) : null}
              <div ref={scrollRef} className="max-h-48 overflow-y-auto">
                {progresso.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#0D0D0D] last:border-0">
                    <ProgressIcon status={p.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-medium truncate">{p.lead}</span>
                        {p.status === 'gerando'  && <span className="text-yellow-400 text-[10px]">gerando...</span>}
                        {p.status === 'enviando' && <span className="text-[#FF6000] text-[10px]">enviando...</span>}
                        {p.status === 'ok'       && <span className="text-emerald-400 text-[10px]">enviado</span>}
                        {p.status === 'erro'     && <span className="text-red-400 text-[10px] truncate max-w-[140px]">{p.erro}</span>}
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
                    <Clock size={12} className="text-[#FF6000] animate-pulse flex-shrink-0" />
                    <span className="text-[#FF6000] text-xs">
                      Aguardando <strong>{aguardando.label}</strong>{aguardando.proximo ? ` antes de "${aguardando.proximo}"` : ''}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de agendamentos */}
          {agendamentos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[#444] text-[10px] font-semibold uppercase tracking-wider">Agendamentos salvos</p>
              {agendamentos.map(ag => {
                const concluido = ag.status_ag === 'concluido'
                const unico = ag.tipo === 'unico'
                return (
                  <div key={ag.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${concluido ? 'bg-[#0a0a0a] border-[#1a1a1a] opacity-60' : 'bg-[#0D0D0D] border-[#1a1a1a]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${concluido ? 'bg-[#444]' : unico ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">{ag.categoria} · {ag.bairro ? `${ag.bairro}, ` : ''}{ag.cidade}</p>
                      <p className="text-[#444] text-[10px]">{ag.quantidade} leads · {ag.horario}</p>
                    </div>
                    {concluido ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1f1f1f] text-[#555]">
                        ✓ Concluído {ag.executado_em ? new Date(ag.executado_em).toLocaleDateString('pt-BR') : ''}
                      </span>
                    ) : unico ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                        Único · {ag.horario}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                        Diário · {ag.horario}
                      </span>
                    )}
                    <button
                      onClick={() => deletarAgendamento(ag.id)}
                      className="text-[#333] hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── SEÇÃO 2: SDR — Disparo Automático ────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[#FF6000]" />
              <h2 className="text-white text-sm font-semibold">SDR — Disparo Automático</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sdrCfg.ativo ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[#1f1f1f] text-[#555]'}`}>
                {sdrCfg.ativo ? 'Ativo' : 'Pausado'}
              </span>
              <Toggle active={sdrCfg.ativo} onChange={() => setSdrCfg(c => ({ ...c, ativo: !c.ativo }))} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Meta diária */}
            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">
                Meta diária — <span className="text-white font-bold">{sdrCfg.meta_dia} leads</span>
              </label>
              <input
                type="range" min={5} max={50} step={5}
                value={sdrCfg.meta_dia}
                onChange={e => setSdrCfg(c => ({ ...c, meta_dia: +e.target.value }))}
                className="w-full accent-[#FF6000]"
              />
              <div className="flex justify-between text-[#444] text-[10px] mt-0.5"><span>5</span><span>50</span></div>
            </div>

            {/* Horário de operação */}
            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Horário de operação</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#444] text-[10px] block mb-1">Início</label>
                  <input
                    type="time" value={sdrCfg.horario_inicio}
                    onChange={e => setSdrCfg(c => ({ ...c, horario_inicio: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
                  />
                </div>
                <div>
                  <label className="text-[#444] text-[10px] block mb-1">Fim</label>
                  <input
                    type="time" value={sdrCfg.horario_fim}
                    onChange={e => setSdrCfg(c => ({ ...c, horario_fim: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
                  />
                </div>
              </div>
            </div>

            {/* Delay entre disparos */}
            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Delay entre disparos</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#444] text-[10px] block mb-1">Mínimo (min)</label>
                  <input
                    type="number" min={3} max={30}
                    value={Math.round(sdrCfg.delay_min_seg / 60)}
                    onChange={e => setSdrCfg(c => ({ ...c, delay_min_seg: Math.max(180, +e.target.value * 60) }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
                  />
                </div>
                <div>
                  <label className="text-[#444] text-[10px] block mb-1">Máximo (min)</label>
                  <input
                    type="number" min={3} max={60}
                    value={Math.round(sdrCfg.delay_max_seg / 60)}
                    onChange={e => setSdrCfg(c => ({ ...c, delay_max_seg: Math.max(180, +e.target.value * 60) }))}
                    className="w-full bg-[#0D0D0D] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF6000]/50"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={salvarSdrConfig}
                disabled={salvandoSdr}
                className="flex-1 border border-[#FF6000]/40 hover:border-[#FF6000]/70 disabled:opacity-50 text-[#FF6000] text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {salvandoSdr ? 'Salvando...' : 'Salvar configurações'}
              </button>
              {sdrEstado?.rodando ? (
                <button
                  onClick={pararSdr}
                  className="flex-[1.4] flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  <XCircle size={15} />
                  Parar SDR
                </button>
              ) : (
                <button
                  onClick={iniciarSdrAgora}
                  disabled={iniciandoSdr && !sdrEstado?.rodando}
                  className={`flex-[1.4] flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-colors ${
                    iniciandoSdr
                      ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
                      : 'bg-[#FF6000] hover:bg-[#E55500] text-white'
                  }`}
                >
                  {iniciandoSdr ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                  {iniciandoSdr ? 'Disparando...' : '▶ Iniciar SDR Agora'}
                </button>
              )}
            </div>

            {/* Info fila */}
            <div className="border-t border-[#1a1a1a] pt-3 flex items-center justify-between">
              <span className="text-[#444] text-xs">
                Leads na fila: <span className="text-white font-semibold">{funil.captados || 0} captados</span>
              </span>
              <span className="text-[#444] text-xs">
                Próximo disparo: <span className="text-white font-semibold">hoje às {sdrCfg.horario_inicio}</span>
              </span>
            </div>
          </div>

          {/* Progresso SDR — persiste via polling mesmo trocando de página */}
          {(sdrEstado?.rodando || (sdrEstado?.log?.length > 0)) && (
            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden mt-4">
              {/* Header status */}
              <div className={`px-4 py-2.5 border-b border-[#1f1f1f] flex items-center gap-3 ${sdrEstado.rodando ? 'bg-[#FF6000]/5' : 'bg-[#0D0D0D]'}`}>
                {sdrEstado.rodando
                  ? <><Loader2 size={12} className="animate-spin text-[#FF6000]" /><span className="text-[#FF6000] text-xs font-semibold flex-1">Disparando {sdrEstado.atual || 0}/{sdrEstado.total || 0}{sdrEstado.lead_atual ? ` — ${sdrEstado.lead_atual}` : '...'}</span></>
                  : <><CheckCircle2 size={12} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold flex-1">Concluído · {sdrEstado.enviados || 0} enviados · {sdrEstado.erros || 0} erros</span></>
                }
                {sdrEstado.total > 0 && (
                  <span className="text-[#444] text-[10px] font-mono ml-auto">{sdrEstado.enviados}/{sdrEstado.total}</span>
                )}
              </div>
              {/* Log entries */}
              <div ref={scrollSdrRef} className="max-h-44 overflow-y-auto">
                {(sdrEstado.log || []).map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2 border-b border-[#0D0D0D] last:border-0">
                    <span className="text-[#444] text-[10px] font-mono flex-shrink-0 mt-0.5">{entry.hora}</span>
                    <span className={`text-xs flex-1 ${
                      entry.msg.startsWith('✓') ? 'text-emerald-400' :
                      entry.msg.startsWith('✗') ? 'text-red-400' :
                      entry.msg.startsWith('⚠') ? 'text-yellow-400' :
                      entry.msg.startsWith('⏳') ? 'text-[#FF6000]' :
                      'text-[#666]'
                    }`}>{entry.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SEÇÃO 3: Remarketing Automático ───────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[#FF6000]" />
              <h2 className="text-white text-sm font-semibold">Remarketing Automático</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                rmkCfg.ativo
                  ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#444]'
              }`}>{rmkCfg.ativo ? 'Ativo' : 'Inativo'}</span>
            </div>
            <Toggle active={rmkCfg.ativo} onChange={() => setRmkCfg(c => ({ ...c, ativo: !c.ativo }))} />
          </div>

          <div className="space-y-3 mb-4">
            {REMARKETING_DAYS.map(day => (
              <div key={day.key} className={`rounded-xl border p-3 transition-all ${
                rmkCfg[day.key]
                  ? 'bg-[#FF6000]/5 border-[#FF6000]/20'
                  : 'bg-[#0D0D0D] border-[#1a1a1a]'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      day.key === 'd1'  ? 'bg-yellow-400/10 text-yellow-400' :
                      day.key === 'd3'  ? 'bg-orange-400/10 text-orange-400' :
                      day.key === 'd7'  ? 'bg-red-400/10 text-red-400' :
                                          'bg-purple-400/10 text-purple-400'
                    }`}>{day.label}</span>
                    <span className="text-[#666] text-[10px]">{day.desc}</span>
                  </div>
                  <Toggle
                    active={rmkCfg[day.key]}
                    onChange={() => setRmkCfg(c => ({ ...c, [day.key]: !c[day.key] }))}
                  />
                </div>
                {rmkCfg[day.key] && (
                  <p className="text-[#444] text-[10px] italic pl-1 mt-1 leading-relaxed">&ldquo;{day.preview}&rdquo;</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={salvarRemarketing}
            disabled={salvandoRmk}
            className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            {salvandoRmk ? 'Salvando...' : 'Salvar remarketing'}
          </button>
        </div>

        {/* ── SEÇÃO 4: Funil de Conversão ───────────────────── */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-[#FF6000]" />
            <h2 className="text-white text-sm font-semibold">Funil de Conversão</h2>
            <span className="text-[#444] text-[10px]">dados reais do banco</span>
          </div>
          <div className="flex items-stretch gap-1">
            {funilSteps.map((step, i) => {
              const prev = i > 0 ? funilSteps[i - 1].value : step.value
              const pct  = prev > 0 ? Math.round((step.value / prev) * 100) : (i === 0 ? 100 : 0)
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

      </div>
    </div>
  )
}
