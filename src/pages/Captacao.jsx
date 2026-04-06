import { useState } from 'react'
import {
  Search, MapPin, Phone, Star, Globe, ExternalLink,
  Plus, Loader2, AlertCircle, CheckCircle2, ChevronDown,
} from 'lucide-react'
import { scrapeMaps } from '../api'

const CATEGORIAS = [
  'Pizzaria', 'Hamburgueria', 'Sushi', 'Lanchonete', 'Churrascaria',
  'Açaí', 'Pastelaria', 'Esfiharia', 'Cafeteria', 'Restaurante',
]

const CIDADES = [
  'Campo Bom', 'Novo Hamburgo', 'São Leopoldo', 'Porto Alegre',
  'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria',
  'Gravataí', 'Sapucaia do Sul', 'Sapiranga', 'Dois Irmãos',
]

const QUANTITIES = [10, 20, 50]

export default function Captacao() {
  const [categoria, setCategoria]   = useState('')
  const [cidade, setCidade]         = useState('')
  const [bairro, setBairro]         = useState('')
  const [quantidade, setQuantidade] = useState(10)
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [duplicatas, setDuplicatas] = useState(0)
  const [added, setAdded]           = useState({})

  async function handleSearch(e) {
    e.preventDefault()
    if (!categoria || !cidade) return

    setLoading(true)
    setError('')
    setLeads([])
    setAdded({})
    setDuplicatas(0)

    try {
      const query = bairro.trim()
        ? `${categoria} em ${bairro.trim()} ${cidade}`
        : `${categoria} em ${cidade}`

      const data = await scrapeMaps({ categoria: query, cidade, quantidade })

      setLeads(data.leads || [])
      setDuplicatas(data.duplicatas || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddToPipeline(lead) {
    const existing = JSON.parse(localStorage.getItem('pipeline_leads') || '[]')
    const newLead = {
      id:       lead.id || Date.now(),
      name:     lead.nome,
      phone:    lead.telefone || '',
      source:   'Google Maps',
      status:   'Captado',
      date:     new Date().toISOString().split('T')[0],
      address:  lead.endereco,
      rating:   lead.avaliacao,
      site:     lead.site,
      mapsLink: lead.mapsLink,
    }
    localStorage.setItem('pipeline_leads', JSON.stringify([newLead, ...existing]))
    setAdded(prev => ({ ...prev, [lead.id]: true }))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Captação de Leads</h1>
        <p className="text-[#555] text-sm mt-0.5">Busca automática no Google Maps via scraper</p>
      </div>

      {/* Search form */}
      <div className="px-6 py-5 border-b border-[#1f1f1f] flex-shrink-0">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          {/* Categoria */}
          <div className="min-w-44">
            <label className="text-[#666] text-xs font-medium block mb-1.5">Categoria</label>
            <div className="relative">
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                disabled={loading}
                required
                className="appearance-none w-full bg-[#111111] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FF4D1C]/50 disabled:opacity-50 cursor-pointer"
              >
                <option value="">Selecionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
            </div>
          </div>

          {/* Cidade */}
          <div className="min-w-44">
            <label className="text-[#666] text-xs font-medium block mb-1.5">Cidade</label>
            <div className="relative">
              <select
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                disabled={loading}
                required
                className="appearance-none w-full bg-[#111111] border border-[#1f1f1f] text-white text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FF4D1C]/50 disabled:opacity-50 cursor-pointer"
              >
                <option value="">Selecionar...</option>
                {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
            </div>
          </div>

          {/* Bairro */}
          <div className="flex-1 min-w-36">
            <label className="text-[#666] text-xs font-medium block mb-1.5">Bairro <span className="text-[#444]">(opcional)</span></label>
            <input
              type="text"
              placeholder="Ex: Centro, Scharlau..."
              value={bairro}
              onChange={e => setBairro(e.target.value)}
              disabled={loading}
              className="w-full bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#333] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#FF4D1C]/50 disabled:opacity-50"
            />
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-[#666] text-xs font-medium block mb-1.5">Quantidade</label>
            <div className="flex gap-1">
              {QUANTITIES.map(q => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => setQuantidade(q)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    quantidade === q
                      ? 'bg-[#FF4D1C] text-white'
                      : 'bg-[#111111] border border-[#1f1f1f] text-[#666] hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || !categoria || !cidade}
            className="flex items-center gap-2 bg-[#FF4D1C] hover:bg-[#e63d0e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" />Buscando...</>
            ) : (
              <><Search size={15} />Buscar Leads</>
            )}
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="animate-spin text-[#FF4D1C]" />
            <div className="text-center">
              <p className="text-white text-sm font-medium">Buscando no Google Maps...</p>
              <p className="text-[#444] text-xs mt-1">Isso pode levar até 2 minutos dependendo da quantidade</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FF4D1C]/10 flex items-center justify-center">
              <MapPin size={26} className="text-[#FF4D1C]" />
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-medium">Nenhum lead ainda</p>
              <p className="text-[#444] text-xs mt-1">Selecione categoria e cidade e clique em Buscar Leads</p>
            </div>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[#666] text-sm">
                <span className="text-white font-semibold">{leads.length}</span> novos leads
                {' '}— <span className="text-[#FF4D1C]">{categoria}</span> em <span className="text-[#FF4D1C]">{bairro ? `${bairro}, ` : ''}{cidade}</span>
              </p>
              {duplicatas > 0 && (
                <span className="text-xs text-[#555] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded-lg">
                  {duplicatas} duplicata{duplicatas > 1 ? 's' : ''} ignorada{duplicatas > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="border border-[#1f1f1f] rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#1f1f1f]">
                    {['Nome', 'Endereço', 'Telefone', 'Avaliação', 'Site', 'Maps', 'Ação'].map(h => (
                      <th key={h} className="text-left text-[#444] text-xs font-semibold uppercase tracking-wider px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr key={lead.id || i} className="border-b border-[#111111] hover:bg-[#111111] transition-colors">
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="text-white text-sm font-medium leading-tight line-clamp-2">
                          {lead.nome || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {lead.endereco ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin size={11} className="text-[#444] mt-0.5 flex-shrink-0" />
                            <span className="text-[#666] text-xs leading-tight line-clamp-2">{lead.endereco}</span>
                          </div>
                        ) : <span className="text-[#333] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {lead.telefone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-[#444]" />
                            <span className="text-[#888] text-xs font-mono whitespace-nowrap">{lead.telefone}</span>
                          </div>
                        ) : <span className="text-[#333] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {lead.avaliacao ? (
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs font-medium">{lead.avaliacao}</span>
                          </div>
                        ) : <span className="text-[#333] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {lead.site ? (
                          <a href={lead.site} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                            <Globe size={11} />
                            <span className="max-w-[80px] truncate">{lead.site.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          </a>
                        ) : <span className="text-[#333] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {lead.mapsLink ? (
                          <a href={lead.mapsLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#FF4D1C] hover:text-[#ff6a42] text-xs transition-colors">
                            <ExternalLink size={11} />Ver
                          </a>
                        ) : <span className="text-[#333] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {added[lead.id] ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={13} />Adicionado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddToPipeline(lead)}
                            className="flex items-center gap-1.5 bg-[#FF4D1C]/10 hover:bg-[#FF4D1C]/20 border border-[#FF4D1C]/20 text-[#FF4D1C] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <Plus size={12} />Pipeline
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
