import { useState } from 'react'
import { AlertTriangle, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { API } from '../api'

export default function TesteBanner({ testNumber = '5551981538335' }) {
  const [msg, setMsg]         = useState('Olá! Mensagem de teste do sistema Delivery Fácil.')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null) // { ok, texto }

  async function enviarTeste() {
    if (!msg.trim() || enviando) return
    setEnviando(true)
    setResultado(null)
    try {
      const r = await fetch(`${API}/teste/enviar-mensagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: msg }),
      })
      const data = await r.json()
      if (data.success) {
        setResultado({ ok: true, texto: `Enviado para +${testNumber.replace(/\D/g, '').slice(-11)}` })
      } else {
        setResultado({ ok: false, texto: data.error || 'Erro ao enviar' })
      }
    } catch (e) {
      setResultado({ ok: false, texto: e.message })
    }
    setEnviando(false)
    setTimeout(() => setResultado(null), 5000)
  }

  const numDisplay = testNumber.replace(/\D/g, '').slice(-11)

  return (
    <div className="bg-red-500/8 border-b border-red-500/25 px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-red-400 text-xs font-semibold">
            MODO TESTE — nenhuma mensagem enviada para leads reais
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Resultado */}
        {resultado && (
          <span className={`text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${
            resultado.ok ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {resultado.ok
              ? <CheckCircle2 size={12} />
              : <XCircle size={12} />}
            {resultado.texto}
          </span>
        )}

        {/* Input + botão */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && enviarTeste()}
            placeholder="Mensagem de teste..."
            className="bg-[#0D0D0D] border border-red-500/30 text-white placeholder-[#444] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500/60 w-52"
          />
          <button
            onClick={enviarTeste}
            disabled={enviando || !msg.trim()}
            className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {enviando
              ? <Loader2 size={11} className="animate-spin" />
              : <Send size={11} />}
            Testar → {numDisplay}
          </button>
        </div>
      </div>
    </div>
  )
}
