import { useEffect, useState, useCallback } from 'react'
import { Users, Phone, TrendingUp, FlaskConical, Loader2, Bot, ArrowRight } from 'lucide-react'
import { API, authFetch } from '../api'

const AGENTES_DEF = [
  { nome: 'THOMAS',  label: 'Thomas',  papel: 'SDR + Closer',  cor: '#FF6000', metricaLabel: 'Conversão'    },
  { nome: 'SOFIA',   label: 'Sofia',   papel: 'Suporte',        cor: '#60a5fa', metricaLabel: 'Resolução'    },
  { nome: 'ANA',     label: 'Ana',     papel: 'Reativação',     cor: '#c084fc', metricaLabel: 'Reengajamento'},
  { nome: 'MAX',     label: 'Max',     papel: 'Onboarding',     cor: '#34d399', metricaLabel: 'Configurados' },
  { nome: 'DOUGLAS', label: 'Douglas', papel: 'Financeiro',     cor: '#facc15', metricaLabel: 'Retidos'      },
]

const AGENTE_COR = {
  THOMAS: '#FF6000', SOFIA: '#60a5fa', ANA: '#c084fc',
  MAX: '#34d399', DOUGLAS: '#facc15', SISTEMA: '#555', SUPORTE: '#60a5fa',
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-3 hover:border-[#FF6000]/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[#888] text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#FF6000]/10 flex items-center justify-center">
          <Icon size={15} className="text-[#FF6000]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">
        {loading
          ? <div className="w-12 h-7 bg-[#1f1f1f] rounded animate-pulse" />
          : value}
      </div>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────
function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-[#FF6000]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute w-4 h-4 top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ── Agent Card ────────────────────────────────────────────
function AgentCard({ agente }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    authFetch(`${API}/api/agents/${agente.nome}/status`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [agente.nome])

  async function handleToggle() {
    setToggling(true)
    try {
      const r = await authFetch(`${API}/api/agents/${agente.nome}/toggle`, { method: 'PATCH' })
      const d = await r.json()
      if (d.success) setData(prev => ({ ...prev, ativo: d.ativo }))
    } catch {}
    setToggling(false)
  }

  const ativo = loading ? true : (data?.ativo !== false)

  return (
    <div className={`bg-[#1a1a1a] border rounded-xl p-4 flex flex-col gap-3 transition-all ${
      ativo ? 'border-[#FF6000]/20 hover:border-[#FF6000]/40' : 'border-[#222] opacity-60'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ativo ? '#34d399' : '#555' }} />
          <span className="text-white text-sm font-semibold">{agente.label}</span>
          <span className="text-[#555] text-xs">— {agente.papel}</span>
        </div>
        <Toggle active={ativo} onChange={handleToggle} />
      </div>
      <div className="flex items-center gap-6">
        <div>
          <p className="text-[#555] text-[10px] uppercase tracking-wider">Conversas hoje</p>
          <p className="text-white text-lg font-bold mt-0.5">
            {loading ? <span className="text-[#333]">—</span> : (data?.conversas_hoje ?? 0)}
          </p>
        </div>
        <div>
          <p className="text-[#555] text-[10px] uppercase tracking-wider">{agente.metricaLabel}</p>
          <p className="text-[#333] text-lg font-bold mt-0.5">—</p>
        </div>
      </div>
    </div>
  )
}

// ── Funil Bar ─────────────────────────────────────────────
function FunilBar({ funil }) {
  const steps = [
    { label: 'Captados',    value: funil.captados    || 0, cor: 'bg-white'       },
    { label: 'Contatados',  value: funil.contatados  || 0, cor: 'bg-[#FF6000]'   },
    { label: 'Responderam', value: funil.responderam || 0, cor: 'bg-yellow-400'  },
    { label: 'Trial',       value: funil.trial       || 0, cor: 'bg-blue-400'    },
    { label: 'Clientes',    value: funil.clientes    || 0, cor: 'bg-emerald-400' },
  ]
  const max = steps[0].value || 1
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / max) * 100)
        return (
          <div key={s.label} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 text-center">
              <p className="text-white text-xl font-bold">{s.value}</p>
              <p className="text-[#555] text-[10px] mt-0.5">{s.label}</p>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mt-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${s.cor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            {i < steps.length - 1 && <ArrowRight size={12} className="text-[#333] flex-shrink-0" />}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]           = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [logs, setLogs]             = useState([])
  const [funil, setFunil]           = useState({})

  const fetchStats = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/api/stats/hoje`)
      const d = await r.json()
      if (d.success) setStats(d)
    } catch {}
    setLoadingStats(false)
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/api/roteador/logs`)
      const d = await r.json()
      if (d.success) setLogs(d.logs)
    } catch {}
  }, [])

  const fetchFunil = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/automacao/status`)
      const d = await r.json()
      if (d.success && d.funil) setFunil(d.funil)
    } catch {}
  }, [])

  useEffect(() => {
    fetchStats()
    fetchLogs()
    fetchFunil()
    const id = setInterval(() => { fetchLogs(); fetchStats() }, 5000)
    return () => clearInterval(id)
  }, [fetchStats, fetchLogs, fetchFunil])

  function formatHora(iso) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    catch { return '' }
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-[#555] text-sm mt-0.5">Operação em tempo real</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#888] text-xs">Ao vivo · 5s</span>
        </div>
      </div>

      {/* Seção 1 — KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Leads captados hoje" value={stats?.leads_hoje ?? 0}      icon={Users}        loading={loadingStats} />
        <StatCard label="Contatados hoje"      value={stats?.contatados_hoje ?? 0} icon={Phone}        loading={loadingStats} />
        <StatCard label="Responderam hoje"     value={stats?.responderam_hoje ?? 0} icon={TrendingUp}  loading={loadingStats} />
        <StatCard label="Trials ativos"        value={stats?.trials_ativos ?? 0}   icon={FlaskConical} loading={loadingStats} />
      </div>

      {/* Seção 2 — Agentes */}
      <div>
        <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
          <Bot size={15} className="text-[#FF6000]" /> Agentes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AGENTES_DEF.map(a => <AgentCard key={a.nome} agente={a} />)}
        </div>
      </div>

      {/* Seção 3 — Atividade Roteador */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-3">Atividade do Roteador</h2>
        {logs.length === 0 ? (
          <p className="text-[#444] text-xs text-center py-4 font-mono">Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 font-mono text-xs py-1.5 px-3 rounded-lg bg-[#0D0D0D]">
                <span className="text-[#444] flex-shrink-0 w-20">{formatHora(log.horario)}</span>
                <span className="text-[#555] flex-shrink-0 w-28">{log.numero}</span>
                <span className="font-bold flex-shrink-0 w-20" style={{ color: AGENTE_COR[log.agente] || '#888' }}>
                  {log.agente}
                </span>
                <span className="text-[#666] truncate">{log.motivo}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 4 — Funil */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#FF6000]" /> Funil de Conversão
        </h2>
        <FunilBar funil={funil} />
      </div>
    </div>
  )
}
