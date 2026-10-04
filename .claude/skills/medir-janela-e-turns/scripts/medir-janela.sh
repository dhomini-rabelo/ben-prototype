#!/usr/bin/env bash
# Lê uso do Claude Code sem escolher outro agente por recência ou substring.
# Dependências: Bash e Python 3. Limites cooperativos, não um bloqueio do runtime.
set -uo pipefail

if ! command -v python3 >/dev/null 2>&1; then
  echo "erro: python3 ausente — não é possível medir o transcript" >&2
  exit 68
fi

python3 - "$@" <<'PY'
import glob
import json
import os
from pathlib import Path
import sys


def falhar(mensagem, codigo=65):
    print("erro: " + mensagem, file=sys.stderr)
    sys.exit(codigo)


def inteiro(nome, padrao, minimo=0):
    try:
        valor = int(os.environ.get(nome, str(padrao)))
    except ValueError:
        falhar(nome + " deve ser um inteiro", 64)
    if valor < minimo:
        falhar("%s deve ser >= %d" % (nome, minimo), 64)
    return valor


args = sys.argv[1:]
if not args or (args[0] == "--transcript" and len(args) != 2) or (
    args[0] != "--transcript" and len(args) != 1
):
    falhar("uso: medir-janela.sh <description-exato> | --transcript CAMINHO | --main | --list", 64)
alvo = args[0]
if alvo == "--self":
    falhar("--self não identifica com segurança um agente concorrente; use seu description exato ou --transcript CAMINHO confirmado")
if alvo.startswith("--") and alvo not in ("--transcript", "--main", "--list"):
    falhar("modo desconhecido: " + alvo, 64)

teto = inteiro("TETO", 140000, 1)
teto_turns = inteiro("TETO_TURNS", 50, 1)
passo = inteiro("PASSO", 5, 1)
piso = inteiro("PISO", 60)
taxa_min = inteiro("TAXA_MIN", 400)
reserva_tokens = inteiro("RESERVA_TOKENS", 10000, 1)
reserva_turns = inteiro("RESERVA_TURNS", 5, 1)
if reserva_tokens >= teto or reserva_turns >= teto_turns or piso > 100:
    falhar("reservas devem ser menores que seus tetos; PISO deve estar entre 0 e 100", 64)

config = Path(os.environ.get("CLAUDE_CONFIG_DIR") or Path.home() / ".claude").expanduser()
base = config / "projects"
sessao = os.environ.get("CLAUDE_CODE_SESSION_ID", "")
if sessao and ("/" in sessao or "\\" in sessao or sessao in (".", "..")):
    falhar("CLAUDE_CODE_SESSION_ID inválido", 64)


