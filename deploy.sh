#!/bin/bash
set -e
PROJECT="$HOME/projects/personal-web"
VPS="ubuntu@54.179.174.46"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_CMD="ssh -i $SSH_KEY"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

MODE="${1:-all}"

build_frontend() {
  info "building frontend..."
  cd "$PROJECT/frontend" && npm run build --silent || err "build failed"
  ok "build done"
}

commit_git() {
  cd "$PROJECT"
  if [[ -n $(git status --porcelain) ]]; then
    git add . && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" && git push
    ok "pushed to GitHub"
  else
    ok "nothing to commit"
  fi
}

pull_vps() {
  info "pulling on VPS..."
  $SSH_CMD "$VPS" "cd ~/projects/personal-web && git pull" || err "git pull failed"
  ok "VPS synced"
}

restart_vps() {
  info "restarting service..."
  $SSH_CMD "$VPS" "sudo systemctl restart personal-web && sleep 2 && curl -s http://localhost:3011/health"
  echo ""; ok "live → https://ymldeen.duckdns.org:8443"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  personal-web deploy [$MODE]"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

case "$MODE" in
  frontend) build_frontend; commit_git; pull_vps; restart_vps ;;
  backend)  commit_git; pull_vps; restart_vps ;;
  all)      build_frontend; commit_git; pull_vps; restart_vps ;;
  *)        err "usage: ./deploy.sh [frontend|backend|all]" ;;
esac
