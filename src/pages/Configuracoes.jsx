import { useState } from 'react'
import {
  Smartphone, Bot, Bell, CreditCard,
  CheckCircle2, AlertCircle, QrCode, Wifi, WifiOff,
  ChevronDown,
} from 'lucide-react'

const TABS = [
  { id: 'whatsapp',      label: 'WhatsApp',      icon: Smartphone },
  { id: 'agente',        label: 'Agente',         icon: Bot },
  { id: 'notificacoes',  label: 'Notificações',   icon: Bell },
  { id: 'plano',         label: 'Plano',          icon: CreditCard },
]

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-[#FF4D1C]' : 'bg-[#2a2a2a]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-[#888] text-xs font-medium block mb-1.5">{label}</label>
      {hint && <p className="text-[#444] text-[11px] mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50"
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FF4D1C]/50 cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
    </div>
  )
}

function SaveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
    >
      Salvar alterações
    </button>
  )
}

// ─── Aba WhatsApp ──────────────────────────────────────────
function TabWhatsApp() {
  const [conectado, setConectado] = useState(false)
  const [showQr, setShowQr]       = useState(false)

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${
        conectado ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-red-400/5 border-red-400/20'
      }`}>
        <div className="flex items-center gap-3">
          {conectado
            ? <><Wifi size={18} className="text-emerald-400" /><div><p className="text-emerald-400 font-semibold text-sm">WhatsApp conectado</p><p className="text-[#555] text-xs mt-0.5">+55 (51) 99999-0000 · Conectado em 01/04/2026</p></div></>
            : <><WifiOff size={18} className="text-red-400" /><div><p className="text-red-400 font-semibold text-sm">WhatsApp desconectado</p><p className="text-[#555] text-xs mt-0.5">Escaneie o QR Code para conectar</p></div></>
          }
        </div>
        {conectado ? (
          <button
            onClick={() => setConectado(false)}
            className="text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Desconectar
          </button>
        ) : (
          <button
            onClick={() => setShowQr(v => !v)}
            className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <QrCode size={15} />
            {showQr ? 'Ocultar QR Code' : 'Conectar WhatsApp'}
          </button>
        )}
      </div>

      {/* QR Code mock */}
      {showQr && !conectado && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 flex flex-col items-center gap-4">
          <p className="text-white text-sm font-semibold">Escaneie o QR Code com seu WhatsApp</p>
          <p className="text-[#555] text-xs text-center max-w-sm">
            Abra o WhatsApp no seu celular → Menu → Aparelhos conectados → Conectar aparelho → Aponte para o QR Code
          </p>
          {/* QR Code placeholder */}
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="grid grid-cols-8 gap-0.5 p-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white border-2 border-[#FF4D1C] rounded-lg flex items-center justify-center">
                <QrCode size={20} className="text-[#FF4D1C]" />
              </div>
            </div>
          </div>
          <p className="text-[#444] text-xs">QR Code expira em 60 segundos</p>
          <button
            onClick={() => setConectado(true)}
            className="text-xs text-[#FF4D1C] underline underline-offset-2"
          >
            Simular conexão (dev)
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Aba Agente ────────────────────────────────────────────
function TabAgente() {
  const [nome, setNome]         = useState('Assistente Delivery Fácil')
  const [tom, setTom]           = useState('amigavel')
  const [inicio, setInicio]     = useState('08:00')
  const [fim, setFim]           = useState('20:00')
  const [delay, setDelay]       = useState('3')
  const [dias, setDias]         = useState(['seg','ter','qua','qui','sex'])

  const DIAS_SEMANA = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' },
  ]

  function toggleDia(id) {
    setDias(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome do agente">
          <Input value={nome} onChange={setNome} placeholder="Ex: Assistente Delivery Fácil" />
        </Field>
        <Field label="Tom de voz">
          <Select
            value={tom}
            onChange={setTom}
            options={[
              { value: 'formal',    label: 'Formal' },
              { value: 'casual',    label: 'Casual' },
              { value: 'amigavel',  label: 'Amigável' },
            ]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Início do atendimento">
          <Input type="time" value={inicio} onChange={setInicio} />
        </Field>
        <Field label="Fim do atendimento">
          <Input type="time" value={fim} onChange={setFim} />
        </Field>
      </div>

      <Field label="Dias ativos">
        <div className="flex gap-2 flex-wrap">
          {DIAS_SEMANA.map(d => (
            <button
              key={d.id}
              onClick={() => toggleDia(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dias.includes(d.id)
                  ? 'bg-[#FF4D1C] text-white'
                  : 'bg-[#0D0D0D] border border-[#2a2a2a] text-[#555] hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Delay entre mensagens" hint="Tempo mínimo entre envios para parecer mais natural">
        <div className="flex items-center gap-3">
          <Input value={delay} onChange={setDelay} type="number" placeholder="3" />
          <span className="text-[#555] text-sm whitespace-nowrap">minutos</span>
        </div>
      </Field>

      <SaveButton />
    </div>
  )
}

// ─── Aba Notificações ──────────────────────────────────────
function TabNotificacoes() {
  const [notifs, setNotifs] = useState({
    leadRespondeu:    true,
    naoFechado:       true,
    trialExpirando:   false,
  })
  const [email, setEmail] = useState('')

  function toggle(key) {
    setNotifs(n => ({ ...n, [key]: !n[key] }))
  }

  const items = [
    { key: 'leadRespondeu',  label: 'Lead respondeu o agente',                hint: 'Notifica quando um lead responde a primeira mensagem' },
    { key: 'naoFechado',     label: 'Agente não conseguiu fechar',            hint: 'Notifica quando agente propõe ligação com consultor' },
    { key: 'trialExpirando', label: 'Trial expirando em 3 dias',              hint: 'Notifica quando um trial está próximo do vencimento' },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl px-4 py-3.5">
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[#444] text-xs mt-0.5">{item.hint}</p>
            </div>
            <Toggle active={notifs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>

      <Field label="Email para notificações">
        <Input value={email} onChange={setEmail} placeholder="seu@email.com" type="email" />
      </Field>

      <SaveButton />
    </div>
  )
}

// ─── Aba Plano ─────────────────────────────────────────────
function TabPlano() {
  const plano = {
    nome:        'Pro',
    leads_mes:   500,
    leads_usados: 47,
    mensagens_mes: 2000,
    msgs_usadas:   312,
    renovacao:   '2026-05-06',
    valor:       'R$ 397/mês',
  }

  const pct = (used, total) => Math.round((used / total) * 100)

  return (
    <div className="space-y-5">
      {/* Plano atual */}
      <div className="bg-[#FF4D1C]/5 border border-[#FF4D1C]/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#888] text-xs font-medium uppercase tracking-wider">Plano atual</p>
            <p className="text-white text-2xl font-bold mt-1">Pro <span className="text-[#FF4D1C]">✦</span></p>
            <p className="text-[#555] text-sm">{plano.valor} · Renova em {plano.renovacao}</p>
          </div>
          <CheckCircle2 size={32} className="text-[#FF4D1C]" />
        </div>
        <button className="text-xs text-[#FF4D1C] border border-[#FF4D1C]/30 hover:bg-[#FF4D1C]/10 px-4 py-2 rounded-lg transition-colors font-medium">
          Fazer upgrade para Enterprise
        </button>
      </div>

      {/* Uso */}
      <div className="space-y-4">
        {[
          { label: 'Leads captados este mês', used: plano.leads_usados,  total: plano.leads_mes,      unit: 'leads' },
          { label: 'Mensagens enviadas',       used: plano.msgs_usadas,   total: plano.mensagens_mes,  unit: 'msgs' },
        ].map(item => (
          <div key={item.label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="text-[#888] text-xs">{item.used} / {item.total} {item.unit}</span>
            </div>
            <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct(item.used, item.total) > 80 ? 'bg-red-400' : 'bg-[#FF4D1C]'}`}
                style={{ width: `${pct(item.used, item.total)}%` }}
              />
            </div>
            <p className="text-[#444] text-[10px] mt-1.5">{pct(item.used, item.total)}% utilizado</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────
export default function Configuracoes() {
  const [tab, setTab] = useState('whatsapp')

  const tabContent = {
    whatsapp:     <TabWhatsApp />,
    agente:       <TabAgente />,
    notificacoes: <TabNotificacoes />,
    plano:        <TabPlano />,
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Configurações</h1>
        <p className="text-[#555] text-sm mt-0.5">WhatsApp, agente, notificações e plano</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <div className="px-6 pt-5 flex gap-1 border-b border-[#1f1f1f]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                tab === id
                  ? 'text-[#FF4D1C] border-[#FF4D1C] bg-[#FF4D1C]/5'
                  : 'text-[#555] border-transparent hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-w-2xl">
          {tabContent[tab]}
        </div>
      </div>
    </div>
  )
}
