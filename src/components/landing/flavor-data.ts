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
  },
];
