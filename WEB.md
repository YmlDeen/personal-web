# WEB.md — Personal Dashboard Map
# Dashboard: countdown AWS credit + notes + tasks + links
# v1.1.0 | 2026-05-07

===============================================
## OVERVIEW
===============================================

stack  : Express 5 + React (Vite) + SQLite + JWT
url    : https://ymldeen.duckdns.org
user   : yml / admin1234
pages  : Dashboard · Notes · Tasks · Links · Logs
repo   : https://github.com/YmlDeen/personal-web (private)

===============================================
## SOURCE OF TRUTH
===============================================

Termux  → แก้ code ที่นี่เสมอ
GitHub  → single source of truth
VPS     → production — deploy ผ่าน ./deploy.sh เท่านั้น

workflow:
  แก้ code (Termux) → ./deploy.sh all → live

===============================================
## FILE STRUCTURE (Termux — source)
===============================================

~/projects/personal-web/
├── WEB.md                       ← map ของ project (ไฟล์นี้)
├── README.md
├── deploy.sh                    ← deploy script ← ใช้นี้เสมอ
├── .gitignore
├── frontend/                    ← React source (แก้ที่นี่)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── eslint.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx             ← entry point
│       ├── App.jsx              ← router + layout
│       ├── App.css
│       ├── index.css            ← global styles
│       ├── api/
│       │   └── client.js        ← axios instance + auto-refresh interceptor
│       ├── hooks/
│       │   └── useAuth.js       ← zustand auth store
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       └── pages/
│           ├── Login.jsx        ← POST /auth/login
│           ├── Dashboard.jsx    ← summary cards (notes/tasks/links)
│           ├── Notes.jsx        ← CRUD notes
│           ├── Tasks.jsx        ← CRUD tasks + status toggle
│           ├── Links.jsx        ← CRUD links
│           └── Logs.jsx         ← read-only timeline
└── backend/                     ← Express source (แก้ที่นี่)
    ├── server.js                ← entry — app.listen(:3011)
    ├── package.json
    ├── .env                     ← ไม่ขึ้น git
    ├── data/
    │   └── app.db               ← SQLite (Termux local)
    └── src/
        ├── app.js               ← express setup + helmet + ratelimit + routes + static
        ├── db/
        │   ├── client.js        ← better-sqlite3 init + migrate
        │   └── schema.sql       ← tables: users·notes·tasks·links·logs
        ├── middleware/
        │   ├── auth.js          ← verifyToken (Bearer JWT)
        │   └── validate.js      ← zod middleware
        └── modules/
            ├── auth/
            │   ├── auth.router.js   ← POST /auth/login, /auth/refresh
            │   ├── auth.schema.js
            │   └── auth.service.js  ← bcryptjs.compare + JWT sign
            ├── notes/
            │   ├── notes.router.js  ← GET·POST·PUT·DELETE /notes/:id
            │   ├── notes.schema.js
            │   └── notes.service.js
            ├── tasks/
            │   ├── tasks.router.js  ← GET·POST·PUT·DELETE /tasks/:id
            │   ├── tasks.schema.js
            │   └── tasks.service.js
            ├── links/
            │   ├── links.router.js  ← GET·POST·DELETE /links/:id
            │   ├── links.schema.js
            │   └── links.service.js
            └── logs/
                ├── logs.router.js   ← GET·POST /logs (append-only)
                └── logs.service.js

===============================================
## FILE STRUCTURE (VPS — production)
===============================================

~/projects/personal-web/
├── dist/                        ← frontend built (upload ผ่าน deploy.sh)
│   ├── index.html
│   ├── favicon.svg
│   ├── icons.svg
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
└── backend/
    ├── server.js
    ├── package.json
    ├── .env                     ← production secrets (สร้างบน VPS, ไม่ขึ้น git)
    ├── data/
    │   └── app.db               ← SQLite production
    └── src/                     ← upload ผ่าน deploy.sh

===============================================
## DEPLOY
===============================================