def descricao(meta):
    try:
        dado = json.loads(meta.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return ""
    return dado.get("description", "") if isinstance(dado, dict) else ""


def transcript_de(meta):
    return meta.with_name(meta.name[:-len(".meta.json")] + ".jsonl")


def candidatos():
    # Sessão conhecida é uma fronteira: nunca procurar outra sessão no fallback.
    session_pattern = glob.escape(sessao) if sessao else "*"
    pattern = os.path.join(glob.escape(str(base)), "*", session_pattern, "subagents", "*.meta.json")
    return [(Path(p), descricao(Path(p))) for p in sorted(glob.glob(pattern))]


def unico(caminhos, mensagem):
    if not caminhos:
        falhar(mensagem + " não encontrado; confirme a sessão/identidade ou use --transcript CAMINHO", 66)
    if len(caminhos) != 1:
        falhar(mensagem + " ambíguo; use um description único por instância ou --transcript CAMINHO")
    return caminhos[0]


if alvo == "--list":
    for meta, desc in candidatos():
        print("desc=%s transcript=%s" % (
            json.dumps(desc, ensure_ascii=False),
            json.dumps(str(transcript_de(meta)), ensure_ascii=False)))
    sys.exit(0)

if alvo == "--transcript":
    transcript = Path(args[1]).expanduser()
    if transcript.suffix != ".jsonl":
        falhar("--transcript exige um arquivo .jsonl", 64)
    if sessao:
        try:
            partes = transcript.resolve().relative_to(base.resolve()).parts
        except ValueError:
            partes = ()
        principal = len(partes) == 2 and partes[1] == sessao + ".jsonl"
        subagente = len(partes) == 4 and partes[1:3] == (sessao, "subagents")
        if not (principal or subagente):
            falhar("transcript explícito não pertence à sessão informada", 65)
    # Dentro da sessão, o chamador ainda confirma qual agente é o dono do caminho.
    meta = transcript.with_suffix(".meta.json")
    desc_casada = descricao(meta) or str(transcript)
    fonte = "transcript"
elif alvo == "--main":
    if not sessao:
        falhar("--main exige CLAUDE_CODE_SESSION_ID", 67)
    transcript = unico(
        [Path(p) for p in glob.glob(os.path.join(glob.escape(str(base)), "*", glob.escape(sessao) + ".jsonl"))],
        "transcript principal da sessão")
    desc_casada, fonte = "--main", "main"
else:
    encontrados = [meta for meta, desc in candidatos() if desc == alvo]
    transcript = transcript_de(unico(encontrados, "description exato"))
    desc_casada, fonte = alvo, "exato"

# Um turn é uma chamada do modelo. Blocos repetidos de message.id
# pertencem ao mesmo turn, inclusive quando aparecem intercalados.
janelas = []
indices = {}
try:
    with transcript.open(encoding="utf-8") as arquivo:
        for numero, linha in enumerate(arquivo, 1):
            if not linha.strip():
                continue
            try:
                evento = json.loads(linha)
            except json.JSONDecodeError:
                if not linha.endswith("\n"):
                    # Um transcript ao vivo pode terminar em uma linha incompleta.
                    break
                falhar("JSON inválido na linha %d do transcript" % numero, 69)
            if not isinstance(evento, dict) or evento.get("type") != "assistant":
                continue
            msg = evento.get("message")
            if not isinstance(msg, dict):
                continue
            mid = msg.get("id")
            if mid is not None and not isinstance(mid, str):
                falhar("message.id inválido na linha %d" % numero, 69)
            if mid is not None and mid in indices:
                indice = indices[mid]
            else:
                indice = len(janelas)
                janelas.append(None)
                if mid is not None:
                    indices[mid] = indice
            if not msg.get("usage"):
                continue
            uso = msg["usage"]
            if not isinstance(uso, dict):
                falhar("usage inválido na linha %d" % numero, 69)
            campos = ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens")
            valores = [uso.get(campo, 0) or 0 for campo in campos]
            if any(type(valor) is not int or valor < 0 for valor in valores):
                falhar("contagem de tokens inválida na linha %d" % numero, 69)
            if not any(campo in uso for campo in campos):
                continue
            janela_evento = sum(valores)
            janelas[indice] = janela_evento
except (OSError, UnicodeError) as erro:
    falhar("não foi possível ler o transcript: " + str(erro), 66)

if not janelas or not janelas[-1]:
    falhar("turno mais recente sem uso de entrada válido; medição indisponível, não assumir status=ok", 69)

turns = len(janelas)
janela = janelas[-1]
meio = turns // 2
while meio < turns - 1 and janelas[meio] is None:
    meio += 1
intervalos = turns - 1 - meio
taxa = max(0, (janela - janelas[meio]) // intervalos) if intervalos > 0 else 0
limiar_tokens = teto - reserva_tokens
limiar_turns = teto_turns - reserva_turns
# Nunca agendar a próxima medição além do início da reserva.
horizonte = max(0, min(passo, limiar_turns - turns))
proxima = turns + horizonte
proj = janela + taxa * horizonte
pct = janela * 100 // teto

if janela >= limiar_tokens or (pct >= piso and proj >= limiar_tokens):
    status = "handoff"
elif turns >= limiar_turns:
    # Taxa baixa é apenas um sinal; o pai verifica se existe laço real.
    status = "preso" if taxa < taxa_min else "handoff"
else:
    status = "ok"

print(
    "janela=%d teto=%d pct=%d turns=%d teto_turns=%d taxa=%d proj=%d "
    "proxima=%d reserva_tokens=%d reserva_turns=%d status=%s fonte=%s desc=%s"
    % (janela, teto, pct, turns, teto_turns, taxa, proj, proxima,
       reserva_tokens, reserva_turns, status, fonte, json.dumps(desc_casada, ensure_ascii=False))
)
PY
