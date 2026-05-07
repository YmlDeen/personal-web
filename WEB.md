# WEB.md — Personal Dashboard Map
# v1.5.0 | 2026-05-07

===============================================
## OVERVIEW
===============================================

stack  : Express 5 + React (Vite) + SQLite (sql.js in-memory) + JWT
url    : https://ymldeen.duckdns.org:8443
user   : ymldeen / 319300
pages  : Dashboard · Notes · Tasks · Links · Habits · Finance · Logs
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
├── WEB.md
├── README.md
├── deploy.sh                    ← deploy script ← ใช้นี้เสมอ
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── eslint.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              ← router + layout (desktop sidebar + mobile nav)
│       ├── App.css
│       ├── index.css            ← global styles — Glassmorphism dark theme
│       ├── api/
│       │   └── client.js        ← axios instance + auto-refresh interceptor
│       ├── hooks/
│       │   └── useAuth.js       ← zustand auth store
│       ├── assets/
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Notes.jsx
│           ├── Tasks.jsx
│           ├── Links.jsx
│           ├── Habits.jsx       ← streak tracker + monthly grid
│           ├── Finance.jsx      ← income/expense + monthly summary
│           └── Logs.jsx
└── backend/
    ├── server.js
    ├── package.json
    ├── .env
    ├── data/
    │   └── app.db
    └── src/
        ├── app.js
        ├── db/
        │   ├── client.js        ← sql.js in-memory — โหลดจากไฟล์ตอน start
        │   └── schema.sql
        ├── middleware/
        │   ├── auth.js
        │   └── validate.js
        └── modules/
            ├── auth/
            │   ├── auth.router.js
            │   ├── auth.schema.js
            │   └── auth.service.js
            ├── notes/
            ├── tasks/
            ├── links/
            ├── habits/          ← ใหม่ 2026-05-07
            ├── finance/         ← ใหม่ 2026-05-07
            └── logs/

===============================================
## FILE STRUCTURE (VPS — production)
===============================================

~/projects/personal-web/
├── dist/
└── backend/
    ├── server.js
    ├── package.json
    ├── .env                     ← production secrets (ไม่ขึ้น git)
    ├── data/
    │   └── app.db
    └── src/

===============================================
## DEPLOY
===============================================

script: ~/projects/personal-web/deploy.sh

  ./deploy.sh all       → build frontend + upload src + git push + restart
  ./deploy.sh frontend  → build + upload dist + restart
  ./deploy.sh backend   → upload src + restart

⚠ deploy.sh ต้องรันจาก Termux เท่านั้น
⚠ รันบน VPS = scp หาตัวเอง พัง

manual:
  cd frontend && npm run build
  scp -i ~/.ssh/id_ed25519 -r dist ubuntu@54.179.174.46:~/projects/personal-web/
  scp -i ~/.ssh/id_ed25519 -r backend/src ubuntu@54.179.174.46:~/projects/personal-web/backend/
  ssh -i ~/.ssh/id_ed25519 ubuntu@54.179.174.46 "sudo systemctl restart personal-web"

===============================================
## API ROUTES
===============================================

GET  /health                     → { status: 'ok' }
POST /auth/register              → { access, refresh }   password >= 6 ตัว
POST /auth/login                 → { access, refresh }
POST /auth/refresh               → { access }
PUT  /auth/password              → { message }           ต้อง Bearer token

— ต้อง Authorization: Bearer <token> —
GET    /notes                    → list
POST   /notes                    → create
PUT    /notes/:id                → update
DELETE /notes/:id                → delete

GET    /tasks                    → list
POST   /tasks                    → create
PUT    /tasks/:id                → update
DELETE /tasks/:id                → delete

GET    /links                    → list
POST   /links                    → create
DELETE /links/:id                → delete

GET    /habits                   → list
POST   /habits                   → create
DELETE /habits/:id               → delete
GET    /habits/logs?year=&month= → logs รายเดือน
POST   /habits/:id/log           → toggle { date }

GET    /finance?year=&month=     → list รายเดือน
GET    /finance/summary          → { income, expense, balance }
POST   /finance                  → create
DELETE /finance/:id              → delete

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
  JWT_SECRET=327b95d3108e8ea2bae748b8b004bfbeede1ef77ee5077b5cf364553c5d04703
  JWT_REFRESH_SECRET=b9ec321da96b962e75cbe0cbde9e5df7e3e35f6327ec47f337a93e560c858687
  DB_PATH=/home/ubuntu/projects/personal-web/backend/data/app.db

