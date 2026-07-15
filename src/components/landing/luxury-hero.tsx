import { ArrowDownRight, ArrowRight, Clock3, MapPin, Snowflake } from 'lucide-react';
import type { Flavor } from './flavor-data';
import { HeroFlavorCatalogue } from './hero-flavor-catalogue';

type LuxuryHeroProps = {
  flavors: readonly Flavor[];
  featuredFlavorId?: string;
  itemCount: number;
  onOpenCart: () => void;
  onFlavorChange: (flavor: Flavor) => void;
};

export function LuxuryHero({
  flavors,
  featuredFlavorId,
  itemCount,
  onOpenCart,
  onFlavorChange,
}: LuxuryHeroProps) {
  return (
    <section id="inicio" tabIndex={-1} className="scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5 lg:px-7">
      <div
        className="nube-hero relative mx-auto grid max-w-[1540px] overflow-hidden rounded-[1.7rem] bg-[var(--cream-base)] sm:rounded-[2.2rem] lg:min-h-[calc(100dvh-126px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:rounded-[2.8rem]"
        data-hero-stage
      >
        <div className="nube-hero-ambient absolute inset-0" aria-hidden="true" />

        <div className="relative z-20 flex px-5 pb-7 pt-9 sm:px-9 sm:pb-8 sm:pt-12 lg:items-center lg:px-[clamp(3.5rem,7vw,7.75rem)] lg:py-20">
          <div className="max-w-[660px]">
            <p className="hero-copy hero-copy-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--nube-accent)] sm:text-xs">
              <span className="h-px w-9 bg-[var(--nube-accent)]" />
              Heladería artesanal · Desde 1962
            </p>
            <h1 className="font-display hero-copy hero-copy-2 mt-6 max-w-[8.8ch] text-[clamp(3.75rem,8.1vw,8.4rem)] font-medium leading-[0.82] tracking-[-0.068em] text-[#2a1913]">
              El lujo se sirve <em className="font-normal text-[var(--nube-accent)]">despacio.</em>
            </h1>
            <p className="hero-copy hero-copy-3 mt-7 max-w-[48ch] text-sm leading-7 text-[#2a1913]/72 sm:text-base sm:leading-8 lg:text-lg">
              Ingredientes mexicanos de origen, lotes pequeños y una textura que conserva la memoria de cada sabor.
            </p>
            <div className="hero-copy hero-copy-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#sabores"
                className="luxury-cta group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#2a1913] px-6 text-sm font-bold text-[#fffdf8] shadow-[0_18px_44px_-26px_rgba(42,25,19,0.72)]"
              >
                Elegir mis sabores
                <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
              <button
                type="button"
                onClick={onOpenCart}
                className="luxury-secondary inline-flex min-h-13 items-center justify-center gap-3 rounded-xl border border-[#2a1913]/22 bg-[#fffdf8]/38 px-6 text-sm font-bold text-[#2a1913] backdrop-blur-sm"
              >
                Revisar pedido
                <span className="grid min-h-6 min-w-6 place-items-center rounded-full bg-[var(--nube-accent)] px-1.5 text-[10px] text-white">
                  {itemCount}
                </span>
              </button>
            </div>
            <dl className="hero-copy hero-copy-5 mt-8 grid max-w-[600px] grid-cols-3 border-t border-[#2a1913]/18 pt-5">
              <div className="pr-3">
                <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--nube-accent)]"><MapPin className="h-3.5 w-3.5" /> Zona</dt>
                <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">CDMX y área metropolitana</dd>
              </div>
              <div className="border-l border-[#2a1913]/14 px-3">
                <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--nube-accent)]"><Clock3 className="h-3.5 w-3.5" /> Ritmo</dt>
                <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">Lotes pequeños</dd>
              </div>
              <div className="border-l border-[#2a1913]/14 pl-3">
                <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--nube-accent)]"><Snowflake className="h-3.5 w-3.5" /> Entrega</dt>
                <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">Cadena de frío cuidada</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="relative z-10 flex min-h-[430px] px-3 pb-3 sm:min-h-[500px] sm:px-6 sm:pb-6 lg:min-h-0 lg:py-6 lg:pl-0 lg:pr-6">
          <HeroFlavorCatalogue
            key={featuredFlavorId ?? 'default'}
            flavors={flavors}
            initialFlavorId={featuredFlavorId}
            onFlavorChange={onFlavorChange}
          />
        </div>

        <div className="absolute bottom-9 right-10 z-30 hidden items-end gap-2 lg:flex">
          <div className="rounded-2xl border border-[#fffdf8]/42 bg-[#2a1913]/28 px-4 py-3 text-right text-white shadow-lg backdrop-blur-md">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/62">Huella de la casa</p>
            <p className="font-display mt-1 text-lg">Papantla · Zamora · Oaxaca</p>
          </div>
          <a
            href="#historia"
            className="group grid h-13 w-13 place-items-center rounded-full border border-white/40 bg-[#2a1913]/24 text-white backdrop-blur-md transition-colors duration-300 hover:bg-[var(--nube-accent)]"
            aria-label="Conocer la historia de Helado Nube"
          >
            <ArrowRight className="h-4 w-4 rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
