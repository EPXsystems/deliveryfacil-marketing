#!/usr/bin/env python3
"""
Patch agente-sdr.js:
1. sendWhatsapp: charset=utf-8 no header
2. processarMidia prefixes: [Lead enviou áudio]: e [Lead enviou imagem]:
3. gerarMensagem: não menciona categoria do DB como tipo de negócio
"""

with open('/opt/scraper-api/src/agente-sdr.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── PATCH 1: charset=utf-8 no Content-Type do sendWhatsapp ─────────────────
OLD_SEND = "    headers: { 'Content-Type': 'application/json', apikey: EVO_KEY },"
NEW_SEND = "    headers: { 'Content-Type': 'application/json; charset=utf-8', apikey: EVO_KEY },"

if OLD_SEND in content:
    content = content.replace(OLD_SEND, NEW_SEND)
    print('PATCH 1 aplicado: charset=utf-8 no sendWhatsapp')
else:
    print('WARNING PATCH 1: target não encontrado')

# ── PATCH 2: prefixo de áudio ──────────────────────────────────────────────
OLD_AUDIO = "      console.log(`[Áudio] Transcrição: \"${transcricao.slice(0, 80)}\"`)\n      return transcricao;"
NEW_AUDIO = """      console.log(`[Áudio] Transcrição: "${transcricao.slice(0, 80)}"`)
      return `[Lead enviou áudio]: ${transcricao}`;"""

if OLD_AUDIO in content:
    content = content.replace(OLD_AUDIO, NEW_AUDIO)
    print('PATCH 2 aplicado: prefixo [Lead enviou áudio]')
else:
    print('WARNING PATCH 2: target não encontrado')

# ── PATCH 3: prefixo de imagem ─────────────────────────────────────────────
OLD_IMG_RESULT = '''      const resultado = captionOriginal
        ? `${captionOriginal} [Imagem: ${descricao}]`
        : `[Imagem: ${descricao}]`;
      console.log(`[Imagem] Descrição: "${resultado.slice(0, 80)}"`)
      return resultado;'''

NEW_IMG_RESULT = '''      const textoImg = captionOriginal
        ? `${captionOriginal} — ${descricao}`
        : descricao;
      const resultado = `[Lead enviou imagem]: ${textoImg}`;
      console.log(`[Imagem] Descrição: "${resultado.slice(0, 80)}"`)
      return resultado;'''

if OLD_IMG_RESULT in content:
    content = content.replace(OLD_IMG_RESULT, NEW_IMG_RESULT)
    print('PATCH 3 aplicado: prefixo [Lead enviou imagem]')
else:
    print('WARNING PATCH 3: target de imagem não encontrado')

# ── PATCH 4: gerarMensagem não trata categoria do DB como tipo confirmado ──
# O template 3 usa lead.categoria como "segmento" confirmado — perigoso
# Vamos remover a referência explícita à categoria do lead no template
OLD_TPL3 = """  (nome, cat) => {
    const segmento = cat || 'restaurantes';
    return `Restaurantes de ${segmento} como o ${nome} que usam o Delivery Fácil aumentaram em média 30% o faturamento. Teria interesse em ver como isso funcionaria pra vocês?`;
  },"""

NEW_TPL3 = """  (nome) => {
    return `${nome}, negócios de delivery que têm canal próprio aumentam em média 30% o faturamento sem depender de plataforma. Teria interesse em ver como isso funcionaria pra vocês?`;
  },"""

if OLD_TPL3 in content:
    content = content.replace(OLD_TPL3, NEW_TPL3)
    print('PATCH 4 aplicado: template 3 sem categoria do lead')
else:
    print('WARNING PATCH 4: template 3 não encontrado')

# ── PATCH 5: gerarMensagem via IA — não passa categoria como tipo confirmado
OLD_GERAR = """        content: `Gere UMA mensagem de primeiro contato WhatsApp para:\\n- Restaurante: ${lead.nome}\\n- Categoria: ${lead.categoria || 'restaurante'}\\n- Cidade: ${lead.cidade || ''}\\n- Avaliação: ${lead.avaliacao || 'não informada'}\\n\\nTom: ${tom}\\nMáximo 3 linhas. Máximo 1 emoji. Personalize com o nome do restaurante. Responda APENAS com a mensagem, sem aspas ou prefixo.`,"""

NEW_GERAR = """        content: `Gere UMA mensagem de primeiro contato WhatsApp para um negócio de delivery.\\n- Nome do estabelecimento: ${lead.nome}\\n- Cidade: ${lead.cidade || 'não informada'}\\n- Avaliação Google: ${lead.avaliacao || 'não informada'}\\n\\nTom: ${tom}\\nIMPORTANTE: NÃO mencione o tipo de negócio (pizzaria, hamburgueria etc) — você ainda não sabe o que eles vendem. Foque no nome do estabelecimento e na proposta de canal de delivery próprio sem comissão.\\nMáximo 2-3 frases. Máximo 1 emoji natural. Responda APENAS com a mensagem, sem aspas ou prefixo.`,"""

if OLD_GERAR in content:
    content = content.replace(OLD_GERAR, NEW_GERAR)
    print('PATCH 5 aplicado: gerarMensagem IA sem categoria')
else:
    print('WARNING PATCH 5: gerarMensagem content não encontrado')

with open('/opt/scraper-api/src/agente-sdr.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('agente-sdr.js atualizado com sucesso')
