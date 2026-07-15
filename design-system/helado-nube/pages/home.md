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

La experiencia abre en cada carga completa, por petición explícita de marca, con una superficie cremosa que mezcla vainilla, fresa y pistache. No se guarda ninguna bandera en `sessionStorage`: cada recarga vuelve a presentar “La Mantecación”. Three.js genera pliegues y surcos mediante un único shader que se amasa lentamente en el sitio, sin traslación global; el reloj del primer render se entrega al runtime para impedir saltos de fase. La masa permanece 2.2 segundos y después se retira durante 1.68 segundos con un borde viscoso para revelar la fotografía.

La misma textura WebGL se conserva en móvil: 24 FPS, DPR máximo de 1 y repintado continuo para no dejar un framebuffer congelado en el compositor. El SVG con filtros queda fuera de la ruta móvil; mientras llega el primer frame sólo existe un fondo lineal crema, sin círculos, filtros ni mosaicos. Escritorio trabaja a 30 FPS y DPR máximo de 1.35.

## Firma de scroll: Mantecación bajo el mostrador

Cuando el encabezado queda fijo, funciona como una espátula. Al bajar deposita una capa de helado bajo la navegación; al subir la raspa y vuelve a mostrar la página. La profundidad responde a la distancia recorrida y permanece donde la persona la dejó, mientras los pliegues siguen amasándose con lentitud. El canvas es corto, no bloquea interacción, queda entre contenido y navegación y se oculta al abrir menú o carrito.

El loader libera su contexto antes de montar esta segunda fase: nunca hay dos escenas WebGL activas simultáneamente. La marea usa un plano, un material shader, 24 FPS y DPR 1 en móvil, 30 FPS y DPR 1.25 en escritorio. `prefers-reduced-motion` y `Save-Data` omiten el efecto; una pérdida temporal de contexto lo pausa y lo recupera cuando el navegador vuelve a disponer de WebGL.

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

En móvil, copy y fotografía se separan para preservar legibilidad; la introducción conserva el shader a resolución controlada y la barra del pedido respeta `safe-area-inset-bottom`.

## Movimiento

- Feedback: `140ms`; UI: `240ms`; reveals secundarios: `520–800ms`; salida principal: `1680ms` con *smootherstep* para acelerar y asentarse sin un corte lineal.
- Un solo momento coreografiado principal: la introducción Three.js “La Mantecación”; se reproduce en cada recarga completa y se omite únicamente por `prefers-reduced-motion` o `Save-Data`.
- Su continuación espacial es la marea bajo el header: scroll descendente deposita crema; scroll ascendente la retira. No captura ni altera el desplazamiento nativo.
- Las fotografías importantes se revelan como una cucharada circular; el cuerpo permanece estable y legible.
- En pantallas táctiles, la fila de sabor que cruza el centro recibe una única huella de cucharón; no hay seis animaciones compitiendo a la vez.
- Al servir un sabor, una pequeña muestra del color correspondiente sube y vuelve al botón mientras el carrito se actualiza de inmediato.
- La sección de eventos termina en un borde derretido que se asienta una sola vez y el carrito marca la cadena de frío con una línea de escarcha breve.
- Los botones se comprimen levemente al presionar; nunca rebotan de forma caricaturesca ni se mueven sin interacción.
- `prefers-reduced-motion` conserva todas las funciones, detiene RAF y elimina transformaciones no esenciales.

## Límites

- Nada de partículas, órbitas, cursor personalizado, scroll suavizado artificial, contadores inventados, glows, emojis como iconos o animación constante en cada sección.
- La introducción es una capa decorativa breve, no una espera artificial: respaldo plano inmediato, salida forzada y contenido ya renderizado debajo.
- La marea ocupa una franja limitada, usa `pointer-events: none` y nunca tapa controles del encabezado, menú, carrito o confirmaciones.
- La fotografía sigue vendiendo el producto. Three.js expresa la textura de la mezcla y desaparece al terminar; no compite con el hero.
- Contraste mínimo 4.5:1, controles de 44px, foco visible y ausencia de scroll horizontal desde 320px.
