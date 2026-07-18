# Checklist — o que fizemos (sessão de fundação)

## Decisões alinhadas com o cliente

- [x] Stack definida: Next.js + TypeScript + Tailwind + Firebase
- [x] Multi-site / whitelabel desde o início
- [x] Pagamento deixado abstraído (gateway a definir depois)
- [x] Escopo de início: catálogo/CMS + protótipo de UX

## Fundação técnica

- [x] Scaffold Next.js (App Router) + TypeScript strict + Tailwind + ESLint
- [x] Estrutura modular por feature (`tenant`, `partners`, `attractions`, `catalog`, `orders`, `fulfillment`)
- [x] Design system base (tokens CSS, tipografia Inter/Fraunces, Button, Card, Badge)
- [x] Theming por tenant via CSS variables
- [x] README com arquitetura e instruções de setup

## Modelo de domínio

- [x] Tipos: `Site`, `Partner`, `Attraction`, `TicketType`, `Product`/`Passport`, `Order`, `Fulfillment`
- [x] Separação Produto (o que o cliente vê) × Fulfillment (o que a operação emite)
- [x] Estratégias de emissão: `API` | `MANUAL`
- [x] Modos de disponibilidade: `SCHEDULED` | `DATED` | `OPEN`
- [x] Contrato `PartnerAdapter` + `ManualAdapter` + registry
- [x] Interface de pagamento (`PaymentRef`) desacoplada do gateway

## Multi-tenant

- [x] Resolução de site por `Host`
- [x] Recorte de catálogo por site (`attractionIds`)
- [x] Seed com site OneRio + site whitelabel AquaRio

## Firebase (preparação)

- [x] Client SDK + Admin SDK
- [x] Nomes de coleções centralizados
- [x] `firestore.rules` e `storage.rules` com papéis (`admin` / `operator`)
- [x] `firebase.json` + emuladores + indexes
- [x] Script de seed (`npm run seed`)
- [x] Camada `repository.ts` isolada (hoje seed; pronta para Firestore)

## Storefront (UX)

- [x] Home com hero, perks e destaques
- [x] Listagem de atrações e passaportes
- [x] Página de atração com conteúdo CMS + painel de reserva (data/horário/ingressos)
- [x] Página de passaporte com composição e tags de emissão por item
- [x] Checkout com resumo, dados do cliente e métodos PIX/cartão (mock)
- [x] Dados de seed realistas (Corcovado, AquaRio, Pão de Açúcar, Museu do Amanhã, Passaporte Rio Essencial)

## Backoffice

- [x] Layout admin com sidebar
- [x] Dashboard com métricas e emissões pendentes
- [x] Fila de emissão manual (cópia de dados + UI de anexar bilhete)
- [x] Listagem de atrações / parceiros / passaportes / sites
- [x] Editor CMS de atração (Zod + server action)
- [x] Validação: build limpo, 14 rotas, páginas respondendo 200
