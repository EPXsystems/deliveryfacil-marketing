import { useState, useEffect, useRef } from 'react'
import {
  Smartphone, Bot, Bell, CreditCard,
  CheckCircle2, QrCode, Wifi, WifiOff,
  ChevronDown, Loader2, RefreshCw,
} from 'lucide-react'
import { waStatus, waConnect, waQRCode, waDisconnect } from '../api'

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
// estados: 'loading' | 'disconnected' | 'connecting' | 'qrcode' | 'connected'
function TabWhatsApp() {
  const [phase, setPhase]         = useState('loading')
  const [qrcode, setQrcode]       = useState(null)
  const [info, setInfo]           = useState(null)   // { numero, nome, foto }
  const [connectedAt, setConnectedAt] = useState(null)
  const [error, setError]         = useState('')
  const pollRef  = useRef(null)
  const qrRef    = useRef(null)

  // Checa status ao montar
  useEffect(() => {
    checkStatus()
    return () => { clearInterval(pollRef.current); clearInterval(qrRef.current) }
  }, [])

  async function checkStatus() {
    try {
      const s = await waStatus()
      if (s.status === 'connected') {
        setInfo({ numero: s.numero, nome: s.nome, foto: s.foto })
        if (!connectedAt) setConnectedAt(new Date().toLocaleDateString('pt-BR'))
        setPhase('connected')
        clearInterval(pollRef.current)
        clearInterval(qrRef.current)
      } else {
        setPhase(p => p === 'qrcode' ? 'qrcode' : 'disconnected')
      }
    } catch (e) {
      setPhase('disconnected')
    }
  }

  async function handleConnect() {
    setError('')
    setPhase('connecting')
    try {
      const res = await waConnect()
      if (res.status === 'connected') {
        setInfo({ numero: res.numero, nome: res.nome })
        setConnectedAt(new Date().toLocaleDateString('pt-BR'))
        setPhase('connected')
        return
      }
      if (res.qrcode) {
        setQrcode(res.qrcode)
        setPhase('qrcode')
        startPolling()
        startQRRefresh()
      } else {
        throw new Error(res.error || 'Não foi possível obter o QR Code')
      }
    } catch (e) {
      setError(e.message)
      setPhase('disconnected')
    }
  }

  function startPolling() {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const s = await waStatus().catch(() => ({}))
      if (s.status === 'connected') {
        setInfo({ numero: s.numero, nome: s.nome, foto: s.foto })
        setConnectedAt(new Date().toLocaleDateString('pt-BR'))
        setPhase('connected')
        clearInterval(pollRef.current)
        clearInterval(qrRef.current)
      }
    }, 3000)
  }

  function startQRRefresh() {
    clearInterval(qrRef.current)
    qrRef.current = setInterval(async () => {
      const res = await waQRCode().catch(() => ({}))
      if (res.qrcode) setQrcode(res.qrcode)
    }, 30000)
  }

  async function handleDisconnect() {
    setPhase('loading')
    await waDisconnect().catch(() => {})
    setQrcode(null)
    setInfo(null)
    clearInterval(pollRef.current)
    clearInterval(qrRef.current)
    setPhase('disconnected')
  }

  async function handleRefreshQR() {
    const res = await waQRCode().catch(() => ({}))
    if (res.qrcode) setQrcode(res.qrcode)
  }

  // ── Estados de render ─────────────────────────────────

  if (phase === 'loading') return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-[#FF4D1C]" />
    </div>
  )

  if (phase === 'connected') return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-emerald-400/5 border border-emerald-400/20 rounded-2xl px-5 py-5">
        <div className="flex items-center gap-4">
          {info?.foto ? (
            <img src={info.foto} className="w-12 h-12 rounded-full object-cover" alt="foto" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <Wifi size={22} className="text-emerald-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-emerald-400 font-bold text-sm">WhatsApp conectado</p>
            </div>
            {info?.nome && <p className="text-white text-sm font-medium">{info.nome}</p>}
            {info?.numero && <p className="text-[#555] text-xs">+55 {info.numero}</p>}
            {connectedAt && <p className="text-[#444] text-xs mt-0.5">Conectado em {connectedAt}</p>}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 px-4 py-2.5 rounded-lg transition-colors font-semibold"
        >
          Desconectar
        </button>
      </div>
      <div className="flex items-center gap-2 bg-[#0D0D0D] border border-[#1f1f1f] rounded-xl px-4 py-3">
        <CheckCircle2 size={14} className="text-emerald-400" />
        <p className="text-[#666] text-xs">Instância <span className="text-white font-mono">marketing-os</span> ativa e pronta para enviar mensagens</p>
      </div>
    </div>
  )

  if (phase === 'qrcode') return (
    <div className="space-y-5">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-white text-sm font-bold mb-1">Escaneie com seu WhatsApp</p>
          <p className="text-[#555] text-xs">Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
        </div>

        {qrcode ? (
          <div className="relative">
            <img
              src={qrcode}
              alt="QR Code WhatsApp"
              className="w-56 h-56 rounded-xl border-4 border-white"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="#25D366">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 2.824.736 5.476 2.027 7.776L0 32l8.406-2.004A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.003 22.572c-.336.944-1.967 1.752-2.695 1.86-.685.1-1.55.142-2.5-.157-.576-.185-1.317-.43-2.263-.842-3.983-1.72-6.58-5.724-6.778-5.988-.198-.264-1.62-2.155-1.62-4.113s1.026-2.918 1.39-3.314c.364-.396.793-.495.058-.495h.001c.165 0 .33.002.475.008.152.007.355-.058.556.425.208.503.707 1.737.77 1.863.062.126.103.274.02.44-.082.165-.124.267-.247.412-.124.145-.26.324-.372.435-.124.124-.252.258-.108.506.144.247.64 1.056 1.373 1.712.944.84 1.74 1.1 1.987 1.226.247.124.39.103.535-.062.145-.165.621-.724.787-.972.165-.247.33-.206.556-.124.227.083 1.44.68 1.687.804.247.124.412.185.474.289.062.103.062.6-.274 1.544z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-56 h-56 rounded-xl bg-[#0D0D0D] border border-[#2a2a2a] flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#FF4D1C]" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <p className="text-[#444] text-xs">QR Code atualiza automaticamente a cada 30s</p>
          <button
            onClick={handleRefreshQR}
            className="flex items-center gap-1 text-[#FF4D1C] hover:text-[#ff6a42] text-xs transition-colors"
          >
            <RefreshCw size={11} /> Atualizar
          </button>
        </div>

        <div className="flex items-center gap-2 text-yellow-400/80 text-xs bg-yellow-400/5 border border-yellow-400/15 rounded-lg px-3 py-2">
          <Loader2 size={11} className="animate-spin" />
          Aguardando leitura do QR Code...
        </div>
      </div>
    </div>
  )

  if (phase === 'connecting') return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 size={32} className="animate-spin text-[#FF4D1C]" />
      <div className="text-center">
        <p className="text-white text-sm font-semibold">Gerando QR Code...</p>
        <p className="text-[#444] text-xs mt-1">Criando instância marketing-os na Evolution API</p>
      </div>
    </div>
  )

  // disconnected
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center">
            <WifiOff size={22} className="text-[#555]" />
          </div>
          <div>
            <p className="text-[#888] font-semibold text-sm">WhatsApp desconectado</p>
            <p className="text-[#444] text-xs mt-0.5">Conecte para enviar mensagens e usar o agente</p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
        >
          <QrCode size={15} />
          Conectar WhatsApp
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-2.5">{error}</p>
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
