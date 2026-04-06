import { useState } from 'react'
import { MessageCircle, BookOpen, FileText, Activity, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react'

const INITIAL_AGENTS = [
  {
    id: 'followup',
    name: 'Follow-up WhatsApp',
    description: 'Envia mensagens automáticas de follow-up para leads que não responderam após 24h. Personaliza a mensagem com o nome do restaurante.',
    icon: MessageCircle,
    color: '#25D366',
    colorBg: 'bg-[#25D366]/10',
    colorText: 'text-[#25D366]',
    colorBorder: 'border-[#25D366]/20',
    active: true,
    lastRun: '2026-04-06 09:14',
    totalActions: 1247,
    todayActions: 18,
    successRate: 94,
    triggers: ['Lead sem resposta há +24h', 'Novo lead captado'],
  },
  {
    id: 'onboarding',
    name: 'Onboarding de Trials',
    description: 'Guia novos clientes em trial pelo processo de configuração. Envia tutoriais em sequência e monitora o engajamento.',
    icon: BookOpen,
    color: '#FF4D1C',
    colorBg: 'bg-[#FF4D1C]/10',
    colorText: 'text-[#FF4D1C]',
    colorBorder: 'border-[#FF4D1C]/20',
    active: true,
    lastRun: '2026-04-06 08:50',
    totalActions: 432,
    todayActions: 6,
    successRate: 88,
    triggers: ['Trial iniciado', 'D+3 sem login', 'D+7 de trial'],
  },
  {
    id: 'content',
    name: 'Agente de Conteúdo',
    description: 'Gera e agenda posts de marketing para Instagram e WhatsApp Status com base no calendário de campanhas.',
    icon: FileText,
    color: '#a855f7',
    colorBg: 'bg-purple-500/10',
    colorText: 'text-purple-400',
    colorBorder: 'border-purple-500/20',
    active: false,
    lastRun: '2026-04-05 18:00',
    totalActions: 89,
    todayActions: 0,
    successRate: 97,
    triggers: ['Agendamento diário 18h', 'Campanha ativada'],
  },
]

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        active ? 'bg-[#FF4D1C]' : 'bg-[#2a2a2a]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function AgentCard({ agent, onToggle }) {
  const Icon = agent.icon
  return (
    <div className={`bg-[#111111] border rounded-2xl p-6 transition-all duration-200 ${
      agent.active ? `${agent.colorBorder} border` : 'border-[#1f1f1f] opacity-70'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${agent.colorBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} style={{ color: agent.color }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">{agent.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {agent.active ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Ativo</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />
                  <span className="text-[#444] text-xs font-medium">Inativo</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Toggle active={agent.active} onChange={() => onToggle(agent.id)} />
      </div>

      {/* Description */}
      <p className="text-[#666] text-xs leading-relaxed mb-5">{agent.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${agent.colorText}`}>{agent.totalActions.toLocaleString('pt-BR')}</div>
          <div className="text-[#444] text-[10px] mt-0.5">Total de ações</div>
        </div>
        <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${agent.active ? agent.colorText : 'text-[#555]'}`}>
            {agent.todayActions}
          </div>
          <div className="text-[#444] text-[10px] mt-0.5">Hoje</div>
        </div>
        <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${agent.successRate >= 90 ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {agent.successRate}%
          </div>
          <div className="text-[#444] text-[10px] mt-0.5">Taxa sucesso</div>
        </div>
      </div>

      {/* Last run */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#1a1a1a]">
        <Clock size={11} className="text-[#444]" />
        <span className="text-[#444] text-xs">Última execução:</span>
        <span className="text-[#666] text-xs font-medium">{agent.lastRun}</span>
      </div>

      {/* Triggers */}
      <div>
        <p className="text-[#444] text-[10px] font-semibold uppercase tracking-wider mb-2">Gatilhos</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.triggers.map(t => (
            <span
              key={t}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                agent.active
                  ? `${agent.colorBg} ${agent.colorText} ${agent.colorBorder}`
                  : 'bg-[#1a1a1a] text-[#444] border-[#222]'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Action button */}
      <button
        disabled={!agent.active}
        className={`w-full mt-5 flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl transition-colors ${
          agent.active
            ? `${agent.colorBg} ${agent.colorText} hover:opacity-80`
            : 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
        }`}
      >
        <Zap size={13} />
        Executar agora
      </button>
    </div>
  )
}

export default function Agents() {
  const [agents, setAgents] = useState(INITIAL_AGENTS)

  function toggle(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const activeCount = agents.filter(a => a.active).length
  const totalActions = agents.reduce((s, a) => s + a.totalActions, 0)
  const todayActions = agents.reduce((s, a) => s + a.todayActions, 0)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Agentes</h1>
            <p className="text-[#555] text-sm mt-0.5">Automações de marketing e vendas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-white font-bold text-lg">{activeCount}/{agents.length}</div>
              <div className="text-[#444] text-[10px]">Ativos</div>
            </div>
            <div className="w-px h-8 bg-[#1f1f1f]" />
            <div className="text-center">
              <div className="text-white font-bold text-lg">{todayActions}</div>
              <div className="text-[#444] text-[10px]">Ações hoje</div>
            </div>
            <div className="w-px h-8 bg-[#1f1f1f]" />
            <div className="text-center">
              <div className="text-white font-bold text-lg">{totalActions.toLocaleString('pt-BR')}</div>
              <div className="text-[#444] text-[10px]">Total histórico</div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className={`mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg w-fit ${
          activeCount > 0
            ? 'bg-emerald-400/5 border border-emerald-400/15 text-emerald-400'
            : 'bg-[#1f1f1f] border border-[#2a2a2a] text-[#555]'
        }`}>
          {activeCount > 0
            ? <><CheckCircle2 size={12} /> {activeCount} agente{activeCount > 1 ? 's' : ''} rodando em segundo plano</>
            : <><AlertCircle size={12} /> Nenhum agente ativo</>
          }
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onToggle={toggle} />
          ))}
        </div>

        {/* Log section */}
        <div className="mt-6 bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-[#FF4D1C]" />
            <h2 className="text-white text-sm font-semibold">Log de Execuções</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { agent: 'Follow-up WhatsApp', action: 'Mensagem enviada para Burger Rei', status: 'ok', time: '09:14' },
              { agent: 'Follow-up WhatsApp', action: '18 leads processados no ciclo', status: 'ok', time: '09:14' },
              { agent: 'Onboarding de Trials', action: 'Tutorial D+1 enviado para Esfiharia Arábia', status: 'ok', time: '08:50' },
              { agent: 'Onboarding de Trials', action: 'Alerta D+3 sem login: Coxinha da Vovó', status: 'warn', time: '08:50' },
              { agent: 'Agente de Conteúdo', action: 'Post agendado para Instagram (18h de ontem)', status: 'ok', time: '17:58' },
              { agent: 'Follow-up WhatsApp', action: '21 leads processados no ciclo anterior', status: 'ok', time: '08:14' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#0D0D0D] last:border-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'ok' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                <span className="text-[#444] text-[10px] font-mono w-8 flex-shrink-0">{log.time}</span>
                <span className="text-[#555] text-xs flex-shrink-0">[{log.agent}]</span>
                <span className="text-[#777] text-xs">{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
