'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  type CSSProperties,
  useMemo,
  useState,
} from 'react';
import type { Flavor } from './flavor-data';

type HeroFlavorCatalogueProps = {
  flavors: readonly Flavor[];
  initialFlavorId?: string;
  onFlavorChange?: (flavor: Flavor) => void;
};

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
  const selectedIndex = useMemo(
    () => Math.max(0, flavors.findIndex((flavor) => flavor.id === selectedId)),
    [flavors, selectedId],
  );
  const selectedFlavor = flavors[selectedIndex];

  if (!selectedFlavor) return null;

  const selectFlavor = (flavor: Flavor) => {
    if (flavor.id === selectedFlavor.id) return;
    setSelectedId(flavor.id);
    onFlavorChange?.(flavor);
  };

  const selectOffset = (offset: number) => {
    const nextIndex = (selectedIndex + offset + flavors.length) % flavors.length;
    selectFlavor(flavors[nextIndex]);
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
    >
      <div className="catalogue-grain" aria-hidden="true" />
      <span key={`cream-sweep-${selectedFlavor.id}`} className="catalogue-cream-sweep" aria-hidden="true" />
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

      <div className="catalogue-rail" aria-label="Sabores destacados">
        {flavors.map((flavor, index) => {
          const selected = flavor.id === selectedFlavor.id;
          return (
            <button
              key={flavor.id}
              type="button"
              onClick={() => selectFlavor(flavor)}
              className={`catalogue-flavor-tab ${selected ? 'catalogue-flavor-tab--active' : ''}`}
              aria-pressed={selected}
              aria-label={`Mostrar ${flavor.name}, sabor ${index + 1} de ${flavors.length}`}
            >
              <span className="catalogue-tab-image">
                <Image src={flavor.image} alt="" fill sizes="52px" className="object-cover" />
              </span>
              <span>{flavor.catalogueName}</span>
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
