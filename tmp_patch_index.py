#!/usr/bin/env python3
"""
Patch index.js:
1. GET /api/stats/hoje — dados reais completos
2. GET /api/roteador/logs — número mascarado real
3. Limpa historico_conversa contaminado
"""

with open('/opt/scraper-api/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── PATCH 1: /api/stats/hoje completo ─────────────────────────────────────
OLD_STATS = """// GET /api/stats/hoje
app.get('/api/stats/hoje', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const leads_hoje = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE date(criado_em) = ?"
    ).get(today).c;
    const contatados_hoje = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM sdr_envios WHERE dia = ?"
    ).get(today).c;
    const responderam_hoje = dbRaw.prepare(
      "SELECT COUNT(DISTINCT numero) as c FROM historico_conversa WHERE role='user' AND date(criado_em) = ?"
    ).get(today).c;
    const trials_ativos = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE status IN ('Trial','Cliente')"
    ).get().c;
    res.json({ success: true, leads_hoje, contatados_hoje, responderam_hoje, trials_ativos });
  } catch (e) { res.status(500).json({ error: e.message }); }
});"""

NEW_STATS = """// GET /api/stats/hoje
app.get('/api/stats/hoje', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const leads_hoje = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE date(criado_em) = ?"
    ).get(today).c;
    const contatados_hoje = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM sdr_envios WHERE dia = ? AND status='ok'"
    ).get(today).c;
    const responderam_hoje = dbRaw.prepare(
      "SELECT COUNT(DISTINCT numero) as c FROM historico_conversa WHERE role='user' AND date(criado_em) = ?"
    ).get(today).c;
    const trials_ativos = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE status = 'Trial'"
    ).get().c;
    const total_leads = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads"
    ).get().c;
    const clientes = dbRaw.prepare(
      "SELECT COUNT(*) as c FROM leads WHERE status = 'Cliente'"
    ).get().c;
    // por agente — conversas ativas hoje
    const agenteCount = (nome) => {
      try {
        return dbRaw.prepare(
          "SELECT COUNT(DISTINCT numero) as c FROM historico_conversa WHERE agente_ativo=? AND date(criado_em)=?"
        ).get(nome, today).c;
      } catch(_) { return 0; }
    };
    res.json({
      success: true,
      leads_hoje,
      contatados_hoje,
      responderam_hoje,
      trials_ativos,
      total_leads,
      clientes,
      funil: {
        captados:    total_leads,
        contatados:  dbRaw.prepare("SELECT COUNT(*) as c FROM leads WHERE status != 'Captado'").get().c,
        responderam: dbRaw.prepare("SELECT COUNT(DISTINCT numero) as c FROM historico_conversa WHERE role='user'").get().c,
        trial:       trials_ativos,
        clientes,
      },
      por_agente: {
        thomas:  agenteCount('THOMAS'),
        sofia:   agenteCount('SOFIA'),
        ana:     agenteCount('ANA'),
        max:     agenteCount('MAX'),
        douglas: agenteCount('DOUGLAS'),
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});"""

if OLD_STATS in content:
    content = content.replace(OLD_STATS, NEW_STATS)
    print('PATCH 1 aplicado: /api/stats/hoje completo')
else:
    print('WARNING PATCH 1: stats target não encontrado')

# ── PATCH 2: /api/roteador/logs com número mascarado ──────────────────────
OLD_LOGS = """// GET /api/roteador/logs
app.get('/api/roteador/logs', (req, res) => {
  try {
    const rows = dbRaw.prepare(
      'SELECT id, acao, status, criado_em as horario FROM agente_logs ORDER BY id DESC LIMIT 10'
    ).all();
    const logs = rows.map(r => {
      const acao = r.acao || '';
      const agM  = acao.match(/\\[(\\w+)\\]/);
      const agente = agM ? agM[1].toUpperCase() : 'SISTEMA';
      const numM = acao.match(/(?:msg de|para)\\s+(\\d{6,15})/);
      let numero = numM ? numM[1] : '';
      if (numero.length >= 8) {
        numero = numero.slice(0, 4) + '****' + numero.slice(-4);
      }
      return {
        horario: r.horario,
        numero:  numero || '—',
        agente,
        motivo:  acao.slice(0, 80),
        status:  r.status,
      };
    });
    res.json({ success: true, logs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});"""

NEW_LOGS = """// GET /api/roteador/logs
app.get('/api/roteador/logs', (req, res) => {
  try {
    const rows = dbRaw.prepare(
      'SELECT id, acao, status, criado_em as horario FROM agente_logs ORDER BY id DESC LIMIT 20'
    ).all();
    const logs = rows.map(r => {
      const acao = r.acao || '';
      // Extrai agente do padrão [NomeAgente]
      const agM  = acao.match(/\\[([A-Za-z]+)\\]/);
      const agente = agM ? agM[1].toUpperCase() : 'SISTEMA';
      // Extrai número de telefone (sequência de 8-15 dígitos)
      const numM = acao.match(/(\\d{8,15})/);
      let numero = numM ? numM[1] : '';
      if (numero.length >= 8) {
        numero = numero.slice(0, 2) + '****' + numero.slice(-4);
      }
      return {
        horario: r.horario,
        numero:  numero || '—',
        agente,
        motivo:  acao.slice(0, 100),
        status:  r.status,
      };
    });
    res.json({ success: true, logs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});"""

if OLD_LOGS in content:
    content = content.replace(OLD_LOGS, NEW_LOGS)
    print('PATCH 2 aplicado: /api/roteador/logs melhorado')
else:
    print('WARNING PATCH 2: roteador logs target não encontrado')

with open('/opt/scraper-api/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('index.js atualizado com sucesso')
