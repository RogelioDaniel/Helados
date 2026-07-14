import Image from 'next/image';
import { ArrowDownRight, ArrowRight, Clock3, MapPin, Snowflake } from 'lucide-react';

type LuxuryHeroProps = {
  itemCount: number;
  onOpenCart: () => void;
};

export function LuxuryHero({ itemCount, onOpenCart }: LuxuryHeroProps) {
  return (
    <section id="inicio" className="scroll-mt-28 px-3 py-3 sm:px-5 sm:py-5 lg:px-7">
      <div
        className="nube-hero relative mx-auto min-h-[760px] max-w-[1540px] overflow-hidden rounded-[1.7rem] bg-[#d8c0a2] sm:min-h-[780px] sm:rounded-[2.2rem] lg:min-h-[calc(100dvh-126px)] lg:rounded-[2.8rem]"
        data-hero-stage
      >
        <Image
          src="/img/hero-vip.webp"
          alt="Cono con helado artesanal de vainilla, fresa y pistache junto a ingredientes de origen"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1540px"
          className="nube-hero-image object-cover object-[68%_center] sm:object-[62%_center] lg:object-center"
          data-hero-image
        />
        <div className="nube-hero-wash absolute inset-0" aria-hidden="true" />
        <div className="nube-hero-vignette absolute inset-0" aria-hidden="true" />

        <div className="absolute left-5 right-5 top-8 z-20 max-w-[680px] sm:left-9 sm:right-auto sm:top-12 lg:left-[clamp(3.5rem,7vw,7.75rem)] lg:top-1/2 lg:w-[48%] lg:-translate-y-1/2">
          <p className="hero-copy hero-copy-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8e2f3f] sm:text-xs">
            <span className="h-px w-9 bg-[#8e2f3f]" />
            Heladería artesanal · Desde 1962
          </p>
          <h1 className="font-display hero-copy hero-copy-2 mt-6 max-w-[8.8ch] text-[clamp(3.75rem,8.1vw,8.4rem)] font-medium leading-[0.82] tracking-[-0.068em] text-[#2a1913]">
            El lujo se sirve <em className="font-normal text-[#8e2f3f]">despacio.</em>
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
              <span className="grid min-h-6 min-w-6 place-items-center rounded-full bg-[#8e2f3f] px-1.5 text-[10px] text-white">
                {itemCount}
              </span>
            </button>
          </div>
          <dl className="hero-copy hero-copy-5 mt-8 grid max-w-[600px] grid-cols-3 border-t border-[#2a1913]/18 pt-5">
            <div className="pr-3">
              <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8e2f3f]"><MapPin className="h-3.5 w-3.5" /> Zona</dt>
              <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">CDMX y área metropolitana</dd>
            </div>
            <div className="border-l border-[#2a1913]/14 px-3">
              <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8e2f3f]"><Clock3 className="h-3.5 w-3.5" /> Ritmo</dt>
              <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">Lotes pequeños</dd>
            </div>
            <div className="border-l border-[#2a1913]/14 pl-3">
              <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8e2f3f]"><Snowflake className="h-3.5 w-3.5" /> Entrega</dt>
              <dd className="mt-2 text-[11px] font-semibold text-[#2a1913]/66 sm:text-xs">Cadena de frío cuidada</dd>
            </div>
          </dl>
        </div>

        <div className="absolute bottom-5 right-4 z-20 flex items-end gap-2 sm:bottom-7 sm:right-7 lg:bottom-9 lg:right-10">
          <div className="hidden rounded-2xl border border-white/35 bg-[#2a1913]/24 px-4 py-3 text-right text-white shadow-lg backdrop-blur-md sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/62">Huella de la casa</p>
            <p className="font-display mt-1 text-lg">Papantla · Zamora · Oaxaca</p>
          </div>
          <a
            href="#historia"
            className="group grid h-13 w-13 place-items-center rounded-full border border-white/40 bg-[#2a1913]/24 text-white backdrop-blur-md transition-colors duration-300 hover:bg-[#8e2f3f]"
            aria-label="Conocer la historia de Helado Nube"
          >
            <ArrowRight className="h-4 w-4 rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
