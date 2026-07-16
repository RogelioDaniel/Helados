'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Flavor } from './flavor-data';

type HeroFlavorCatalogueProps = {
  flavors: readonly Flavor[];
  initialFlavorId?: string;
  onFlavorChange?: (flavor: Flavor) => void;
};

type CatalogueDirection = 'backward' | 'forward';

function findFlavorIndex(flavors: readonly Flavor[], id?: string) {
  const index = id ? flavors.findIndex((flavor) => flavor.id === id) : -1;
  return index >= 0 ? index : 0;
}

export function HeroFlavorCatalogue({
  flavors,
  initialFlavorId,
  onFlavorChange,
}: HeroFlavorCatalogueProps) {
  const [selectedId, setSelectedId] = useState(() => flavors[findFlavorIndex(flavors, initialFlavorId)]?.id ?? '');
  const [direction, setDirection] = useState<CatalogueDirection>('forward');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [sweepFlavorId, setSweepFlavorId] = useState<string | null>(null);
  const [sweepToken, setSweepToken] = useState(0);
  const commitTimerRef = useRef(0);
  const finishTimerRef = useRef(0);
  const selectedIndex = useMemo(
    () => Math.max(0, flavors.findIndex((flavor) => flavor.id === selectedId)),
    [flavors, selectedId],
  );
  const selectedFlavor = flavors[selectedIndex];
  const sweepFlavor = flavors.find((flavor) => flavor.id === sweepFlavorId) ?? selectedFlavor;

  useEffect(() => () => {
    window.clearTimeout(commitTimerRef.current);
    window.clearTimeout(finishTimerRef.current);
  }, []);

  if (!selectedFlavor) return null;

  const selectFlavor = (flavor: Flavor, nextDirection?: CatalogueDirection) => {
    if (flavor.id === selectedFlavor.id || transitioning) return;
    const nextIndex = flavors.findIndex((candidate) => candidate.id === flavor.id);
    setDirection(nextDirection ?? (nextIndex < selectedIndex ? 'backward' : 'forward'));
    setHasInteracted(true);
    setTransitioning(true);
    setSweepFlavorId(flavor.id);
    setSweepToken((token) => token + 1);

    window.clearTimeout(commitTimerRef.current);
    window.clearTimeout(finishTimerRef.current);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSelectedId(flavor.id);
      setSweepFlavorId(null);
      setTransitioning(false);
      onFlavorChange?.(flavor);
      return;
    }

    // Change the product and the global palette at the thickest point of the
    // cream pass, so the old scoop never snaps directly into the new one.
    commitTimerRef.current = window.setTimeout(() => {
      setSelectedId(flavor.id);
      onFlavorChange?.(flavor);
    }, 380);
    finishTimerRef.current = window.setTimeout(() => {
      setTransitioning(false);
      setSweepFlavorId(null);
    }, 920);
  };

  const selectOffset = (offset: number) => {
    const nextIndex = (selectedIndex + offset + flavors.length) % flavors.length;
    selectFlavor(flavors[nextIndex], offset < 0 ? 'backward' : 'forward');
  };

  const handleRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectOffset(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectOffset(1);
    }
  };

  const catalogueStyle = {
    '--catalogue-tone': selectedFlavor.theme.accent,
  } as CSSProperties;

  return (
    <section
      className="hero-flavor-catalogue"
      style={catalogueStyle}
      aria-labelledby="catalogue-title"
      data-flavor={selectedFlavor.id}
      data-transition-direction={direction}
      data-has-interacted={hasInteracted ? 'true' : 'false'}
      data-transitioning={transitioning ? 'true' : 'false'}
    >
      <div className="catalogue-grain" aria-hidden="true" />
      <header className="catalogue-topline">
        <div>
          <p className="catalogue-kicker">Selección de temporada</p>
          <p key={`count-${selectedFlavor.id}`} className="catalogue-count">Lote {String(selectedIndex + 1).padStart(2, '0')} / {String(flavors.length).padStart(2, '0')}</p>
        </div>
        <div className="catalogue-controls" aria-label="Cambiar sabor destacado">
          <button
            type="button"
            onClick={() => selectOffset(-1)}
            className="catalogue-arrow"
            aria-label={`Ver sabor anterior a ${selectedFlavor.name}`}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={() => selectOffset(1)}
            className="catalogue-arrow"
            aria-label={`Ver sabor siguiente a ${selectedFlavor.name}`}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div className="catalogue-stage" data-catalogue-stage>
        {/* The cream pass lives inside the stage so it only ever veils the
            product card, never the whole hero. catalogue-stage already clips
            with overflow: hidden. */}
        {transitioning && sweepFlavor ? (
          <span
            key={`cream-sweep-${sweepToken}`}
            className="catalogue-cream-sweep"
            data-direction={direction}
            style={{ '--catalogue-tone': sweepFlavor.theme.accent } as CSSProperties}
            aria-hidden="true"
          >
            <span className="catalogue-cream-sweep__body" />
            <span className="catalogue-cream-sweep__fold" />
            <span className="catalogue-cream-sweep__highlight" />
            <span className="catalogue-cream-sweep__drop catalogue-cream-sweep__drop--one" />
            <span className="catalogue-cream-sweep__drop catalogue-cream-sweep__drop--two" />
            <span className="catalogue-cream-sweep__drop catalogue-cream-sweep__drop--three" />
          </span>
        ) : null}
        <span key={`word-${selectedFlavor.id}`} className="catalogue-word" aria-hidden="true">{selectedFlavor.catalogueName}</span>
        <span key={`orbit-one-${selectedFlavor.id}`} className="catalogue-orbit catalogue-orbit--one" aria-hidden="true" />
        <span key={`orbit-two-${selectedFlavor.id}`} className="catalogue-orbit catalogue-orbit--two" aria-hidden="true" />

        <figure className="catalogue-product" key={selectedFlavor.id}>
          <div className="catalogue-product-image-wrap">
            <Image
              src={selectedFlavor.image}
              alt={selectedFlavor.imageAlt}
              fill
              priority={selectedFlavor.id === initialFlavorId}
              sizes="(max-width: 767px) calc(100vw - 3.5rem), (max-width: 1200px) 42vw, 600px"
              className="catalogue-product-image"
              data-hero-image
            />
          </div>
          <figcaption className="catalogue-origin">
            <span>{selectedFlavor.origin}</span>
            <span aria-hidden="true">·</span>
            <span>1 litro</span>
          </figcaption>
        </figure>

        <div className="catalogue-caption" key={`${selectedFlavor.id}-caption`}>
          <p className="catalogue-eyebrow">{selectedFlavor.eyebrow}</p>
          <h2 id="catalogue-title" className="font-display">{selectedFlavor.name}</h2>
          <p>{selectedFlavor.description}</p>
          <div className="catalogue-price-row">
            <span className="font-display">${selectedFlavor.price}</span>
            <span>MXN · 1 litro</span>
          </div>
        </div>
      </div>

      <div
        className="catalogue-rail"
        aria-label="Sabores destacados"
        onKeyDown={handleRailKeyDown}
      >
        {flavors.map((flavor, index) => {
          const selected = flavor.id === selectedFlavor.id;
          const pending = transitioning && flavor.id === sweepFlavorId;
          const tabStyle = {
            '--catalogue-tab-index': index,
            '--catalogue-tab-tone': flavor.theme.accent,
          } as CSSProperties;

          return (
            <button
              key={flavor.id}
              type="button"
              onClick={() => selectFlavor(flavor)}
              className={`catalogue-flavor-tab ${selected ? 'catalogue-flavor-tab--active' : ''}`}
              style={tabStyle}
              aria-pressed={selected}
              aria-label={`Mostrar ${flavor.name}, sabor ${index + 1} de ${flavors.length}`}
              data-flavor={flavor.id}
              data-selected={selected ? 'true' : 'false'}
              data-pending={pending ? 'true' : 'false'}
            >
              <span
                key={selected ? `tab-cream-${selectedFlavor.id}` : `tab-cream-rest-${flavor.id}`}
                className="catalogue-tab-cream"
                aria-hidden="true"
              >
                <span className="catalogue-tab-cream__sheet" />
                <span className="catalogue-tab-cream__lip" />
                <span className="catalogue-tab-cream__drop" />
              </span>
              <span className="catalogue-tab-churn" aria-hidden="true">
                <span className="catalogue-tab-churn__lobe catalogue-tab-churn__lobe--one" />
                <span className="catalogue-tab-churn__lobe catalogue-tab-churn__lobe--two" />
                <span className="catalogue-tab-churn__lobe catalogue-tab-churn__lobe--three" />
              </span>
              <span className="catalogue-tab-image">
                <Image src={flavor.image} alt="" fill sizes="52px" className="object-cover" />
                <span className="catalogue-tab-image__glaze" aria-hidden="true" />
              </span>
              <span className="catalogue-tab-label">{flavor.catalogueName}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Sabor destacado: {selectedFlavor.name}. {selectedFlavor.origin}.
      </p>
    </section>
  );
}
