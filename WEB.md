# WEB.md — Personal Dashboard Map
# v1.5.0 | 2026-05-07

===============================================
## OVERVIEW
===============================================

stack  : Express 5 + React (Vite) + SQLite (sql.js) + JWT
url    : https://ymldeen.duckdns.org:8443 ✓ PWA
user   : yml / admin1234
pages  : Dashboard · Notes · Tasks · Links · Habits · Finance · Logs · Journal
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
│       ├── App.jsx              ← router + layout (sidebar/mobile nav)
│       ├── App.css
│       ├── index.css            ← global styles
│       ├── api/
│       │   └── client.js        ← axios instance + auto-refresh interceptor
│       ├── hooks/
│       │   └── useAuth.js       ← zustand auth store
│       ├── assets/
│       └── pages/
│           ├── Login.jsx        ← POST /auth/login
│           ├── Dashboard.jsx    ← summary cards + quick capture + countdown
│           ├── Notes.jsx        ← CRUD + collapse/expand preview
│           ├── Tasks.jsx        ← CRUD + priority + due date + smart sort + recurring
│           ├── Links.jsx        ← CRUD
│           ├── Habits.jsx       ← habit tracker
│           ├── Finance.jsx      ← income/expense tracker
│           ├── Logs.jsx         ← read-only timeline
│           ├── Journal.jsx      ← journal
│           └── Search.jsx       ← global search overlay (notes/tasks/links)
└── backend/                     ← Express source (แก้ที่นี่)
    ├── server.js                ← entry — app.listen(:3011)
    ├── package.json
    ├── .env                     ← ไม่ขึ้น git
    ├── data/
    │   └── app.db               ← SQLite (Termux local)
    └── src/
        ├── app.js               ← express setup + helmet + ratelimit + routes + static
        ├── db/
        │   ├── client.js        ← sql.js init + migrate
        │   └── schema.sql       ← tables ด้านล่าง
        ├── middleware/
        │   ├── auth.js          ← verifyToken (Bearer JWT)
        │   └── validate.js      ← zod middleware
        └── modules/
            ├── auth/            ← POST /auth/login, /auth/refresh
            ├── notes/           ← GET·POST·PUT·DELETE /notes/:id
            ├── tasks/           ← GET·POST·PUT·DELETE /tasks/:id
            ├── links/           ← GET·POST·DELETE /links/:id
            ├── habits/          ← GET·POST·PUT·DELETE /habits/:id
            ├── finance/         ← GET·POST·DELETE /finance/:id
            └── logs/            ← GET·POST /logs (append-only)

===============================================
## FILE STRUCTURE (VPS — production)
===============================================

~/projects/personal-web/
├── dist/                        ← frontend built (serve โดย Express static)
│   ├── index.html
│   ├── favicon.svg
│   ├── icons.svg
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env                     ← production secrets (สร้างบน VPS, ไม่ขึ้น git)
│   ├── data/
│   │   └── app.db               ← SQLite production
│   └── src/                     ← upload ผ่าน deploy.sh
├── deploy.sh
├── frontend/                    ← ตกค้าง ไม่ได้ใช้งาน
└── main                         ← ไฟล์ว่าง ไม่ได้ใช้งาน

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
## REQUEST FLOW
===============================================

