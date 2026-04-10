#!/usr/bin/env python3
"""Patch index.js: prefixos de áudio e imagem para Thomas identificar mídia"""

with open('/opt/scraper-api/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── PATCH: áudio — adiciona prefixo ───────────────────────
OLD_AUDIO = "      console.log(`[Áudio] Transcrição: \"${transcricao.slice(0, 80)}\"`)\n      return transcricao;"
NEW_AUDIO = "      console.log(`[Áudio] Transcrição: \"${transcricao.slice(0, 80)}\"`)\n      return `[Lead enviou áudio]: ${transcricao}`;"

if OLD_AUDIO in content:
    content = content.replace(OLD_AUDIO, NEW_AUDIO)
    print('PATCH áudio aplicado')
else:
    # Tenta variante com ; no final
    OLD_AUDIO2 = "      console.log(`[Áudio] Transcrição: \"${transcricao.slice(0, 80)}\"`);      return transcricao;"
    if OLD_AUDIO2 in content:
        content = content.replace(OLD_AUDIO2, "      console.log(`[Áudio] Transcrição: \"${transcricao.slice(0, 80)}\"`);      return `[Lead enviou áudio]: ${transcricao}`;")
        print('PATCH áudio (variante) aplicado')
    else:
        # linha 401 — usa replace de linha específica
        content = content.replace('      return transcricao;\n    } catch (e) {\n      console.error(\'[Áudio] Erro ao transcrever',
                                   '      return `[Lead enviou áudio]: ${transcricao}`;\n    } catch (e) {\n      console.error(\'[Áudio] Erro ao transcrever')
        print('PATCH áudio (fallback) aplicado')

# ── PATCH: imagem — troca resultado para incluir prefixo ──
OLD_IMG = "      const resultado = captionOriginal\n        ? `${captionOriginal} [Imagem: ${descricao}]`\n        : `[Imagem: ${descricao}]`;"
NEW_IMG = "      const resultado = captionOriginal\n        ? `[Lead enviou imagem]: ${captionOriginal} — ${descricao}`\n        : `[Lead enviou imagem]: ${descricao}`;"

if OLD_IMG in content:
    content = content.replace(OLD_IMG, NEW_IMG)
    print('PATCH imagem aplicado')
else:
    print('WARNING: target de imagem não encontrado, verificar manualmente')
    # Fallback: procura pela linha específica
    import re
    content = re.sub(
        r'const resultado = captionOriginal\s*\n\s*\? `\$\{captionOriginal\} \[Imagem: \$\{descricao\}\]`\s*\n\s*: `\[Imagem: \$\{descricao\}\]`;',
        'const resultado = captionOriginal\n        ? `[Lead enviou imagem]: ${captionOriginal} — ${descricao}`\n        : `[Lead enviou imagem]: ${descricao}`;',
        content
    )
    print('PATCH imagem (regex) aplicado')

with open('/opt/scraper-api/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('index.js mídia atualizado')
