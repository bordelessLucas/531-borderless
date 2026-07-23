/**
 * Assets oficiais espelhados do site OneRio Pass (oneriopass.com).
 * Usados na home e como fallback visual por slug.
 */

export const ONERIO_HERO_SLIDES = [
  {
    id: "aquario",
    image: "/images/hero/aquario.webp",
    title: "O Maior Aquário da América do Sul!",
    description:
      "Visite o AquaRio e veja de perto as maravilhas e os mistérios da vida oceânica!",
    cta: "Ver Ingressos",
    href: "/atracoes#destaques",
  },
  {
    id: "mar-espelhos",
    image: "/images/hero/mar-espelhos.webp",
    title: "Encante-se com o Mar de Espelhos",
    description:
      "Visite o Mar de Espelhos e encante-se com os cenários incríveis e uma experiência única!",
    cta: "Ver Ingressos",
    href: "/atracoes",
  },
  {
    id: "bioparque",
    image: "/images/hero/bioparque.webp",
    title: "Descubra o Novo BioParque do Rio",
    description: "Visite o BioParque do Rio! Um novo conceito de zoológico repleto de vida!",
    cta: "Ver Ingressos",
    href: "/atracoes/bioparque-do-rio",
  },
  {
    id: "mar-espelhos-2",
    image: "/images/hero/mar-espelhos-2.webp",
    title: "Faça Fotos Incríveis no Mar de Espelhos!",
    description:
      "Visite o Mar de Espelhos e encante-se com os cenários incríveis e uma experiência única!",
    cta: "Ver Ingressos",
    href: "/atracoes",
  },
  {
    id: "roda-gigante",
    image: "/images/hero/roda-gigante.webp",
    title: "Uma Vista de Tirar o Fôlego!",
    description: "Visite a Roda Gigante do Rio! 88 Metros e uma vista de tirar o fôlego!",
    cta: "Ver Ingressos",
    href: "/atracoes/yup-star-roda-gigante",
  },
  {
    id: "pao-de-acucar",
    image: "/images/hero/pao-de-acucar.jpeg",
    title: "Amanhecer no Pão de Açúcar",
    description:
      "Descubra uma experiência exclusiva: veja o nascer do sol no Pão de Açúcar e aproveite um café da manhã especial.",
    cta: "Ver Opções",
    href: "/atracoes/bondinho-pao-de-acucar",
  },
] as const;

export const ONERIO_PARTNERS = [
  { src: "/images/partners/bondinho.png", alt: "Bondinho Pão de Açúcar" },
  { src: "/images/partners/aquario.png", alt: "AquaRio" },
  { src: "/images/partners/bioparque.webp", alt: "BioParque do Rio" },
  { src: "/images/partners/paineiras.webp", alt: "Paineiras Corcovado" },
  { src: "/images/partners/c2rio.png", alt: "C2Rio" },
  { src: "/images/partners/roda-gigante.webp", alt: "Roda Gigante do Rio" },
  { src: "/images/partners/mar-espelhos.webp", alt: "Mar de Espelhos" },
] as const;

export const ONERIO_TRUST = [
  {
    image: "/images/trust/tickets.webp",
    title: "INGRESSOS OFICIAIS",
    description:
      "Todos os ingressos vendidos pela OneRio são oficiais e emitidos diretamente através das atrações turísticas parceiras disponíveis em nosso catálogo.",
  },
  {
    image: "/images/trust/card.webp",
    title: "PAGAMENTO ONLINE",
    description:
      "A OneRio oferece diversas formas de pagamento online, como Pix e cartão de crédito.",
  },
  {
    image: "/images/trust/safe.webp",
    title: "COMPRA SEGURA",
    description:
      "O site possui certificado SSL, que protege seus dados e garante uma compra segura.",
  },
  {
    image: "/images/trust/cadastur.png",
    title: "CERTIFICADO CADASTUR",
    description:
      "A OneRio é uma agência registrada no Ministério do Turismo e possui o certificado do Cadastur",
  },
] as const;

/** Imagens de produto do site oficial, indexadas por slug do catálogo. */
export const ONERIO_PRODUCT_IMAGES: Record<string, { url: string; alt: string }> = {
  "aquario-rio": {
    url: "/images/attractions/aquario.webp",
    alt: "AquaRio Rio de Janeiro",
  },
  "yup-star-roda-gigante": {
    url: "/images/attractions/roda-gigante.webp",
    alt: "Roda Gigante Yup Star Rio",
  },
  "bondinho-pao-de-acucar": {
    url: "/images/attractions/bondinho.webp",
    alt: "Bondinho do Pão de Açúcar",
  },
  "bioparque-do-rio": {
    url: "/images/attractions/bioparque.jpeg",
    alt: "Lontra no BioParque do Rio",
  },
};

export function resolveProductImage(
  slug: string,
  fallback: { url: string; alt: string },
): { url: string; alt: string } {
  return ONERIO_PRODUCT_IMAGES[slug] ?? fallback;
}
