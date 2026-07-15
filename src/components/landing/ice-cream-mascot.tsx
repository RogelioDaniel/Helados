'use client';

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';

type MascotPart = 'top' | 'middle' | 'cone';

const MASCOT_CONTROLS: ReadonlyArray<{
  id: MascotPart;
  label: string;
  description: string;
}> = [
  { id: 'top', label: 'Bola alta', description: 'La bola alta se estira como una cucharada recién servida.' },
  { id: 'middle', label: 'Doble bola', description: 'La bola central se amasa y hace sonreír al cono.' },
  { id: 'cone', label: 'Cono', description: 'El cono se inclina y deja ver su trama de waffle.' },
];

export function IceCreamMascot() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activePart, setActivePart] = useState<MascotPart>('top');
  const [reaction, setReaction] = useState(0);
  const svgId = useId().replace(/:/g, '');

  const activatePart = useCallback((part: MascotPart) => {
    setActivePart(part);
    setReaction((value) => value + 1);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));

    stage.style.setProperty('--mascot-tilt', `${(x * 5.5).toFixed(2)}deg`);
    stage.style.setProperty('--mascot-lift', `${(y * -4.5).toFixed(2)}px`);
  }, []);

  const resetPointer = useCallback(() => {
    const stage = stageRef.current;
    stage?.style.setProperty('--mascot-tilt', '0deg');
    stage?.style.setProperty('--mascot-lift', '0px');
  }, []);

  const activeDescription = MASCOT_CONTROLS.find((control) => control.id === activePart)?.description;

  return (
    <aside className="ice-cream-mascot" aria-labelledby={`${svgId}-mascot-name`}>
      <div
        ref={stageRef}
        className="mascot-stage"
        data-mascot
        data-mascot-mood={activePart}
        data-mascot-reacted={reaction > 0 ? 'true' : undefined}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <span className="mascot-halo" aria-hidden="true" />
        <svg
          key={reaction}
          className="mascot-svg"
          viewBox="0 0 360 404"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${svgId}-top`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--cream-light)" />
              <stop offset="0.5" stopColor="var(--cream-ribbon-a)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--cream-ribbon-a) 72%, #2a1913)" />
            </linearGradient>
            <linearGradient id={`${svgId}-middle`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="color-mix(in srgb, var(--cream-light) 76%, white)" />
              <stop offset="0.52" stopColor="var(--cream-ribbon-b)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--cream-ribbon-b) 75%, #2a1913)" />
            </linearGradient>
            <linearGradient id={`${svgId}-cone`} x1="0" y1="0" x2="0.7" y2="1">
              <stop offset="0" stopColor="#e8bd7f" />
              <stop offset="0.52" stopColor="#c9884f" />
              <stop offset="1" stopColor="#8f542e" />
            </linearGradient>
            <pattern id={`${svgId}-waffle`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <path d="M 0 5 H 22 M 0 16 H 22" stroke="#714020" strokeWidth="2.25" opacity="0.7" />
            </pattern>
          </defs>

          <ellipse className="mascot-ground-shadow" cx="180" cy="365" rx="94" ry="18" />

          <g className="mascot-cone mascot-interactive-part" onClick={() => activatePart('cone')}>
            <path className="mascot-cone-shell" d="M113 220 H247 L192 356 Q180 377 168 356 Z" fill={`url(#${svgId}-cone)`} />
            <path className="mascot-cone-grid" d="M113 220 H247 L192 356 Q180 377 168 356 Z" fill={`url(#${svgId}-waffle)`} />
            <path className="mascot-cone-edge" d="M112 220 Q180 239 248 220" />
          </g>

          <g className="mascot-scoop mascot-scoop--bottom mascot-interactive-part" onClick={() => activatePart('middle')}>
            <path d="M93 241 C82 205 104 169 145 165 C163 139 204 139 221 165 C262 167 283 202 268 238 C254 270 111 272 93 241 Z" fill={`url(#${svgId}-middle)`} />
            <path className="mascot-scoop-highlight" d="M115 198 C137 175 168 170 190 183" />
          </g>

          <g className="mascot-scoop mascot-scoop--middle mascot-interactive-part" onClick={() => activatePart('middle')}>
            <path d="M105 182 C95 148 117 113 153 111 C172 88 211 91 226 116 C261 121 278 154 261 184 C244 209 124 209 105 182 Z" fill="var(--cream-base)" />
            <path className="mascot-scoop-highlight" d="M127 143 C147 121 180 116 202 130" />
          </g>

          <g className="mascot-scoop mascot-scoop--top mascot-interactive-part" onClick={() => activatePart('top')}>
            <path d="M126 124 C113 94 130 58 161 51 C183 26 220 42 229 68 C259 80 267 113 245 132 C223 151 146 151 126 124 Z" fill={`url(#${svgId}-top)`} />
            <path className="mascot-scoop-highlight" d="M147 85 C162 63 193 58 212 75" />
          </g>

          <g className="mascot-face">
            <ellipse cx="150" cy="214" rx="5.8" ry="8.4" />
            <ellipse cx="208" cy="214" rx="5.8" ry="8.4" />
            <path className="mascot-smile" d="M162 233 Q180 248 198 233" />
            <path className="mascot-cheek mascot-cheek--left" d="M121 228 Q132 222 140 230" />
            <path className="mascot-cheek mascot-cheek--right" d="M220 230 Q228 222 239 228" />
          </g>

          <g className="mascot-sprinkle mascot-sprinkle--one"><path d="M114 152 L126 146" /></g>
          <g className="mascot-sprinkle mascot-sprinkle--two"><path d="M235 154 L247 161" /></g>
          <g className="mascot-sprinkle mascot-sprinkle--three"><path d="M170 54 L176 43" /></g>
        </svg>
      </div>

      <div className="mascot-copy">
        <p className="mascot-kicker">La cucharada de la casa</p>
        <p id={`${svgId}-mascot-name`} className="mascot-name">Conoce a Nube</p>
        <p id={`${svgId}-mascot-hint`} className="mascot-hint">Toca una bola o el cono. También responde cuando lo sigues con la mirada.</p>
      </div>

      <div className="mascot-controls" role="group" aria-describedby={`${svgId}-mascot-hint`}>
        {MASCOT_CONTROLS.map((control) => {
          const active = control.id === activePart;
          return (
            <button
              key={control.id}
              type="button"
              className="mascot-control"
              data-active={active ? 'true' : undefined}
              onClick={() => activatePart(control.id)}
              aria-pressed={active}
            >
              <span className="mascot-control-dot" aria-hidden="true" />
              {control.label}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">{activeDescription}</p>
    </aside>
  );
}