⚠ .env ไม่ขึ้น git เด็ดขาด
⚠ backup: vault/.env.vps.bak

===============================================
## VPS SERVICE
===============================================

systemd : personal-web.service (enabled)
node    : v20.20.2
port    : 3011

  sudo systemctl status personal-web
  sudo systemctl restart personal-web
  sudo systemctl stop personal-web
  sudo journalctl -u personal-web -f
  sudo journalctl -u personal-web -n 30 --no-pager

===============================================
## DATABASE
===============================================

engine  : sql.js (SQLite in-memory)
tables  : users · notes · tasks · links · habits · habit_logs · finance · logs
location:
  Termux : ~/projects/personal-web/backend/data/app.db
  VPS    : ~/projects/personal-web/backend/data/app.db

⚠ sql.js โหลด DB เข้า memory ตอน start
⚠ แก้ไฟล์ตรงๆ ด้วย sqlite3 CLI ไม่ sync กับ memory
⚠ ต้องแก้ผ่าน API เท่านั้น

reset password (วิธีที่ถูก):
  TOKEN=$(curl -s -X POST http://localhost:3011/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"ymldeen","password":"OLD"}' \
    | grep -o '"access":"[^"]*"' | cut -d'"' -f4) \
  && curl -s -X PUT http://localhost:3011/auth/password \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"currentPassword":"OLD","newPassword":"NEW"}' | cat

ถ้า login ไม่ได้เลย:
  sqlite3 /home/ubuntu/projects/personal-web/backend/data/app.db "DELETE FROM users;"
  sudo systemctl restart personal-web
  curl -s -X POST http://localhost:3011/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"ymldeen","password":"NEWPASS"}' | cat

backup: MEGA sync (~/projects → /vps-backup/projects)

===============================================
## SECURITY
===============================================

helmet      : ✓
rate limit  : ✓ /auth — 10 req/15min
CORS        : ✓ origin: https://ymldeen.duckdns.org:8443
JWT_SECRET  : ✓ random 32 bytes
.env        : ✓ ไม่ขึ้น git
HTTPS       : ✓ Caddy reverse proxy :8443

===============================================
## QUICK REFERENCE
===============================================

deploy ทั้งหมด (Termux):
  cd ~/projects/personal-web && ./deploy.sh all

เช็ค live:
  curl -s http://54.179.174.46:3011/health

log VPS:
  sudo journalctl -u personal-web -f

ถ้า .env หาย:
  bring .env.vps.bak --dst ~/projects/personal-web/backend
  mv ~/projects/personal-web/backend/.env.vps.bak ~/projects/personal-web/backend/.env
  scp -i ~/.ssh/id_ed25519 ~/projects/personal-web/backend/.env ubuntu@54.179.174.46:~/projects/personal-web/backend/.env
  ssh -i ~/.ssh/id_ed25519 ubuntu@54.179.174.46 "sudo systemctl restart personal-web"

===============================================
## KNOWN ISSUES / LESSONS LEARNED
===============================================

2026-05-07 AUTH_FAILED:
  root cause : sql.js in-memory ไม่ sync กับ DB file
  fix        : DELETE FROM users → restart → register ใหม่
  เพิ่ม      : PUT /auth/password endpoint

2026-05-07 node_modules หลุดเข้า git:
  root cause : .gitignore ไม่ครอบคลุม subfolder
  fix        : git rm --cached + git restore + npm install
  บทเรียน   : deploy.sh รันจาก Termux เท่านั้น

2026-05-07 gsave push rejected ซ้ำ:
  root cause : VPS และ Termux push แยกกัน remote ahead
  fix        : เพิ่ม git pull --rebase ใน gsave function

===============================================
## TODO
===============================================
- ตรวจ .gitignore ให้ครอบคลุม node_modules ทุก subfolder
- เช็ค UI glassmorphism บนมือถือจริง
- git pull workflow บน VPS (แทน scp)

===============================================
## CLAUDE WORKFLOW — frontend files
===============================================

bring <file> --dst ~/projects/personal-web/frontend/src
bring <page>.jsx --dst ~/projects/personal-web/frontend/src/pages

หลัง bring ครบ:
  cd ~/projects/personal-web && ./deploy.sh frontend

# v1.5.0 | 2026-05-07
