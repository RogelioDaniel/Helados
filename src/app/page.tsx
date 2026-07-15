'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Snowflake,
  X,
} from 'lucide-react';
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CreamIntro } from '@/components/landing/cream-intro';
import type { CreamSession } from '@/components/landing/cream-recipes';
import { FLAVORS, type Flavor } from '@/components/landing/flavor-data';
import { LuxuryEffects } from '@/components/landing/luxury-effects';
import { LuxuryHero } from '@/components/landing/luxury-hero';

const CreamScrollTide = dynamic(() => import('@/components/landing/cream-scroll-tide'), {
  ssr: false,
  loading: () => null,
});

const FAQS = [
  {
    question: '¿Hasta dónde entregan?',
    answer:
      'Entregamos en CDMX y parte de la zona metropolitana. El envío es sin costo en pedidos mayores a $200 MXN; en pedidos menores se calcula una tarifa de $40 MXN.',
  },
  {
    question: '¿Cómo conservo el helado?',
    answer:
      'Guárdalo bien tapado en el congelador. Para recuperar su textura, déjalo reposar cinco minutos antes de servir. Recomendamos disfrutarlo durante la primera semana.',
  },
  {
    question: '¿Hay opciones veganas o sin lactosa?',
    answer:
      'Sí. Fresa y mango con chile pueden prepararse con base de coco. Indícalo al confirmar tu pedido para revisar disponibilidad del día.',
  },
  {
    question: '¿Atienden bodas y eventos?',
    answer:
      'Sí. Preparamos selecciones de sabores y servicio para bodas, celebraciones y eventos de marca. Compártenos fecha, zona y número de invitados para armar una propuesta.',
  },
];

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';

const RECIPE_TO_FEATURED_FLAVOR: Record<string, Flavor['id']> = {
  'fresa-pistache': 'fresa',
  'cacao-cajeta': 'cajeta',
  'mango-chile': 'mango',
  'pistache-cacao': 'pistache',
  'vainilla-cajeta': 'vainilla',
  'zarzamora-crema': 'fresa',
};

function getWhatsAppHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [cartReady, setCartReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introRun, setIntroRun] = useState(0);
  const [creamSession, setCreamSession] = useState<CreamSession | null>(null);
  const closeCartRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pendingDestinationRef = useRef<string | null>(null);
  const destinationPositionedRef = useRef(false);
  const navigationInFlightRef = useRef(false);

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (targetId && document.getElementById(targetId)) {
      pendingDestinationRef.current = targetId;
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem('helado-nube-cart-v2');
        if (saved) setCart(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem('helado-nube-cart-v2');
      } finally {
        setCartReady(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    window.localStorage.setItem('helado-nube-cart-v2', JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    if (!recentlyAdded) return;
    const timer = window.setTimeout(() => setRecentlyAdded(null), 2200);
    return () => window.clearTimeout(timer);
  }, [recentlyAdded]);

  useEffect(() => {
    if (!cartOpen && !menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCartOpen(false);
        setMenuOpen(false);
      }

      if (event.key !== 'Tab' || !cartOpen || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [cartOpen, menuOpen]);

  const cartItems = useMemo(
    () =>
      FLAVORS.flatMap((flavor) => {
        const quantity = cart[flavor.id] ?? 0;
        return quantity > 0 ? [{ ...flavor, quantity }] : [];
      }),
    [cart],
  );

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
  const orderMessage = [
    'Hola, Helado Nube. Quiero confirmar este pedido:',
    '',
    ...cartItems.map((item) => `${item.quantity} × ${item.name} (1 L) — ${money.format(item.quantity * item.price)}`),
    '',
    `Total estimado: ${money.format(cartTotal)} MXN`,
    '',
    '¿Me ayudan a confirmar disponibilidad, entrega y forma de pago?',
  ].join('\n');

  const positionPendingDestination = useCallback(() => {
    const targetId = pendingDestinationRef.current;
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return false;

    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    destinationPositionedRef.current = true;
    return true;
  }, []);

  const handleIntroComplete = useCallback((session: CreamSession) => {
    setCreamSession(session);
    setIntroComplete(true);

    window.requestAnimationFrame(() => {
      if (!destinationPositionedRef.current) positionPendingDestination();

      const targetId = pendingDestinationRef.current;
      const target = targetId ? document.getElementById(targetId) : null;
      target?.focus({ preventScroll: true });
      pendingDestinationRef.current = null;
      destinationPositionedRef.current = false;
      navigationInFlightRef.current = false;
    });
  }, [positionPendingDestination]);

  const handleCreamNavigation = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return;

    const href = event.currentTarget.getAttribute('href');
    const targetId = href?.startsWith('#') ? href.slice(1) : '';
    const target = targetId ? document.getElementById(targetId) : null;
    if (!href || !target) return;

    event.preventDefault();
    if (navigationInFlightRef.current) return;

    navigationInFlightRef.current = true;
    pendingDestinationRef.current = targetId;
    destinationPositionedRef.current = false;
    if (window.location.hash !== href) window.history.pushState(null, '', href);

    setMenuOpen(false);
    setIntroComplete(false);
    setIntroRun((run) => run + 1);
  }, []);

  function addFlavor(flavor: Flavor, event?: ReactMouseEvent<HTMLButtonElement>) {
    setCart((current) => ({ ...current, [flavor.id]: (current[flavor.id] ?? 0) + 1 }));
    setRecentlyAdded(flavor.name);

    if (!event || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.currentTarget.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.035, 0.94)', offset: 0.38 },
        { transform: 'scale(0.985, 1.025)', offset: 0.68 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
    event.currentTarget.querySelector<HTMLElement>('[data-scoop-dot]')?.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)' },
        { transform: 'translate3d(0, -9px, 0) scale(1.5)', offset: 0.48 },
        { transform: 'translate3d(0, 0, 0) scale(1)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function openCart() {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setCartOpen(true);
    window.requestAnimationFrame(() => closeCartRef.current?.focus());
  }

  function closeCart() {
    setCartOpen(false);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sabores de Helado Nube',
    itemListElement: FLAVORS.map((flavor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: flavor.name,
        description: flavor.description,
        image: flavor.image,
        brand: { '@type': 'Brand', name: 'Helado Nube' },
        offers: {
          '@type': 'Offer',
          price: flavor.price,
          priceCurrency: 'MXN',
          availability: 'https://schema.org/LimitedAvailability',
        },
      },
    })),
  };

  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-[#f5efe5] text-[#211a17]">
      <CreamIntro
        key={introRun}
        onRevealStart={positionPendingDestination}
        onComplete={handleIntroComplete}
      />
      {!introComplete ? (
        <p className="sr-only" role="status" aria-live="polite">
          Preparando la primera cucharada
        </p>
      ) : null}
      <div inert={!introComplete} aria-hidden={!introComplete}>
        <LuxuryEffects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <a
        href="#contenido"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-[#211a17] px-4 py-3 text-sm font-semibold text-[#f8f1e8] transition-transform focus:translate-y-0"
      >
        Ir al contenido
      </a>

      <div className="relative z-40 bg-[var(--nube-accent)] px-5 py-2.5 text-[#fff8f1]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
          <span>Edición de temporada</span>
          <span className="h-1 w-1 rounded-full bg-[#fff8f1]/45" />
          <a href="#sabores" className="underline decoration-[#fff8f1]/40 underline-offset-4 hover:decoration-[#fff8f1]">
            Cajeta de Celaya · 15% menos
          </a>
        </div>
      </div>

      <header
        className="sticky top-0 z-50 border-b border-[#211a17]/10 bg-[#f5efe5]/90 backdrop-blur-xl"
        data-site-header
      >
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="Helado Nube, inicio">
            <Image src="/logo.svg" alt="" width={42} height={42} className="transition-transform duration-500 group-hover:-rotate-6" />
            <span className="leading-none">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--nube-accent)]">Casa artesanal</span>
              <span className="font-display mt-1 block text-xl font-semibold tracking-[-0.03em]">Helado Nube</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
            {[
              ['Sabores', '#sabores'],
              ['Nuestra casa', '#historia'],
              ['El proceso', '#proceso'],
              ['Preguntas', '#preguntas'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={handleCreamNavigation}
                className="text-sm font-medium text-[#211a17]/70 transition-colors hover:text-[var(--nube-accent)]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className="group relative inline-flex min-h-11 items-center gap-2 rounded-full border border-[#211a17]/15 px-4 text-sm font-semibold transition-colors hover:border-[var(--nube-accent)] hover:bg-[var(--nube-accent)] hover:text-white active:scale-[0.98]"
              aria-label={`Abrir pedido, ${itemCount} productos`}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
              <span className="hidden sm:inline">Mi pedido</span>
              <span className="inline-grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--nube-accent)] px-1 text-[10px] text-white transition-colors group-hover:bg-white group-hover:text-[var(--nube-accent)]">
                {itemCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-[#211a17]/15 lg:hidden"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-x-0 top-full overflow-hidden border-b border-[#211a17]/10 bg-[#f5efe5] transition-[max-height,opacity] duration-500 lg:hidden ${
            menuOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
          }`}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <nav className="grid gap-1 px-5 py-5" aria-label="Navegación móvil">
            {[
              ['Sabores', '#sabores'],
              ['Nuestra casa', '#historia'],
              ['El proceso', '#proceso'],
              ['Preguntas', '#preguntas'],
            ].map(([label, href], index) => (
              <a
                key={href}
                href={href}
                onClick={(event) => {
                  setMenuOpen(false);
                  handleCreamNavigation(event);
                }}
                tabIndex={menuOpen ? 0 : -1}
                className="font-display flex min-h-14 items-center justify-between border-b border-[#211a17]/10 text-2xl"
              >
                {label}
                <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-[var(--nube-accent)]">0{index + 1}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {introComplete && creamSession ? (
        <CreamScrollTide session={creamSession} suspended={menuOpen || cartOpen} />
      ) : null}

      <div id="contenido">
        <LuxuryHero
          flavors={FLAVORS}
          featuredFlavorId={creamSession ? RECIPE_TO_FEATURED_FLAVOR[creamSession.recipe.id] : undefined}
          itemCount={itemCount}
          onOpenCart={openCart}
        />

        <div className="border-y border-[#211a17]/10 bg-[#eee3d5]" aria-label="Ingredientes de origen">
          <dl className="ingredient-ledger mx-auto grid max-w-[1400px] grid-cols-1 px-5 sm:grid-cols-3 sm:px-8 lg:px-12">
            {[
              ['Papantla', 'Vainilla curada a mano'],
              ['Zamora', 'Fresa de temporada'],
              ['Oaxaca', 'Cacao tostado'],
            ].map(([place, ingredient]) => (
              <div key={place} className="flex items-center justify-between border-b border-[#211a17]/10 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nube-accent)]">{place}</dt>
                <dd className="font-display text-lg text-[#211a17]/72">{ingredient}</dd>
              </div>
            ))}
          </dl>
        </div>

        <section id="sabores" tabIndex={-1} className="scroll-mt-24 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32" data-reveal="copy">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--nube-accent)]">La carta</p>
                  <h2 className="font-display mt-5 max-w-[9ch] text-5xl font-medium leading-[0.93] tracking-[-0.045em] sm:text-6xl">
                    Seis sabores con lugar de origen.
                  </h2>
                  <p className="mt-6 max-w-[38ch] text-sm leading-7 text-[#211a17]/62 sm:text-base">
                    Cada receta empieza en el ingrediente. La disponibilidad cambia con el mercado y la temporada.
                  </p>
                  <button
                    type="button"
                    onClick={openCart}
                    className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-[#211a17] text-sm font-bold transition-colors hover:border-[var(--nube-accent)] hover:text-[var(--nube-accent)]"
                  >
                    Ver mi pedido
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#211a17] px-1.5 text-[10px] text-white">{itemCount}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="border-b border-[#211a17]/15">
                  {FLAVORS.map((flavor, index) => (
                    <article
                      key={flavor.id}
                      className="flavor-row group grid grid-cols-[92px_minmax(0,1fr)] gap-x-4 gap-y-5 border-t border-[#211a17]/15 py-6 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-x-6 sm:py-8 lg:grid-cols-[150px_minmax(0,1fr)_100px_142px] lg:items-center lg:gap-7"
                      data-flavor-row
                      data-reveal="row"
                      style={{ '--flavor-color': flavor.color } as CSSProperties}
                    >
                      <div className="flavor-scoop-thumb relative aspect-square overflow-hidden rounded-full bg-[#e5d8ca]">
                        <Image
                          src={flavor.image}
                          alt={flavor.imageAlt}
                          fill
                          sizes="150px"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                        />
                        <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-[#211a17]/45 text-[9px] font-semibold text-white backdrop-blur-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="self-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--nube-accent)] sm:text-[10px]">{flavor.eyebrow}</p>
                        <h3 className="font-display mt-2 text-[1.75rem] font-medium leading-none tracking-[-0.035em] sm:text-[2.15rem]">{flavor.name}</h3>
                        <p className="mt-3 hidden max-w-[46ch] text-sm leading-6 text-[#211a17]/60 sm:block">{flavor.description}</p>
                        <p className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#211a17]/45">
                          <span className="h-1 w-1 rounded-full bg-[var(--nube-accent)]" />
                          {flavor.origin}
                        </p>
                      </div>
                      <div className="col-start-2 lg:col-auto lg:text-right">
                        <p className="font-display text-2xl leading-none">{money.format(flavor.price)}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#211a17]/45">1 litro · MXN</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => addFlavor(flavor, event)}
                        className="scoop-add-button col-start-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#211a17]/20 px-5 text-xs font-bold uppercase tracking-[0.08em] hover:border-[var(--nube-accent)] hover:bg-[var(--nube-accent)] hover:text-white lg:col-auto"
                      >
                        <span className="scoop-add-dot" data-scoop-dot aria-hidden="true" />
                        {recentlyAdded === flavor.name ? (
                          <Check className="h-4 w-4" strokeWidth={1.8} />
                        ) : (
                          <Plus className="h-4 w-4" strokeWidth={1.8} />
                        )}
                        {recentlyAdded === flavor.name ? 'Servido' : 'Servir'}
                      </button>
                    </article>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-[#211a17]/48">
                  Precios estimados por litro. Cajeta aplica con 15% de descuento al confirmar disponibilidad durante la temporada.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="historia" tabIndex={-1} className="scroll-mt-24 bg-[#211a17] py-24 text-[#f8f1e8] sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="history-cream-wipe relative lg:col-span-6" data-cream-wipe>
                <div className="relative aspect-[4/5] max-h-[760px] overflow-hidden rounded-[2rem] bg-[#55483e]">
                  <Image
                    src="/img/historia-2.png"
                    alt="Textura del helado artesanal de la casa al momento de servir"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#211a17]/45 via-transparent to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:bottom-8 sm:left-8">
                    Batido lento · Textura suave · Servicio al momento
                  </p>
                </div>
                <div className="absolute -bottom-8 -right-3 hidden w-[42%] overflow-hidden rounded-[1.4rem] border-[6px] border-[#211a17] sm:block lg:-right-9">
                  <div className="relative aspect-square">
                    <Image src="/img/gallery-1.png" alt="Selección de sabores artesanales Helado Nube" fill sizes="260px" className="object-cover" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 lg:col-start-8" data-reveal="copy">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#dba0ae]">Nuestra historia</p>
                <h2 className="font-display mt-5 max-w-[10ch] text-5xl font-medium leading-[0.92] tracking-[-0.045em] sm:text-6xl">
                  Una receta con memoria desde 1962.
                </h2>
                <p className="font-display mt-8 text-2xl font-normal italic leading-8 text-[#ead8cb]">
                  “Empezó con doña Lucha y un carrito de paletas por las calles de Pátzcuaro.”
                </p>
                <div className="mt-8 space-y-5 text-sm leading-7 text-[#f8f1e8]/62 sm:text-base">
                  <p>
                    Hoy seguimos con su recetario manchado de vainilla. Elegimos la fruta temprano, batimos sin prisa y dejamos que cada sabor hable del lugar de donde viene.
                  </p>
                  <p>
                    No buscamos que todo sepa igual. Buscamos el punto exacto en que la fresa todavía sabe a fresa y el cacao conserva su carácter.
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-4 border-t border-white/15 pt-6">
                  <span className="font-display text-3xl italic text-[#dba0ae]">Nube</span>
                  <span className="h-px w-10 bg-white/20" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Tres generaciones · México</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="proceso" tabIndex={-1} className="scroll-mt-24 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5" data-reveal="copy">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--nube-accent)]">El proceso</p>
                <h2 className="font-display mt-5 max-w-[9ch] text-5xl font-medium leading-[0.92] tracking-[-0.045em] sm:text-6xl">
                  Lo premium también se puede explicar.
                </h2>
                <p className="mt-6 max-w-[43ch] text-sm leading-7 text-[#211a17]/62 sm:text-base">
                  Nada de misterio: buena materia prima, tiempo y una cadena de frío cuidada hasta tu puerta.
                </p>
              </div>

              <div className="lg:col-span-7" data-reveal="list">
                <div className="divide-y divide-[#211a17]/15 border-y border-[#211a17]/15">
                  {[
                    {
                      icon: Leaf,
                      number: '01',
                      title: 'Elegimos por temporada',
                      text: 'Compramos fruta por aroma y madurez; no por uniformidad. Por eso la carta puede cambiar.',
                    },
                    {
                      icon: Clock3,
                      number: '02',
                      title: 'Batimos en lotes pequeños',
                      text: 'Trabajamos cada mezcla lentamente para cuidar el cuerpo, el aroma y una textura limpia.',
                    },
                    {
                      icon: Snowflake,
                      number: '03',
                      title: 'Cuidamos el frío',
                      text: 'Empacamos cada pedido para que llegue listo para servir, con instrucciones simples de conservación.',
                    },
                  ].map((step) => (
                    <article
                      key={step.number}
                      className="process-step group grid gap-5 py-8 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:py-10"
                      data-process-step
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-full border border-[#211a17]/15 transition-colors group-hover:border-[var(--nube-accent)] group-hover:bg-[var(--nube-accent)] group-hover:text-white">
                        <step.icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="font-display text-3xl font-medium tracking-[-0.035em]">{step.title}</h3>
                        <p className="mt-3 max-w-[50ch] text-sm leading-6 text-[#211a17]/58">{step.text}</p>
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--nube-accent)]">{step.number}</span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 sm:pb-32" aria-labelledby="momentos-title">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" data-reveal="copy">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--nube-accent)]">La mesa Nube</p>
                <h2 id="momentos-title" className="font-display mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Hecho para mirar de cerca.</h2>
              </div>
              <p className="max-w-[38ch] text-sm leading-6 text-[#211a17]/55">Textura, ingrediente y servicio. Tres formas de reconocer un helado bien hecho.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2">
              <figure className="gallery-frame group relative min-h-[420px] overflow-hidden rounded-[1.6rem] md:col-span-7 md:row-span-2 md:min-h-[680px]" data-reveal="image">
                <Image src="/img/gallery-3.png" alt="Textura de helado de chocolate oaxaqueño" fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                <figcaption className="absolute inset-x-5 bottom-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:inset-x-7 sm:bottom-7">Cacao · Oaxaca</figcaption>
              </figure>
              <figure className="gallery-frame group relative min-h-[300px] overflow-hidden rounded-[1.6rem] md:col-span-5 md:min-h-0" data-reveal="image">
                <Image src="/img/historia-3.png" alt="Cono artesanal de pistache" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                <figcaption className="absolute inset-x-5 bottom-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:inset-x-7">Pistache · Tostado al comal</figcaption>
              </figure>
              <figure className="gallery-frame group relative min-h-[300px] overflow-hidden rounded-[1.6rem] md:col-span-5 md:min-h-0" data-reveal="image">
                <Image src="/img/gallery-2.png" alt="Helado artesanal de mango" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                <figcaption className="absolute inset-x-5 bottom-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#211a17]/70 sm:inset-x-7">Mango Manila · Fruta de temporada</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="melting-section relative bg-[var(--cream-theme-surface)] py-20 text-[var(--cream-theme-on-surface)] sm:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:px-12">
            <div className="lg:col-span-8" data-reveal="copy">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cream-theme-muted)]">Bodas · Celebraciones · Eventos de marca</p>
              <h2 className="font-display mt-5 max-w-[13ch] text-5xl font-medium leading-[0.92] tracking-[-0.045em] sm:text-6xl">
                Una mesa de helado que sí pertenece a la ocasión.
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pl-10" data-reveal="copy">
              <p className="text-sm leading-7 text-[var(--cream-theme-muted)]">Curamos sabores, cantidades y servicio según tu evento. Cuéntanos fecha, zona y número de invitados.</p>
              <a
                href={getWhatsAppHref('Hola, Helado Nube. Quiero cotizar helado para un evento. Fecha: ____. Zona: ____. Invitados: ____.')}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[var(--cream-theme-on-surface)] px-6 text-sm font-bold text-[var(--cream-theme-surface)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Cotizar mi evento
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <span className="melt-edge" aria-hidden="true" />
        </section>

        <section id="preguntas" tabIndex={-1} className="scroll-mt-24 py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12">
            <div className="lg:col-span-4" data-reveal="copy">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cream-theme-accent)]">Antes de pedir</p>
              <h2 className="font-display mt-5 text-5xl font-medium leading-[0.92] tracking-[-0.045em] sm:text-6xl">Todo claro desde el primer antojo.</h2>
              <p className="mt-6 max-w-[38ch] text-sm leading-7 text-[#211a17]/60">Si tu pregunta no aparece aquí, inclúyela al compartir tu pedido.</p>
            </div>
            <div className="border-b border-[#211a17]/15 lg:col-span-8" data-reveal="list">
              {FAQS.map((faq, index) => {
                const open = activeFaq === index;
                return (
                  <div key={faq.question} className="faq-item border-t border-[#211a17]/15">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(open ? null : index)}
                      className="faq-trigger flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left"
                      aria-expanded={open}
                      aria-controls={`faq-${index}`}
                    >
                      <span className="font-display text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{faq.question}</span>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#211a17]/15 transition-transform duration-300 ${open ? 'rotate-180 bg-[#211a17] text-white' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    <div id={`faq-${index}`} className={`faq-panel grid transition-[grid-template-rows] duration-500 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="max-w-[62ch] pb-7 text-sm leading-7 text-[#211a17]/60 sm:text-base">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-6 sm:px-8 lg:px-12">
          <div className="closing-cta relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[var(--cream-theme-panel)] px-6 py-20 sm:px-12 sm:py-24 lg:px-20" data-reveal="cream-cta">
            <div className="relative z-10 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cream-theme-accent)]">Tu próxima sobremesa</p>
              <h2 className="font-display mt-5 text-5xl font-medium leading-[0.9] tracking-[-0.05em] sm:text-7xl">Elige el sabor. Nosotros cuidamos el frío.</h2>
              <p className="mt-6 max-w-[52ch] text-sm leading-7 text-[#211a17]/64 sm:text-base">Arma tu selección y confirma por WhatsApp disponibilidad, cobertura y horario de entrega.</p>
              <button
                type="button"
                onClick={openCart}
                className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-[#211a17] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Revisar mi pedido
                <ShoppingBag className="h-4 w-4" />
                <span className="rounded-full bg-white/14 px-2 py-0.5 text-[10px]">{itemCount}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-[#211a17] pb-28 pt-16 text-[#f8f1e8] sm:pb-10 sm:pt-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 border-b border-white/12 pb-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <a href="#inicio" className="flex items-center gap-3">
                <Image src="/logo.svg" alt="" width={44} height={44} />
                <span className="font-display text-3xl font-medium">Helado Nube</span>
              </a>
              <p className="mt-5 max-w-[36ch] text-sm leading-7 text-white/50">Helado artesanal mexicano, batido en lotes pequeños y entregado con cadena de frío cuidada.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:col-span-4 lg:col-start-9">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dba0ae]">Explorar</p>
                <div className="mt-5 grid gap-3 text-sm text-white/60">
                  <a href="#sabores" className="hover:text-white">Sabores</a>
                  <a href="#historia" className="hover:text-white">Historia</a>
                  <a href="#proceso" className="hover:text-white">Proceso</a>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dba0ae]">Pedir</p>
                <div className="mt-5 grid gap-3 text-sm text-white/60">
                  <button type="button" onClick={openCart} className="text-left hover:text-white">Mi pedido</button>
                  <a href="#preguntas" className="hover:text-white">Preguntas</a>
                  <a href={getWhatsAppHref('Hola, Helado Nube. Quiero información sobre sus sabores.')} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Helado Nube · México</p>
            <p>La disponibilidad y cobertura se confirman al ordenar.</p>
          </div>
        </div>
      </footer>

      <div
        className={`fixed inset-0 z-[80] transition-[visibility] ${cartOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!cartOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-[#211a17]/48 backdrop-blur-[2px] transition-opacity duration-500 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeCart}
          aria-label="Cerrar pedido"
          tabIndex={cartOpen ? 0 : -1}
        />
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
          className={`cart-drawer absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-[#faf5ed] shadow-[-28px_0_80px_-40px_rgba(33,26,23,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            cartOpen ? 'cart-drawer-open translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-[82px] items-center justify-between border-b border-[#211a17]/12 px-5 sm:px-7">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--nube-accent)]">Selección actual</p>
              <h2 id="cart-title" className="font-display mt-1 text-2xl font-medium">Mi pedido</h2>
            </div>
            <button
              ref={closeCartRef}
              type="button"
              onClick={closeCart}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#211a17]/15 transition-colors hover:bg-[#211a17] hover:text-white"
              aria-label="Cerrar pedido"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            {cartItems.length === 0 ? (
              <div className="grid min-h-full place-items-center py-16 text-center">
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#211a17]/15 text-[var(--nube-accent)]">
                    <ShoppingBag className="h-6 w-6" strokeWidth={1.4} />
                  </span>
                  <h3 className="font-display mt-6 text-3xl font-medium">Tu selección está vacía.</h3>
                  <p className="mx-auto mt-3 max-w-[30ch] text-sm leading-6 text-[#211a17]/55">Elige uno o varios sabores y vuelve cuando estés listo.</p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#211a17] text-sm font-bold"
                  >
                    Explorar sabores
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#211a17]/12 border-y border-[#211a17]/12">
                {cartItems.map((item) => (
                  <article key={item.id} className="grid grid-cols-[72px_1fr] gap-4 py-5">
                    <div className="relative aspect-square overflow-hidden rounded-full bg-[#e5d8ca]">
                      <Image src={item.image} alt="" fill sizes="72px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-medium leading-5">{item.name}</h3>
                          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#211a17]/45">1 litro · {money.format(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold">{money.format(item.quantity * item.price)}</p>
                      </div>
                      <div className="mt-4 inline-flex items-center rounded-full border border-[#211a17]/15">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#211a17] hover:text-white"
                          aria-label={`Quitar una unidad de ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs font-bold" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#211a17] hover:text-white"
                          aria-label={`Agregar una unidad de ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-[#211a17]/12 bg-[#f4ecdf] px-5 py-6 sm:px-7">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#211a17]/45">Total estimado</p>
                  <p className="mt-1 text-xs text-[#211a17]/50">Entrega se confirma por zona</p>
                </div>
                <p className="font-display text-4xl font-medium tracking-[-0.04em]">{money.format(cartTotal)}</p>
              </div>
              <a
                href={getWhatsAppHref(orderMessage)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--nube-accent)] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {whatsappNumber ? 'Confirmar por WhatsApp' : 'Compartir pedido en WhatsApp'}
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-center text-[10px] leading-4 text-[#211a17]/45">No se cobra nada en este paso. Primero confirmamos disponibilidad, cobertura y horario.</p>
            </div>
          )}
        </aside>
      </div>

      {itemCount > 0 && (
        <button
          type="button"
          onClick={openCart}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex min-h-14 items-center justify-between rounded-full bg-[#211a17] px-5 text-white shadow-[0_20px_60px_-22px_rgba(33,26,23,0.8)] sm:hidden"
          aria-label={`Continuar pedido con ${itemCount} productos por ${money.format(cartTotal)}`}
        >
          <span className="flex items-center gap-2 text-xs font-bold">
            <ShoppingBag className="h-4 w-4" />
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </span>
          <span className="flex items-center gap-2 text-sm font-bold">
            {money.format(cartTotal)}
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      )}

      <div
        className={`served-toast pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#211a17] px-5 py-3 text-xs font-semibold text-white shadow-xl transition-[transform,opacity] duration-500 ${
          recentlyAdded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
        data-active={Boolean(recentlyAdded)}
        role="status"
        aria-live="polite"
      >
        <Check className="h-4 w-4 text-[#dba0ae]" />
        {recentlyAdded ? `${recentlyAdded} se añadió a tu pedido` : ''}
      </div>
      </div>
    </main>
  );
}
