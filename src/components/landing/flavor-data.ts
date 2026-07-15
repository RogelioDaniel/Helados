export type FlavorTheme = Readonly<{
  /** The hue used for actions, labels, and focus treatment. */
  accent: string;
  /** The page-level milk/cream surfaces for this particular flavor. */
  canvas: string;
  base: string;
  light: string;
  ribbonA: string;
  ribbonB: string;
  /** Dark cream used by the story, event, and footer surfaces. */
  surface: string;
  panel: string;
  highlight: string;
}>;

export type Flavor = Readonly<{
  id: string;
  name: string;
  catalogueName: string;
  eyebrow: string;
  description: string;
  origin: string;
  price: number;
  image: string;
  imageAlt: string;
  color: string;
  theme: FlavorTheme;
}>;

export const FLAVORS: readonly Flavor[] = [
  {
    id: 'fresa',
    name: 'Fresa de Zamora',
    catalogueName: 'Fresa',
    eyebrow: 'Frutal · Disponible vegano',
    description: 'Fresas de Zamora y una acidez limpia. Dulce, fresca y sin colorantes.',
    origin: 'Zamora, Michoacán',
    price: 65,
    image: '/img/historia-1.png',
    imageAlt: 'Helado artesanal de fresa servido con fresas frescas',
    color: '#a73f55',
    theme: {
      accent: '#a73f55',
      canvas: '#f7eee8',
      base: '#f2d8d1',
      light: '#fff9f4',
      ribbonA: '#b3435e',
      ribbonB: '#d88d9c',
      surface: '#6f2b3d',
      panel: '#ead0ca',
      highlight: '#f4b6c0',
    },
  },
  {
    id: 'vainilla',
    name: 'Vainilla de Papantla',
    catalogueName: 'Vainilla',
    eyebrow: 'Floral · Cremoso',
    description: 'Vainilla veracruzana curada a mano, con aroma profundo y final sedoso.',
    origin: 'Papantla, Veracruz',
    price: 72,
    image: '/img/historia-2.png',
    imageAlt: 'Helado cremoso de vainilla servido con cuchara',
    color: '#d8bb8b',
    theme: {
      accent: '#8f6333',
      canvas: '#f8f1e3',
      base: '#eddbb6',
      light: '#fff9e9',
      ribbonA: '#bd873f',
      ribbonB: '#8d5f3d',
      surface: '#4b3021',
      panel: '#e7d6bf',
      highlight: '#f0cf8e',
    },
  },
  {
    id: 'pistache',
    name: 'Pistache tostado',
    catalogueName: 'Pistache',
    eyebrow: 'Intenso · Cremoso',
    description: 'Pistache tostado al comal, una pizca de sal y una textura larga en boca.',
    origin: 'Tostado en casa',
    price: 85,
    image: '/img/historia-3.png',
    imageAlt: 'Cono de helado artesanal de pistache con pistaches tostados',
    color: '#789170',
    theme: {
      accent: '#5b754e',
      canvas: '#edf0e3',
      base: '#ced9bc',
      light: '#faf9e9',
      ribbonA: '#6e8e63',
      ribbonB: '#73523c',
      surface: '#344633',
      panel: '#d8dfcb',
      highlight: '#c8dda7',
    },
  },
  {
    id: 'chocolate',
    name: 'Chocolate Oaxaqueño',
    catalogueName: 'Cacao',
    eyebrow: 'Cacao · Profundo',
    description: 'Tableta de cacao molida, notas tostadas y un final cálido que permanece.',
    origin: 'Oaxaca, México',
    price: 78,
    image: '/img/gallery-3.png',
    imageAlt: 'Helado de chocolate oaxaqueño con textura intensa',
    color: '#5b362b',
    theme: {
      accent: '#633827',
      canvas: '#f1e8df',
      base: '#d6b192',
      light: '#fbf1e6',
      ribbonA: '#5b362b',
      ribbonB: '#aa6a40',
      surface: '#30201a',
      panel: '#d9c2ad',
      highlight: '#e7b882',
    },
  },
  {
    id: 'mango',
    name: 'Mango con chile',
    catalogueName: 'Mango',
    eyebrow: 'Frutal · Disponible vegano',
    description: 'Mango Manila maduro, cítricos y un toque medido de chile mexicano.',
    origin: 'Fruta de temporada',
    price: 70,
    image: '/img/gallery-2.png',
    imageAlt: 'Helado artesanal de mango con un toque de chile',
    color: '#c98b32',
    theme: {
      accent: '#b76f15',
      canvas: '#fcf2d5',
      base: '#f3cf78',
      light: '#fff6dc',
      ribbonA: '#d59524',
      ribbonB: '#a6432d',
      surface: '#5d3517',
      panel: '#eed39e',
      highlight: '#ffe09a',
    },
  },
  {
    id: 'cajeta',
    name: 'Cajeta de Celaya',
    catalogueName: 'Cajeta',
    eyebrow: 'Edición de temporada',
    description: 'Leche de cabra cocida a fuego lento: caramelo, humo suave y mucha memoria.',
    origin: 'Celaya, Guanajuato',
    price: 74,
    image: '/img/gallery-4.png',
    imageAlt: 'Helado de cajeta de Celaya con caramelo',
    color: '#a46b3f',
    theme: {
      accent: '#915629',
      canvas: '#f6eadb',
      base: '#e1bf91',
      light: '#fff4df',
      ribbonA: '#ae7137',
      ribbonB: '#6b4329',
      surface: '#4a2d1e',
      panel: '#e0c6a3',
      highlight: '#f1c586',
    },
  },
];
