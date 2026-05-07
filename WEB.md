# WEB.md — Personal Dashboard Map
# v1.0.0 | 2026-05-07

===============================================
## OVERVIEW
===============================================

stack  : Express 5 + React (Vite) + SQLite + JWT
url    : http://54.179.174.46:3011
user   : yml / admin1234
pages  : Dashboard · Notes · Tasks · Links · Logs

===============================================
## SOURCE OF TRUTH
===============================================

Termux เป็น source หลัก — แก้ code ที่นี่เสมอ
VPS เป็น production — deploy จาก Termux เท่านั้น

⚠ VPS ไม่มี frontend/src/ — มีแค่ dist/ (built)
⚠ app.js บน VPS ≠ Termux (VPS มี helmet+ratelimit, Termux ยังไม่มี)
→ TODO: sync app.js Termux ให้ตรงกับ VPS

===============================================
## FILE STRUCTURE (Termux — source)
===============================================

~/projects/personal-web/
├── README.md
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
    ├── data/
    │   └── app.db               ← SQLite database (Termux copy)
    └── src/
        ├── app.js               ← express setup + routes + static serve
        ├── db/
        │   ├── client.js        ← better-sqlite3 init + migrate
        │   └── schema.sql       ← tables: users·notes·tasks·links·logs
        ├── middleware/
        │   ├── auth.js          ← verifyToken (Bearer JWT)
        │   └── validate.js      ← zod middleware
        └── modules/
            ├── auth/
            │   ├── auth.router.js   ← POST /auth/login, /auth/refresh
            │   ├── auth.schema.js   ← zod schema
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
├── dist/                        ← frontend built (scp จาก Termux)
│   ├── index.html
│   ├── favicon.svg
│   ├── icons.svg
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
└── backend/                     ← backend source (scp จาก Termux)
    ├── server.js
    ├── package.json
    ├── reset.mjs                ← ลบได้
    ├── .env                     ← JWT secrets + DB_PATH (ไม่ขึ้น git)
    ├── data/
    │   └── app.db               ← SQLite database (production)
    └── src/
        └── ... (เหมือน Termux แต่ app.js มี helmet+ratelimit)

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
  JWT_SECRET=d562704f247ec5e86...  (production secret)
  JWT_REFRESH_SECRET=d93b43487d0...  (production secret)
  DB_PATH=/home/ubuntu/projects/personal-web/backend/data/app.db

⚠ .env ไม่ขึ้น git เด็ดขาด

===============================================
## VPS SERVICE
===============================================

systemd  : personal-web.service (enabled — auto-start on reboot)
tmux     : ไม่ใช้แล้ว (systemd รับช่วงแทน)
node     : v20.20.1

คำสั่ง VPS:
  sudo systemctl status personal-web    → เช็คสถานะ
  sudo systemctl restart personal-web   → restart
  sudo systemctl stop personal-web      → stop
  sudo journalctl -u personal-web -f    → log realtime
  ss -tlnp | grep 3011                  → เช็ค port

===============================================
## DEPLOY (Termux → VPS)
===============================================

ทุกครั้งที่แก้ frontend:
  cd ~/projects/personal-web/frontend
  npm run build
  scp -i ~/.ssh/id_ed25519 -r dist ubuntu@54.179.174.46:~/projects/personal-web/

ทุกครั้งที่แก้ backend:
  scp -i ~/.ssh/id_ed25519 -r backend/src ubuntu@54.179.174.46:~/projects/personal-web/backend/
  ssh -i ~/.ssh/id_ed25519 ubuntu@54.179.174.46 "sudo systemctl restart personal-web"

===============================================
## DATABASE
===============================================

engine  : SQLite (better-sqlite3 บน Termux, sqlite3 CLI บน VPS)
tables  : users · notes · tasks · links · logs
location:
  Termux : ~/projects/personal-web/backend/data/app.db
  VPS    : ~/projects/personal-web/backend/data/app.db

⚠ ห้ามใช้ better-sqlite3 import ใน script บน VPS
→ ใช้ sqlite3 CLI แทน: sqlite3 ~/projects/personal-web/backend/data/app.db "..."

backup  : MEGA sync อัตโนมัติ (~/projects → /vps-backup/projects)

===============================================
## TODO
===============================================
- sync app.js Termux ให้มี helmet + ratelimit เหมือน VPS
- deploy script อัตโนมัติ (build → scp → restart)
- push source ขึ้น GitHub (YmlDeen/personal-web)
- .gitignore: node_modules · .env · data/ · dist/

===============================================
