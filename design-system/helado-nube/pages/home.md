# Home — Sobremesa Nube

> Esta página sobreescribe `../MASTER.md`. La recomendación automática de ámbar, Outfit único y rebote tipo *jelly* se descarta porque se siente genérica y demasiado lúdica para la promesa de lujo artesanal.

## Propósito

- **Audiencia:** personas en CDMX que buscan una sobremesa especial, regalos o helado para una celebración.
- **Trabajo principal:** llevar a elegir sabores y preparar un pedido por WhatsApp.
- **Idea:** lujo artesanal mexicano expresado mediante origen, textura, tiempo y servicio; nunca mediante el cliché negro + dorado.

## Identidad visual

| Rol | Token | Valor |
| --- | --- | --- |
| Papel cálido | `--nube-canvas` | `#F5F0E8` |
| Porcelana | `--nube-surface` | `#FFFDF8` |
| Cacao | `--nube-ink` | `#2A1913` |
| Cacao suave | `--nube-muted` | `#6D574B` |
| Guinda | `--nube-accent` | `#8E2F3F` |
| Pistache | `--nube-pistachio` | `#789170` |
| Línea | `--nube-line` | `#D8C9B9` |

- **Display:** Fraunces, por sus curvas orgánicas y su relación visual con una cucharada servida.
- **Texto y utilidad:** Geist, sobria y legible.
- **Forma:** arcos amplios, círculos imperfectos y bordes finos. Las tarjetas genéricas con sombra se evitan.

## Firma: La Huella del Cucharón

Dos o tres arcos imperfectos representan el surco que deja el cucharón al servir helado. La firma aparece en el hero, en el indicador de origen y al confirmar que un sabor se agregó. Las microleyendas siempre aportan información real: origen, lote o temporada.

La escena Three.js del hero extiende esta firma con anillos tridimensionales y pequeñas partículas de ingrediente. Se carga de forma diferida, mantiene la fotografía como respaldo, limita el pixel ratio y se detiene fuera del viewport.

## Composición

```text
desktop
┌──────────────────────────────────────────────────────────┐
│ navegación sobria                         pedido (0)      │
├──────────────────────────────────────────────────────────┤
│ FOTO EDITORIAL FULL-WIDTH: copy en espacio negativo      │
│ H1 + CTA                    cono + huella tridimensional  │
├──────────────────────────────────────────────────────────┤
│ sello/origen       carta interactiva y pedido            │
├──────────────────────────────────────────────────────────┤
│ historia oscura + proceso + mesa editorial + FAQ          │
└──────────────────────────────────────────────────────────┘
```

En móvil, copy y fotografía se separan para preservar legibilidad; la escena 3D se reduce y la barra del pedido respeta `safe-area-inset-bottom`.

## Movimiento

- Feedback: `140ms`; UI: `240ms`; reveal: `520–800ms`; curva principal `cubic-bezier(.22,1,.36,1)`.
- Un solo momento coreografiado en el hero: copy, máscara fotográfica, Huella y escena 3D.
- Los títulos y fotografías importantes se revelan al entrar; el cuerpo permanece estable y legible.
- Parallax máximo de 6–10px y tilt máximo de 1.5 grados.
- Los botones se comprimen levemente al presionar; nunca rebotan de forma caricaturesca.
- `prefers-reduced-motion` conserva todas las funciones, detiene RAF y elimina transformaciones no esenciales.

## Límites

- Nada de preloader, cursor personalizado, scroll suavizado artificial, contadores inventados, glows, emojis como iconos o animación constante en cada sección.
- La fotografía sigue vendiendo el producto. Three.js aporta firma y profundidad; no la sustituye.
- Contraste mínimo 4.5:1, controles de 44px, foco visible y ausencia de scroll horizontal desde 320px.