script: ~/projects/personal-web/deploy.sh

  ./deploy.sh all       → build frontend + upload src + git push + restart
  ./deploy.sh frontend  → build + upload dist + restart
  ./deploy.sh backend   → upload src + restart

manual (ถ้า script พัง):
  cd frontend && npm run build
  scp -i ~/.ssh/id_ed25519 -r dist ubuntu@54.179.174.46:~/projects/personal-web/
  scp -i ~/.ssh/id_ed25519 -r backend/src ubuntu@54.179.174.46:~/projects/personal-web/backend/
  ssh -i ~/.ssh/id_ed25519 ubuntu@54.179.174.46 "sudo systemctl restart personal-web"

===============================================
## API ROUTES
===============================================

GET  /health                     → { status: 'ok' }
POST /auth/login                 → { accessToken, refreshToken }
POST /auth/refresh               → { accessToken }

— ต้อง Authorization: Bearer <token> —
GET    /notes                    → list
POST   /notes                    → create
PUT    /notes/:id                → update
DELETE /notes/:id                → delete

GET    /tasks                    → list
POST   /tasks                    → create
PUT    /tasks/:id                → update (status toggle)
DELETE /tasks/:id                → delete

GET    /links                    → list
POST   /links                    → create
DELETE /links/:id                → delete

GET    /logs                     → list
POST   /logs                     → append

rate limit: /auth — 10 req / 15 min

===============================================
## ENV FILES
===============================================

Termux: ~/projects/personal-web/backend/.env
  PORT=3011
  JWT_SECRET=<local_secret>
  JWT_REFRESH_SECRET=<local_secret>
  DB_PATH=/data/data/com.termux/files/home/projects/personal-web/backend/data/app.db

VPS: ~/projects/personal-web/backend/.env
  PORT=3011
  JWT_SECRET=d562704f247ec5e86...
  JWT_REFRESH_SECRET=d93b43487d0...
  DB_PATH=/home/ubuntu/projects/personal-web/backend/data/app.db

⚠ .env ไม่ขึ้น git เด็ดขาด

===============================================
## VPS SERVICE
===============================================

systemd : personal-web.service (enabled — auto-start on reboot)
node    : v20.20.2
port    : 3011

คำสั่ง:
  sudo systemctl status personal-web              → เช็คสถานะ
  sudo systemctl restart personal-web             → restart
  sudo systemctl stop personal-web               → stop
  sudo journalctl -u personal-web -f             → log realtime
  sudo journalctl -u personal-web -n 30 --no-pager → log ย้อนหลัง
  ss -tlnp | grep 3011                           → เช็ค port

===============================================
## DATABASE
===============================================

engine  : SQLite
tables  : users · notes · tasks · links · logs
location:
  Termux : ~/projects/personal-web/backend/data/app.db
  VPS    : ~/projects/personal-web/backend/data/app.db

⚠ ห้ามใช้ better-sqlite3 import ใน script บน VPS (Node 20 ไม่ support)
→ ใช้ sqlite3 CLI: sqlite3 ~/...app.db "..."

reset password:
  node -e "require('bcryptjs').hash('newpass', 10, (e,h) => console.log(h))"
  sqlite3 ~/...app.db "UPDATE users SET password = 'HASH' WHERE username = 'yml';"

backup: MEGA sync อัตโนมัติ (~/projects → /vps-backup/projects)

===============================================
## SECURITY
===============================================

helmet      : ✓ (contentSecurityPolicy: false)
rate limit  : ✓ /auth — 10 req/15min
CORS        : ✓ origin: https://ymldeen.duckdns.org
JWT_SECRET  : ✓ random 32 bytes (production)
.env        : ✓ ไม่ขึ้น git
HTTPS       : ✓ Caddy + Let's Encrypt (ymldeen.duckdns.org)

===============================================
## TODO
===============================================
- UI redesign (ตอนนี้ดิบมาก)
- HTTPS ✓ done (Caddy + ymldeen.duckdns.org)
- git pull workflow บน VPS (แทน scp)

===============================================
# v1.1.0 | 2026-05-07
