import { TrendingUp, TrendingDown, Users, Phone, FlaskConical, BarChart3, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { kpiData, leadsOverTime, sourceData } from '../data/mockData'

const iconMap = {
  leads: Users,
  contact_rate: Phone,
  trials: FlaskConical,
  conversion: BarChart3,
  revenue: DollarSign,
}

function KpiCard({ kpi }) {
  const Icon = iconMap[kpi.id]
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-3 hover:border-[#FF4D1C]/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[#888] text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#FF4D1C]/10 flex items-center justify-center">
          <Icon size={15} className="text-[#FF4D1C]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{kpi.value}</div>
      <div className="flex items-center gap-1.5">
        {kpi.positive ? (
          <TrendingUp size={13} className="text-emerald-400" />
        ) : (
          <TrendingDown size={13} className="text-red-400" />
        )}
        <span className={`text-xs font-semibold ${kpi.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {kpi.change}
        </span>
        <span className="text-[#555] text-xs">{kpi.period}</span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-xs">
        <p className="text-[#888] mb-2 font-medium">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-[#555] text-sm mt-0.5">Visão geral de marketing e vendas — Abril 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#888] text-xs">Ao vivo</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-sm font-semibold">Evolução Semanal</h2>
            <div className="flex items-center gap-4 text-xs text-[#555]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4D1C] inline-block" />Leads</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF8C5A] inline-block" />Trials</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Clientes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={leadsOverTime} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D1C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4D1C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTrials" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8C5A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF8C5A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="week" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#FF4D1C" strokeWidth={2} fill="url(#colorLeads)" dot={false} />
              <Area type="monotone" dataKey="trials" name="Trials" stroke="#FF8C5A" strokeWidth={2} fill="url(#colorTrials)" dot={false} />
              <Area type="monotone" dataKey="clientes" name="Clientes" stroke="#34d399" strokeWidth={2} fill="url(#colorClientes)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-5">Leads por Fonte</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#888' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[#888]">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h2 className="text-white text-sm font-semibold mb-4">Últimas Atividades</h2>
        <div className="space-y-3">
          {[
            { text: 'Novo lead captado: Pizzaria Dom Pepe (Google Maps)', time: '2min atrás', color: 'bg-[#FF4D1C]' },
            { text: 'Follow-up enviado para Burger Rei via WhatsApp', time: '15min atrás', color: 'bg-blue-500' },
            { text: 'Trial iniciado: Esfiharia Arábia', time: '1h atrás', color: 'bg-purple-500' },
            { text: 'Conversão confirmada: Bar do Zé → Cliente', time: '3h atrás', color: 'bg-emerald-500' },
            { text: 'Lead perdido: Kebab Istambul (sem resposta)', time: '5h atrás', color: 'bg-[#444]' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
              <p className="text-[#888] text-xs flex-1">{item.text}</p>
              <span className="text-[#444] text-xs flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
