import { useEffect, useState } from 'react'
import { TrendingUp, Users, Phone, FlaskConical, BarChart3, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { fetchLeads } from '../api'

const STATUS_ORDER = ['Captado', 'Contatado', 'Respondeu', 'Trial', 'Cliente', 'Perdido']

const STATUS_COLOR = {
  Captado:   '#60a5fa',
  Contatado: '#facc15',
  Respondeu: '#c084fc',
  Trial:     '#FF4D1C',
  Cliente:   '#34d399',
  Perdido:   '#444',
}

function pct(n, total) {
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function buildKpis(leads) {
  const total     = leads.length
  const clientes  = leads.filter(l => l.status === 'Cliente').length
  const trials    = leads.filter(l => l.status === 'Trial').length
  const contatado = leads.filter(l => ['Contatado','Respondeu','Trial','Cliente'].includes(l.status)).length
  const trialBase = trials + clientes

  return [
    { id: 'leads',      label: 'Leads Captados',        value: total,                icon: Users },
    { id: 'contact',    label: 'Taxa de Contato',        value: pct(contatado,total), icon: Phone },
    { id: 'trials',     label: 'Trials Abertos',         value: trials,               icon: FlaskConical },
    { id: 'conversion', label: 'Conversão Trial→Cliente',value: pct(clientes,trialBase), icon: BarChart3 },
  ]
}

function buildWeekly(leads) {
  const map = {}
  leads.forEach(l => {
    const d = l.criado_em ? l.criado_em.slice(0, 10) : null
    if (!d) return
    const date = new Date(d)
    const week = `S${Math.ceil(date.getDate() / 7)}`
    if (!map[week]) map[week] = { week, leads: 0, trials: 0, clientes: 0 }
    map[week].leads++
    if (l.status === 'Trial')   map[week].trials++
    if (l.status === 'Cliente') map[week].clientes++
  })
  return Object.values(map).slice(-8)
}

function buildSources(leads) {
  const map = {}
  leads.forEach(l => {
    const f = l.fonte || 'Google Maps'
    map[f] = (map[f] || 0) + 1
  })
  const colors = ['#FF4D1C', '#FF8C5A', '#FFB899', '#60a5fa']
  return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i] || '#888' }))
}

function buildRecent(leads) {
  return [...leads]
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    .slice(0, 5)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-xs">
      <p className="text-[#888] mb-2 font-medium">{label}</p>
      {payload.map(e => (
        <p key={e.name} style={{ color: e.color }} className="font-semibold">
          {e.name}: {e.value}
        </p>
      ))}
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)   return `${Math.round(diff)}s atrás`
  if (diff < 3600) return `${Math.round(diff/60)}min atrás`
  if (diff < 86400)return `${Math.round(diff/3600)}h atrás`
  return `${Math.round(diff/86400)}d atrás`
}

export default function Dashboard() {
  const [leads, setLeads]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const kpis    = buildKpis(leads)
  const weekly  = buildWeekly(leads)
  const sources = buildSources(leads)
  const recent  = buildRecent(leads)

  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6 overflow-auto h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-[#555] text-sm mt-0.5">Visão geral de marketing e vendas</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#888] text-xs">Ao vivo</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#FF4D1C]" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-3 hover:border-[#FF4D1C]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[#888] text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FF4D1C]/10 flex items-center justify-center">
                    <kpi.icon size={15} className="text-[#FF4D1C]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{kpi.value}</div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span className="text-xs text-[#555]">dados reais</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-sm font-semibold">Evolução Semanal</h2>
                <div className="flex items-center gap-4 text-xs text-[#555]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4D1C] inline-block"/>Leads</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF8C5A] inline-block"/>Trials</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Clientes</span>
                </div>
              </div>
              {weekly.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-[#333] text-sm">
                  Nenhum dado ainda — capture leads na página de Captação
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4D1C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF4D1C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gTrials" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8C5A" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF8C5A" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gClientes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f"/>
                    <XAxis dataKey="week" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="leads"    name="Leads"    stroke="#FF4D1C" strokeWidth={2} fill="url(#gLeads)"    dot={false}/>
                    <Area type="monotone" dataKey="trials"   name="Trials"   stroke="#FF8C5A" strokeWidth={2} fill="url(#gTrials)"   dot={false}/>
                    <Area type="monotone" dataKey="clientes" name="Clientes" stroke="#34d399" strokeWidth={2} fill="url(#gClientes)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Pie */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <h2 className="text-white text-sm font-semibold mb-5">Leads por Status</h2>
              {sources.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-[#333] text-sm text-center px-4">
                  Nenhum lead ainda
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={sources} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {sources.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', fontSize:'12px' }}
                      itemStyle={{ color:'#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="space-y-2 mt-2">
                {STATUS_ORDER.filter(s => statusCounts[s] > 0).map(s => (
                  <div key={s} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }}/>
                      <span className="text-[#888]">{s}</span>
                    </div>
                    <span className="text-white font-semibold">{statusCounts[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent leads */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-4">Últimos Leads Captados</h2>
            {recent.length === 0 ? (
              <p className="text-[#333] text-sm text-center py-6">Nenhum lead captado ainda.</p>
            ) : (
              <div className="space-y-3">
                {recent.map(l => (
                  <div key={l.id} className="flex items-center gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[l.status] || '#888' }}/>
                    <p className="text-[#888] text-xs flex-1">
                      Lead captado: <span className="text-white">{l.nome}</span>
                      {l.cidade ? ` — ${l.cidade}` : ''}
                    </p>
                    <span className="text-[#444] text-xs flex-shrink-0">{timeAgo(l.criado_em)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
