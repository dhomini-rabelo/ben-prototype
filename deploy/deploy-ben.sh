#!/usr/bin/env bash
# Deploy do backend Ben (https://ben.df07.site). Fonte versionada; a copia em uso fica em
# /usr/local/bin/deploy-ben e e chamada pelo workflow via SSH (forced command).
#
# Instalacao (como root, uma vez):
#   install -m 755 deploy/deploy-ben.sh /usr/local/bin/deploy-ben
#   install -d -o dev -g dev /srv/ben
#   install -d -o root -g dev -m 750 /etc/ben
#   echo 'BEN_DEPLOY_BRANCH=main' > /etc/ben/deploy.env
#   # /etc/ben/ben.env: variaveis de runtime (ver deploy/ben.env.example), chmod 640 root:dev
#   cp deploy/ben.caddy /etc/caddy/sites/ben.caddy && systemctl reload caddy
#   ssh-keygen -t ed25519 -f /home/dev/.ssh/deploy_ben -N '' -C deploy-ben
#   # authorized_keys do dev: command="/usr/local/bin/deploy-ben",restrict <chave publica>
#   # secret do repo: gh secret set VPS_DEPLOY_KEY < /home/dev/.ssh/deploy_ben
set -euo pipefail

exec 9>/tmp/deploy-ben.lock
flock 9

APP_DIR=/srv/ben/app
REPO_URL=git@github.com:dhomini-rabelo/ben-prototype.git
CONTAINER=ben
IMAGE=ben
HOST_PORT=4500
CONTAINER_PORT=3333
BEN_DEPLOY_BRANCH=main
# shellcheck disable=SC1091
[ -f /etc/ben/deploy.env ] && . /etc/ben/deploy.env

log() { echo "[deploy-ben] $*"; }

if [ ! -d "$APP_DIR/.git" ]; then
  log "clonando $REPO_URL"
  git clone --quiet "$REPO_URL" "$APP_DIR"
fi

log "atualizando para origin/$BEN_DEPLOY_BRANCH"
git -C "$APP_DIR" fetch --quiet --prune origin "$BEN_DEPLOY_BRANCH"
git -C "$APP_DIR" reset --quiet --hard FETCH_HEAD
REV=$(git -C "$APP_DIR" rev-parse --short HEAD)
log "revisao $REV"

log "build da imagem $IMAGE:$REV"
docker build --quiet --build-arg "GIT_REV=$REV" -t "$IMAGE:$REV" -t "$IMAGE:latest" "$APP_DIR" >/dev/null

log "trocando o container"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped \
  -p "127.0.0.1:$HOST_PORT:$CONTAINER_PORT" \
  -v ben-data:/data \
  --env-file /etc/ben/ben.env \
  "$IMAGE:$REV" >/dev/null

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$HOST_PORT/health" >/dev/null 2>&1; then
    log "no ar: $REV"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

log "health check falhou; ultimos logs:"
docker logs --tail 50 "$CONTAINER" 2>&1
exit 1
