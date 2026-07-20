# Checklist — o que fizemos

## Sessão de fundação (anterior)

### Decisões alinhadas com o cliente

- [x] Stack definida: Next.js + TypeScript + Tailwind + Firebase
- [x] Multi-site / whitelabel desde o início
- [x] Pagamento deixado abstraído (gateway a definir depois)
- [x] Escopo de início: catálogo/CMS + protótipo de UX

### Fundação técnica

- [x] Scaffold Next.js (App Router) + TypeScript strict + Tailwind + ESLint
- [x] Estrutura modular por feature (`tenant`, `partners`, `attractions`, `catalog`, `orders`, `fulfillment`)
- [x] Design system base (tokens CSS, tipografia Inter/Fraunces, Button, Card, Badge)
- [x] Theming por tenant via CSS variables
- [x] README com arquitetura e instruções de setup

### Modelo de domínio

- [x] Tipos: `Site`, `Partner`, `Attraction`, `TicketType`, `Product`/`Passport`, `Order`, `Fulfillment`
- [x] Separação Produto (o que o cliente vê) × Fulfillment (o que a operação emite)
- [x] Estratégias de emissão: `API` | `MANUAL`
- [x] Modos de disponibilidade: `SCHEDULED` | `DATED` | `OPEN`
- [x] Contrato `PartnerAdapter` + `ManualAdapter` + registry
- [x] Interface de pagamento (`PaymentRef`) desacoplada do gateway

### Multi-tenant

- [x] Resolução de site por `Host`
- [x] Recorte de catálogo por site (`attractionIds`)
- [x] Seed com site OneRio + site whitelabel AquaRio

### Firebase (preparação)

- [x] Client SDK + Admin SDK
- [x] Nomes de coleções centralizados
- [x] `firestore.rules` e `storage.rules` com papéis (`admin` / `operator`)
- [x] `firebase.json` + emuladores + indexes
- [x] Script de seed (`npm run seed`)
- [x] Camada `repository.ts` isolada (pronta para Firestore)

### Storefront (UX)

- [x] Home com hero, perks e destaques
- [x] Listagem de atrações e passaportes
- [x] Página de atração com conteúdo CMS + painel de reserva
- [x] Página de passaporte com composição e tags de emissão
- [x] Checkout com resumo, dados do cliente e métodos PIX/cartão (mock)
- [x] Dados de seed realistas

### Backoffice (protótipo)

- [x] Layout admin com sidebar
- [x] Dashboard com métricas e emissões pendentes
- [x] Fila de emissão manual (UI)
- [x] Listagem de atrações / parceiros / passaportes / sites
- [x] Editor CMS de atração (Zod + server action)

---

## Sessão atual — Firebase real + Auth (20/07/2026)

### Conexão Firebase (`gustavo-c049a`)

- [x] Projeto Firebase selecionado (`531-gustavo` / `gustavo-c049a`)
- [x] `.env.local` com config Web do SDK
- [x] `.firebaserc` apontando para o projeto
- [x] Emulador desligado (`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`)
- [x] Decisão explícita: **sem Cloud Functions** (plano Spark / sem Blaze)

### Dados reais no Firestore

- [x] Seed no projeto real (bootstrap temporário de rules → grava → restaura)
- [x] Coleções populadas: sites, partners, attractions, ticketTypes, products, orders, fulfillments
- [x] Doc `config/staff` com allowlist de admins/operators
- [x] `repository.ts` migrado de seed estático → queries Firestore (async)
- [x] Páginas storefront/admin atualizadas para `await` nas queries
- [x] Rules de produção publicadas (leitura de catálogo pública; pedidos/emissões protegidos)
- [x] Script `npm run firebase:rules` e `npm run seed` documentados

### Auth (itens 5–7 das pendências)

- [x] Login e-mail/senha (`/login`)
- [x] Registro (`/registro`)
- [x] Login com Google
- [x] Sessão httpOnly (`onerio_session` + `onerio_role`) com verificação JWT via JWKS (`jose`) — sem service account
- [x] Perfil em `users/{uid}` (role inicial `customer`)
- [x] Staff via `ADMIN_EMAILS` / `OPERATOR_EMAILS` (middleware + rules via `config/staff`)
- [x] Script `npm run promote-admin` para espelhar role no doc `users/`
- [x] `AuthProvider` + header com Entrar / Conta / Sair
- [x] Logout no admin

### Proteção de rotas

- [x] Middleware em `/admin/*` — só `admin` | `operator`
- [x] Middleware em `/conta/*` — usuário autenticado
- [x] Redirect de `/login` e `/registro` se já autenticado

### Área do cliente

- [x] `/conta` — home da conta
- [x] `/conta/pedidos` — listagem de pedidos (por `customerUid` ou e-mail)
- [x] `/conta/pedidos/[orderId]` — detalhe + download de bilhetes (`ticketAssets`)
- [x] Pedidos de seed para demo (`ana.lima@email.com`, etc.)
- [x] Campo `customerUid` no tipo `Order`

### Backoffice com Auth

- [x] Fila de emissão carregada no client (respeitando rules de staff)
- [x] Dashboard com resumo de pendentes autenticado
- [x] Build limpo com novas rotas (`/login`, `/registro`, `/conta`, …)

### Pendência manual (Console Firebase)

- [ ] Ativar providers **E-mail/Senha** e **Google** em Authentication
- [ ] (Opcional) Ativar Storage quando for upload de bilhetes
