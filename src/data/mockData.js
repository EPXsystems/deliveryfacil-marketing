export const kpiData = [
  {
    id: 'leads',
    label: 'Leads Captados',
    value: '347',
    change: '+18%',
    positive: true,
    period: 'vs. mês anterior',
  },
  {
    id: 'contact_rate',
    label: 'Taxa de Contato',
    value: '68%',
    change: '+5pp',
    positive: true,
    period: 'vs. mês anterior',
  },
  {
    id: 'trials',
    label: 'Trials Abertos',
    value: '84',
    change: '+22%',
    positive: true,
    period: 'vs. mês anterior',
  },
  {
    id: 'conversion',
    label: 'Conversão Trial→Cliente',
    value: '31%',
    change: '-2pp',
    positive: false,
    period: 'vs. mês anterior',
  },
  {
    id: 'revenue',
    label: 'Receita (MRR)',
    value: 'R$ 28.450',
    change: '+12%',
    positive: true,
    period: 'vs. mês anterior',
  },
]

export const leadsOverTime = [
  { week: 'S1', leads: 42, trials: 12, clientes: 4 },
  { week: 'S2', leads: 58, trials: 18, clientes: 6 },
  { week: 'S3', leads: 71, trials: 21, clientes: 7 },
  { week: 'S4', leads: 65, trials: 19, clientes: 5 },
  { week: 'S5', leads: 89, trials: 28, clientes: 9 },
  { week: 'S6', leads: 94, trials: 31, clientes: 11 },
  { week: 'S7', leads: 78, trials: 24, clientes: 8 },
  { week: 'S8', leads: 110, trials: 38, clientes: 14 },
]

export const sourceData = [
  { name: 'Google Maps', value: 52, color: '#FF4D1C' },
  { name: 'Instagram', value: 28, color: '#FF8C5A' },
  { name: 'iFood', value: 20, color: '#FFB899' },
]

export const pipelineLeads = [
  { id: 1, name: 'Pizzaria Dom Pepe', source: 'Google Maps', phone: '(11) 99999-0001', status: 'Captado', date: '2026-04-04' },
  { id: 2, name: 'Burger Rei', source: 'iFood', phone: '(11) 99999-0002', status: 'Captado', date: '2026-04-04' },
  { id: 3, name: 'Sushi Nakamura', source: 'Instagram', phone: '(11) 99999-0003', status: 'Contatado', date: '2026-04-03' },
  { id: 4, name: 'Frango Feliz', source: 'Google Maps', phone: '(11) 99999-0004', status: 'Contatado', date: '2026-04-03' },
  { id: 5, name: 'Taco Loco', source: 'Instagram', phone: '(11) 99999-0005', status: 'Respondeu', date: '2026-04-02' },
  { id: 6, name: 'Padaria São Paulo', source: 'Google Maps', phone: '(11) 99999-0006', status: 'Respondeu', date: '2026-04-02' },
  { id: 7, name: 'Coxinha da Vovó', source: 'iFood', phone: '(11) 99999-0007', status: 'Trial', date: '2026-04-01' },
  { id: 8, name: 'Esfiharia Arábia', source: 'Google Maps', phone: '(11) 99999-0008', status: 'Trial', date: '2026-04-01' },
  { id: 9, name: 'Gelato Primo', source: 'Instagram', phone: '(11) 99999-0009', status: 'Trial', date: '2026-03-31' },
  { id: 10, name: 'Bar do Zé', source: 'Google Maps', phone: '(11) 99999-0010', status: 'Cliente', date: '2026-03-28' },
  { id: 11, name: 'Vegano Natural', source: 'iFood', phone: '(11) 99999-0011', status: 'Cliente', date: '2026-03-25' },
  { id: 12, name: 'Kebab Istambul', source: 'Instagram', phone: '(11) 99999-0012', status: 'Perdido', date: '2026-03-20' },
  { id: 13, name: 'Macarronada da Nonna', source: 'Google Maps', phone: '(11) 99999-0013', status: 'Perdido', date: '2026-03-18' },
]
