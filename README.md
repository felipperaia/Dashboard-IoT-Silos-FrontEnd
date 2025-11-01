# Frontend — Deméter - Monitoring Dashboard (Vite + React PWA)

Este diretório deve se tornar o repositório `silo-monitor-frontend`.

Arquivos/dirs que pertencem ao repositório frontend
- vite-react/
  - src/
  - public/ (sw.js, manifest.json, icons)
  - package.json
  - vite.config.js
  - netlify.toml
  - README.md (este arquivo)
- static assets (icons, logos)

Quickstart local
1. Clone o repo frontend:
   git clone <url-do-repo-frontend>
   cd silo-monitor-frontend

2. Instale dependências:
   npm install

3. Rodar em dev:
   npm run dev
   Abra http://localhost:5173 (ou a porta exibida pelo Vite)

Gerar VAPID keys (para Web Push)
- Recomendado executar em frontend (ou raiz) via npx:
  npx web-push generate-vapid-keys --json
  copie publicKey para backend (VAPID_PUBLIC_KEY)
- O frontend obtém a chave pública do backend via /api/notifications/vapid_public por padrão,
  então não é obrigatório colocar VAPID_PUBLIC_KEY no frontend.

Configurar deploy (Netlify)
- Build: npm run build
- Publish directory: dist
- Defina VITE_API_URL com a URL do backend (ex: https://api.seu-dominio.com/api)

MFA / TOTP
- A aplicação frontend tem suporte para configurar MFA (TOTP) usando o endpoint `/api/mfa/setup` e `/api/mfa/verify`.
- Para testar localmente, habilite a rota `/api/mfa` no backend e use um app autenticador (Microsoft Authenticator ou Google Authenticator).

Web Push (VAPID)
- Gere chaves VAPID e configure no backend (VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY). O frontend consulta `/api/notifications/vapid_public` para registrar o service worker.

.gitignore sugerido (crie no repo)
# Node
node_modules/
dist/
.env
.vscode/
