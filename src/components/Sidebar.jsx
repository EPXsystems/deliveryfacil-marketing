import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Bot,
  Crosshair,
  MessageCircle,
  Settings,
  Workflow,
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/captacao',       icon: Crosshair,       label: 'Captação' },
  { to: '/pipeline',       icon: KanbanSquare,    label: 'Pipeline' },
  { to: '/leads',          icon: Users,           label: 'Leads' },
  { to: '/conversas',      icon: MessageCircle,   label: 'Conversas' },
  { to: '/agente',         icon: Bot,             label: 'Agente' },
  { to: '/automacao',      icon: Workflow,        label: 'Automação' },
  { to: '/configuracoes',  icon: Settings,        label: 'Configurações' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111111] border-r border-[#1f1f1f] flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-[#1f1f1f]">
        <img src="/v4.png" style={{ height: '36px' }} alt="Delivery Fácil" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#FF6000]/15 text-[#FF6000] border border-[#FF6000]/20'
                  : 'text-[#888] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF6000]/20 flex items-center justify-center text-[#FF6000] text-xs font-bold">
            TM
          </div>
          <div className="flex-1">
            <p className="text-white text-xs font-medium">Thomas</p>
            <p className="text-[#555] text-xs">Admin</p>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="text-[#444] hover:text-[#FF6000] transition-colors p-1"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
