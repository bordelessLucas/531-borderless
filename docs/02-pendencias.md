# Pendências — o que falta implementar

Lista numerada por prioridade sugerida (do bloqueante ao evolutivo).

## Fundação & dados

1. ~~Criar/selecionar projeto Firebase real e autenticar (`firebase login` + `use <PROJECT_ID>`)~~ — feito: `gustavo-c049a`
2. ~~Preencher `.env.local` com a config Web do Firebase (`apps:sdkconfig WEB`)~~ — feito
3. ~~Subir emuladores locais e popular com seed (`npm run emulators` + `npm run seed`)~~ — seed no projeto real via `npm run seed` (sem Functions; bootstrap temporário de rules)
4. ~~Migrar `src/lib/repository.ts` do seed estático para queries reais no Firestore~~
5. ~~Implementar Auth (email/senha e/ou Google) com custom claims (`admin`, `operator`, cliente)~~ — allowlist `ADMIN_EMAILS` + `config/staff` (Spark, sem Functions); claims opcionais com SA
6. ~~Proteger rotas `/admin/*` (middleware) — só staff autenticado~~
7. ~~Área do cliente: login, meus pedidos e download de bilhetes~~

> **Nota Spark (sem Blaze):** Auth + sessão via ID token (JWKS), sem Cloud Functions.
> Staff = `ADMIN_EMAILS` / `OPERATOR_EMAILS` + doc `config/staff`. Para espelhar role no
> `users/{uid}`: `npm run promote-admin -- --uid=<UID> --role=admin`.
> Ative **E-mail/Senha** e **Google** em Authentication no Console Firebase.

## Pagamento

8. Definir gateway (Pagar.me, Stripe ou Mercado Pago)
9. Implementar provider concreto atrás de `PaymentRef` (Pix + cartão)
10. Webhook de confirmação de pagamento → transição `AWAITING_PAYMENT` → `PAID`
11. ~~Persistência real do pedido no Firestore no checkout~~ — `placeOrder` + orquestração de fulfillments (pagamento mock)
12. Fluxo de cancelamento/reembolso e estorno parcial

## Catálogo & CMS (completar)

13. ~~CRUD completo de `TicketType` (categorias, preço, SKU do parceiro, strategy)~~
14. ~~Editor de calendário: slots, temporadas, blackouts, lead time, validade~~
15. ~~Editor de conteúdo rico (blocos)~~ — editor de blocos com URL de imagem; upload Storage CMS pendente
16. ~~Editor de passaporte: composição, obrigatórios/opcionais, preço fechado~~
17. CRUD de parceiros (integração, comissão, estratégia padrão)
18. CRUD de sites (domínios, tema, recorte de catálogo, branding)
19. Publicação/rascunho/arquivo com preview por site
20. SEO por página (meta title/description, OG image, sitemap)

## Disponibilidade

21. ~~Motor de disponibilidade real~~ — datas/slots por atração (weekdays, blackouts, lead time, temporada); interseção de passaporte ainda parcial
22. Consulta de cotas/capacidade por data e horário
23. Integração do adapter de API com `checkAvailability` em tempo real
24. Bloqueio de overbooking e reserva temporária no checkout (hold)

## Fulfillment (operação)

25. ~~Orquestrador: ao pagar, explode `OrderItem` em N `Fulfillments`~~
26. Disparo automático dos adapters `API` e enfileiramento dos `MANUAL` — MANUAL na fila; API ainda stub
27. ~~Fila manual funcional: upload real de PDF no Storage + marcar `ISSUED`~~
28. E-mail automático ao cliente quando todos os fulfillments estiverem `ISSUED`/`DELIVERED`
29. Retry, dead-letter e alerta de falha (`FAILED`) para a operação
30. Cancelamento de bilhete via adapter (`cancel`) quando houver reembolso

## Integrações de parceiros

31. Implementar primeiro adapter real de API (ex.: `generic-rest` ou parceiro piloto)
32. Credenciais seguras por parceiro (Secret Manager / env por adapter)
33. Mapeamento SKU (`partnerSkuCode`) ↔ categoria local
34. Logs de auditoria das chamadas ao parceiro
35. Segundo e demais adapters conforme parceiros forem onboarding

## Multi-site / whitelabel

36. Middleware de host → site em produção (domínios customizados)
37. Configuração de DNS/domínio por parceiro
38. Logo, favicon e cores editáveis no admin por site
39. Isolamento de pedidos/métricas por `siteId`

## Backoffice operacional

40. ~~Listagem e detalhe de pedidos (filtro por status, site, parceiro, data)~~ — listagem + filtros básicos
41. CRM leve: histórico do cliente, contatos, observações internas
42. Métricas e relatórios (vendas, conversão, taxa de emissão manual, SLA da fila)
43. Notificações internas (novos itens na fila, falhas de API)
44. Gestão de usuários/staff e papéis

## UX / storefront (refinar)

45. Carrinho multi-item (hoje o checkout é 1 produto por vez)
46. Agendamento pós-compra das atrações do passaporte (datas por item)
47. Página de confirmação de pedido com status de cada emissão
48. Mobile polish (booking panel, checkout, fila admin)
49. Acessibilidade (foco, ARIA, contraste) e performance (imagens, LCP)
50. Conteúdo institucional (FAQ geral, termos, política de cancelamento)

## Qualidade & DevOps

51. Testes unitários do domínio (disponibilidade, composição de passaporte, orquestração)
52. Testes de integração dos adapters e webhooks de pagamento
53. CI (lint, typecheck, build, rules do Firestore)
54. Deploy (Vercel ou Firebase App Hosting) + ambientes staging/prod
55. Observabilidade (Sentry/Crashlytics, logs estruturados)
56. Backup e retenção de bilhetes no Storage

---

**Sugestão de próximo bloco:** gateway de pagamento (**8–10**), e-mail pós-emissão (**28**), CRUD parceiros/sites (**17–18**), adapter API piloto (**31**).

**Ops manuais agora:**
- Publicar rules: `npm run firebase:rules`
- Ativar **Storage** no Console Firebase (upload de bilhetes)
- Confirmar providers Auth (E-mail/Senha + Google)
