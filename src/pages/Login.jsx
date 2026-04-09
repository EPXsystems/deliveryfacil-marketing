import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2, AlertCircle } from 'lucide-react'
import { login } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#FF4D1C] flex items-center justify-center">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Delivery Fácil</p>
            <p className="text-[#FF4D1C] text-xs font-medium">Marketing OS</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8">
          <h1 className="text-white font-bold text-xl mb-1">Entrar</h1>
          <p className="text-[#555] text-sm mb-7">Acesse o painel de marketing</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="seu@email.com"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4D1C]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium block mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] text-white placeholder-[#333] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4D1C]/50 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
