#!/bin/bash
set -e
PROJECT="$HOME/projects/personal-web"
VPS="ubuntu@54.179.174.46"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_CMD="ssh -i $SSH_KEY"
SCP_CMD="scp -i $SSH_KEY"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
MODE="${1:-all}"
deploy_frontend() {
  info "building frontend..."
  cd "$PROJECT/frontend" && npm run build --silent || err "build failed"
  ok "build done"
  info "uploading dist..."
  $SCP_CMD -r "$PROJECT/frontend/dist" "$VPS:~/projects/personal-web/" || err "scp failed"
  ok "dist uploaded"
}
deploy_backend() {
  info "uploading backend/src..."
  $SCP_CMD -r "$PROJECT/backend/src" "$VPS:~/projects/personal-web/backend/" || err "scp failed"
  ok "src uploaded"
}
restart_vps() {
  info "restarting service..."
  $SSH_CMD "$VPS" "sudo systemctl restart personal-web && sleep 2 && curl -s http://localhost:3011/health"
  echo ""; ok "live → http://54.179.174.46:3011"
}
commit_git() {
  cd "$PROJECT"
  if [[ -n $(git status --porcelain) ]]; then
    git add . && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" && git push
    ok "pushed to GitHub"
  fi
}
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  personal-web deploy [$MODE]"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
case "$MODE" in
  frontend) deploy_frontend; restart_vps ;;
  backend)  deploy_backend;  restart_vps ;;
  all)      deploy_frontend; deploy_backend; commit_git; restart_vps ;;
  *)        err "usage: ./deploy.sh [frontend|backend|all]" ;;
esac
