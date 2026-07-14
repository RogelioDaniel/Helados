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

## Firma: La Mantecación

La experiencia abre, una vez por sesión, con una superficie cremosa que mezcla vainilla, fresa y pistache. Three.js genera pliegues y surcos de helado mediante un único shader; al terminar la carga real, la masa se retira hacia arriba con un borde viscoso y revela la fotografía. El respaldo CSS aparece desde SSR, el cierre nunca espera al chunk de Three y existe un límite duro para no bloquear el contenido.

La huella del cucharón queda como gesto secundario y funcional: aparece sobre la fotografía de un sabor al enfocarlo y en la compresión breve del botón “Servir”. No se representa mediante órbitas, partículas ni objetos flotantes.

## Composición

```text
desktop
┌──────────────────────────────────────────────────────────┐
│ navegación sobria                         pedido (0)      │
├──────────────────────────────────────────────────────────┤
│ FOTO EDITORIAL FULL-WIDTH: copy en espacio negativo      │
│ H1 + CTA                    cono limpio, sin decoración   │
├──────────────────────────────────────────────────────────┤
│ sello/origen       carta interactiva y pedido            │
├──────────────────────────────────────────────────────────┤
│ historia oscura + proceso + mesa editorial + FAQ          │
└──────────────────────────────────────────────────────────┘
```

En móvil, copy y fotografía se separan para preservar legibilidad; la escena 3D se reduce y la barra del pedido respeta `safe-area-inset-bottom`.

## Movimiento

- Feedback: `140ms`; UI: `240ms`; reveal: `520–800ms`; curva principal `cubic-bezier(.22,1,.36,1)`.
- Un solo momento coreografiado principal: la introducción Three.js “La Mantecación”; se muestra como máximo una vez por sesión.
- Las fotografías importantes se revelan como una cucharada circular; el cuerpo permanece estable y legible.
- Al servir un sabor, una pequeña muestra del color correspondiente sube y vuelve al botón mientras el carrito se actualiza de inmediato.
- La sección de eventos termina en un borde derretido sobrio y el carrito marca la cadena de frío con una línea de escarcha breve.
- Los botones se comprimen levemente al presionar; nunca rebotan de forma caricaturesca ni se mueven sin interacción.
- `prefers-reduced-motion` conserva todas las funciones, detiene RAF y elimina transformaciones no esenciales.

## Límites

- Nada de partículas, órbitas, cursor personalizado, scroll suavizado artificial, contadores inventados, glows, emojis como iconos o animación constante en cada sección.
- La introducción es una capa decorativa breve, no una espera artificial: respaldo CSS inmediato, salida forzada y contenido ya renderizado debajo.
- La fotografía sigue vendiendo el producto. Three.js expresa la textura de la mezcla y desaparece al terminar; no compite con el hero.
- Contraste mínimo 4.5:1, controles de 44px, foco visible y ausencia de scroll horizontal desde 320px.
