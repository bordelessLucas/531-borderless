# OneRio — Plataforma de Ingressos e Passaportes

Plataforma própria para comercialização de ingressos, experiências e passaportes
turísticos, com suporte a **integração via API**, **emissão manual (dropshipping
de ingressos)** e **produtos compostos (passaportes)** — em arquitetura
**multi-site / whitelabel**.

## Stack

- **Next.js (App Router) + TypeScript strict** — SSR/SEO no storefront e no backoffice.
- **Tailwind CSS** — design system com theming por tenant via CSS variables.
  Identidade OneRio: **Noite Fresca / Rota Quente / Luz do Dia**, tipografia
  **Chillax** (títulos) + **Satoshi** (texto).
- **Firebase** — Firestore (dados), Auth (papéis) e Storage (bilhetes/CMS).
- **Zod** — validação na borda (server actions).

## Arquitetura de domínio

O princípio central: **o cliente compra 1 produto, mas a operação pode conter N
emissões** com fornecedores, calendários, validades e formas de emissão diferentes.

```
Partner ──< Attraction ──< TicketType          (catálogo + regras)
                              │ strategy: API | MANUAL
                              │ availability: SCHEDULED | DATED | OPEN
Product (SIMPLE | PASSPORT)                     (o que o cliente vê)
Order ──< OrderItem ──< Fulfillment             (o que a operação cumpre)
                          status: PENDING → PROCESSING → ISSUED → DELIVERED
                          strategy: API (auto) | MANUAL (fila do backoffice)
```

- **Passaporte** = `Product` do tipo `PASSPORT` com `composition` de N atrações.
  Ao ser comprado, gera 1 `OrderItem` e N `Fulfillments` independentes.
- **Adapters** (`src/features/fulfillment/adapters`): cada parceiro implementa
  `PartnerAdapter`. `ManualAdapter` enfileira a emissão para o backoffice.
  Novo parceiro = 1 arquivo novo, sem tocar no core (Open/Closed).
- **Multi-site** (`src/features/tenant`): o Host resolve o `Site`; o mesmo código
  serve a OneRio e os sites whitelabel de parceiros (tema + recorte de catálogo).

## Estrutura

```
src/
  app/
    (site)/         # storefront público (home, atrações, passaportes, checkout)
    admin/          # backoffice (dashboard, fila de emissão, CMS, sites)
  features/         # domínio por feature (tipos, actions, adapters)
    tenant/ partners/ attractions/ catalog/ orders/ fulfillment/ shared/
  components/       # design system (ui/) + blocos (catalog, booking, admin, checkout)
  lib/
    firebase/       # client SDK, admin SDK, coleções
    seed/           # dados de exemplo
    repository.ts   # camada de dados (hoje seed; troca p/ Firestore só aqui)
```

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local
npm run dev            # http://localhost:3000  (storefront)  |  /admin (backoffice)
```

Depois do `.env.local` preenchido (sem Cloud Functions / plano Blaze):

```bash
npm run seed            # bootstrap rules → grava catálogo → restaura rules
npm run firebase:rules  # só rules (firestore + storage), se precisar
npm run dev
```

A camada `src/lib/repository.ts` lê o Firestore real (Client SDK no servidor).
Sem service account e sem Auth, a escrita no CMS admin ainda não persiste —
isso entra no bloco de Auth (itens 5–6).

## Papéis e segurança

`firestore.rules` / `storage.rules` usam custom claims (`admin`, `operator`):
catálogo é público para leitura; pedidos e emissões são restritos ao backoffice;
cliente só enxerga os próprios pedidos.

## Status atual (fases entregues)

- [x] Fundação: scaffold, design system, modelo de domínio, multi-tenant.
- [x] Storefront (UX): home, atrações, passaportes, detalhe e checkout.
- [x] Backoffice: dashboard, **fila de emissão manual**, CMS de atrações, sites.
- [ ] Pagamento (interface pronta; gateway a definir).
- [ ] Integração real de parceiro (API) + orquestração de fulfillment.
- [ ] Migração da camada de dados para Firestore.
