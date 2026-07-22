/**
 * Livro da Voz OneRio — fonte de verdade para tom e copy do storefront.
 *
 * Arquétipos: Facilitadora + Curadora.
 * Tom: claro, objetivo, confiável, direto. Sem urgência artificial nem
 * exagero promocional. Organização e clareza como valor.
 */

export const ONERIO_VOICE = {
  /** Uma linha (estilo bio / posicionamento). */
  tagline: "Organize sua experiência no Rio.",
  /** Proposta curta para SEO e share. */
  metaDescription:
    "Ingressos antecipados e passaportes com clareza, segurança e menos imprevistos. Organize a visita antes de chegar.",
  /** Subtítulo institucional. */
  promise:
    "Centralizamos atrações e passaportes para você decidir com clareza, comprar com segurança e chegar com tudo resolvido.",

  /** Frases de encerramento / CTA (sem escassez performática). */
  cta: {
    primary: "Organize sua visita",
    exploreAttractions: "Ver atrações",
    explorePassports: "Ver passaportes",
    buyAhead: "Garantir com antecedência",
    resolveBefore: "Resolver antes de ir",
    goToCheckout: "Continuar para o pagamento",
    finishOrder: "Confirmar pedido",
    viewOrder: "Acompanhar pedido",
  },

  home: {
    eyebrow: "Planeje antes de ir",
    headline: "O Rio organizado em um só lugar.",
    support:
      "Ingressos e passaportes com informação clara, compra antecipada e menos imprevistos no caminho.",
    perks: [
      {
        title: "Compra antecipada",
        desc: "Garanta disponibilidade, evite filas e chegue com o ingresso resolvido.",
      },
      {
        title: "Decisão centralizada",
        desc: "Menos abas abertas: atrações e passaportes com regras e horários objetivos.",
      },
      {
        title: "Compra com confiança",
        desc: "Processo transparente, confirmação clara e bilhetes na sua conta.",
      },
    ],
    featuredPassportLabel: "Passaporte em destaque",
    featuredPassportCta: "Conhecer passaporte",
    attractionsTitle: "Atrações selecionadas",
    attractionsSupport: "Escolhas organizadas para planejar a visita com antecedência.",
    attractionsLink: "Ver todas as atrações",
  },

  attractions: {
    title: "Atrações",
    support:
      "Ingressos individuais com datas, horários e regras claras — para decidir com segurança.",
  },

  passports: {
    title: "Passaportes",
    support:
      "Várias atrações em uma só compra. Curadoria prática para organizar o roteiro com menos fricção.",
  },

  footer: {
    blurb:
      "A OneRio organiza escolhas e simplifica o acesso às experiências da cidade — com clareza, previsibilidade e respeito ao seu tempo.",
  },

  header: {
    ctaGuest: "Organizar visita",
  },

  checkout: {
    title: "Finalizar pedido",
    emptyTitle: "Nenhum item selecionado",
    emptySupport: "Escolha uma atração ou passaporte para organizar sua visita.",
    loginPromptTitle: "Entre para concluir com segurança",
    loginPromptBody:
      "Assim o pedido fica na sua conta e os bilhetes ficam disponíveis quando a emissão for concluída.",
    successTitle: "Pedido organizado",
    successBody:
      "Seu pedido foi registrado. Acompanhe a emissão e baixe os bilhetes na sua conta.",
    paymentNote:
      "Pagamento em modo demonstração (sem gateway). Os bilhetes aparecem em Minha conta após a emissão.",
    submit: "Confirmar pedido",
  },

  auth: {
    loginTitle: "Entrar",
    loginSupport: "Acesse pedidos, bilhetes e, se for staff, o backoffice.",
    registerTitle: "Criar conta",
    registerSupport: "Uma conta para acompanhar pedidos e baixar bilhetes com segurança.",
  },

  account: {
    ordersEmpty:
      "Quando você organizar uma visita, o pedido e os bilhetes aparecem aqui.",
    ordersSupport: "Histórico de pedidos e bilhetes disponíveis para download.",
  },
} as const;

/** Princípios rápidos para copy futura (CMS, e-mails, campanhas). */
export const ONERIO_VOICE_RULES = [
  "Organiza antes de persuadir; informa antes de prometer.",
  "Sem urgência artificial, escassez performática ou adjetivação exagerada.",
  "Ênfase em tempo, clareza, centralização e confiança — não só em preço.",
  "Tom próximo e moderno, sem informalidade excessiva nem frieza institucional.",
  "A experiência começa no planejamento: comprar antes é parte do lazer.",
] as const;
