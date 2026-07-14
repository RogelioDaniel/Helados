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

La experiencia abre en cada carga completa, por petición explícita de marca, con una superficie cremosa que mezcla vainilla, fresa y pistache. No se guarda ninguna bandera en `sessionStorage`: cada recarga vuelve a presentar “La Mantecación”. Three.js genera pliegues y surcos de helado mediante un único shader; desde su primer frame se cuentan 2.2 segundos de contemplación y después esa misma masa se retira durante 1.68 segundos con un borde viscoso para revelar la fotografía. El respaldo CSS aparece desde SSR, pero es estático y permanece detrás del canvas: el primer frame 3D lo cubre sin crossfade ni transparencia intermedia. La salida fija una sola fuente visual para evitar saltos si el chunk llega tarde y existe un límite duro para no bloquear el contenido.

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

- Feedback: `140ms`; UI: `240ms`; reveals secundarios: `520–800ms`; salida principal: `1680ms` con *smootherstep* para acelerar y asentarse sin un corte lineal.
- Un solo momento coreografiado principal: la introducción Three.js “La Mantecación”; se reproduce en cada recarga completa y se omite únicamente por `prefers-reduced-motion` o `Save-Data`.
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