Browser
  → Caddy (:8443 HTTPS)
    → Express (:3011)
        ├─ GET  /health              → { status: 'ok' }
        ├─ /auth/*                   → loginLimiter → authRouter
        ├─ /notes/*                  → verifyToken → notesRouter
        ├─ /tasks/*                  → verifyToken → tasksRouter
        ├─ /links/*                  → verifyToken → linksRouter
        ├─ /habits/*                 → verifyToken → habitsRouter
        ├─ /finance/*                → verifyToken → financeRouter
        ├─ /logs/*                   → verifyToken → logsRouter
        └─ /*                        → static dist/index.html (SPA fallback)

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
PUT    /tasks/:id                → update (status/priority/due/repeat)
DELETE /tasks/:id                → delete

GET    /links                    → list
POST   /links                    → create
DELETE /links/:id                → delete

GET    /habits                   → list
POST   /habits                   → create
PUT    /habits/:id               → update
DELETE /habits/:id               → delete

GET    /finance                  → list
POST   /finance                  → create
DELETE /finance/:id              → delete

GET    /logs                     → list
POST   /logs                     → append

rate limit: /auth — 10 req / 15 min

===============================================
## DATABASE
===============================================

engine  : SQLite via sql.js (pure JS — ไม่มี native addon)
location:
  Termux : ~/projects/personal-web/backend/data/app.db
  VPS    : ~/projects/personal-web/backend/data/app.db

tables:
  users         — id · username · password · created_at
  notes         — id · user_id · title · content · tags · created_at · updated_at
  tasks         — id · user_id · title · status · priority · due_date · repeat · created_at · updated_at
  links         — id · user_id · title · url · tags · created_at
  logs          — id · user_id · action · detail · created_at
  refresh_tokens— id · user_id · token · expires_at
  habits        — id · user_id · name · color · created_at
  habit_logs    — id · habit_id · user_id · date  (UNIQUE habit_id+date)
  finance       — id · user_id · type · amount · category · note · date · created_at

⚠ ห้ามใช้ better-sqlite3 หรือ native addon บน VPS (Node 20 ไม่ support)
→ ใช้ sqlite3 CLI: sqlite3 ~/...app.db "..."

reset password:
  node -e "require('bcryptjs').hash('newpass', 10, (e,h) => console.log(h))"
  sqlite3 ~/...app.db "UPDATE users SET password = 'HASH' WHERE username = 'yml';"

backup: MEGA sync อัตโนมัติ (~/projects → /vps-backup/projects)

===============================================
## LAYOUT
===============================================

desktop : sidebar 200px fixed
            yml.space · personal os
            search button (⌘K)
            nav: Dashboard · Notes · Tasks · Links · Habits · Finance · Logs · Journal
            logout

mobile  : bottom nav
            HOME · TASKS · HABITS · FIN · NOTES · SEARCH · OUT

Search  : global overlay — notes/tasks/links — toggle ⌘K หรือกด SEARCH

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

⚠ CORS ใน app.js ตั้งค่าเป็น http://54.179.174.46:3011
  production จริงคือ https://ymldeen.duckdns.org:8443 — ยังไม่ได้แก้

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
## SECURITY
===============================================

helmet      : ✓ (contentSecurityPolicy: false)
rate limit  : ✓ /auth — 10 req/15min
CORS        : ⚠ origin ตั้งเป็น http://54.179.174.46:3011 (ไม่ตรง production)
JWT_SECRET  : ✓ random 32 bytes (production)
.env        : ✓ ไม่ขึ้น git
HTTPS       : ✓ Caddy reverse proxy (ymldeen.duckdns.org:8443)

===============================================
## KNOWN ISSUES / CLEANUP
===============================================

- CORS origin ไม่ตรง production URL (ยังใช้งานได้เพราะ Caddy handle)
- frontend/ บน VPS ตกค้าง ลบได้
- main (ไฟล์ว่าง) ที่ root ลบได้

===============================================
## TODO
===============================================

- UI redesign ✓ done (Industrial Terminal — mobile bottom nav)
- habits module ✓ done
- finance module ✓ done
- journal page ✓ done
- global search ✓ done
- tasks: priority + due date + smart sort + recurring ✓ done
- CORS origin แก้ให้ตรง production URL
- git pull workflow บน VPS (แทน scp)
- cleanup: ลบ frontend/ และ main บน VPS

===============================================
## CLAUDE WORKFLOW — frontend files
===============================================

เวลา Claude สร้างไฟล์ frontend → download → bring ด้วย path นี้เสมอ:

  bring <file> --dst ~/projects/personal-web/frontend/src
  bring <page>.jsx --dst ~/projects/personal-web/frontend/src/pages

หลัง bring ครบ:
  cd ~/projects/personal-web && ./deploy.sh frontend

ดู SHARE_BRING.md สำหรับ syntax ละเอียด

===============================================
## QUICK REFERENCE
===============================================

แก้ code แล้ว deploy:
  cd ~/projects/personal-web && ./deploy.sh all

แก้แค่ frontend:
  ./deploy.sh frontend

แก้แค่ backend:
  ./deploy.sh backend

เช็คว่า live ไหม:
  curl -s http://54.179.174.46:3011/health

เช็ค log บน VPS:
  vps && sudo journalctl -u personal-web -f

ถ้า service ดับ:
  vps && sudo systemctl restart personal-web
