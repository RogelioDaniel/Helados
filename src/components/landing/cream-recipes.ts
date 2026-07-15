export type Rgb = readonly [number, number, number];

export type CreamRecipe = Readonly<{
  id: string;
  label: string;
  base: Rgb;
  light: Rgb;
  ribbonA: Rgb;
  ribbonB: Rgb;
  ribbonWeights: readonly [number, number];
  ridge: number;
  gloss: number;
  flowRate: number;
  flowStrength: number;
}>;

export type CreamSession = Readonly<{
  version: 1;
  seed: number;
  recipeIndex: number;
  recipe: CreamRecipe;
  materialPhase: number;
  dropletSeed: number;
}>;

export const CREAM_RECIPES: readonly CreamRecipe[] = [
  {
    id: 'fresa-pistache',
    label: 'Fresa de Zamora · Pistache tostado',
    base: [0.953, 0.894, 0.788],
    light: [1, 0.973, 0.918],
    ribbonA: [0.671, 0.247, 0.345],
    ribbonB: [0.459, 0.541, 0.4],
    ribbonWeights: [0.31, 0.16],
    ridge: 0.108,
    gloss: 0.112,
    flowRate: 1.02,
    flowStrength: 0.047,
  },
  {
    id: 'cacao-cajeta',
    label: 'Cacao oaxaqueño · Cajeta de Celaya',
    base: [0.847, 0.698, 0.541],
    light: [0.973, 0.918, 0.847],
    ribbonA: [0.294, 0.18, 0.153],
    ribbonB: [0.718, 0.431, 0.235],
    ribbonWeights: [0.34, 0.22],
    ridge: 0.122,
    gloss: 0.105,
    flowRate: 0.96,
    flowStrength: 0.044,
  },
  {
    id: 'mango-chile',
    label: 'Mango Manila · Chile mexicano',
    base: [0.949, 0.824, 0.529],
    light: [1, 0.945, 0.773],
    ribbonA: [0.835, 0.604, 0.184],
    ribbonB: [0.62, 0.251, 0.192],
    ribbonWeights: [0.34, 0.15],
    ridge: 0.102,
    gloss: 0.118,
    flowRate: 1.08,
    flowStrength: 0.052,
  },
  {
    id: 'pistache-cacao',
    label: 'Pistache tostado · Cacao',
    base: [0.733, 0.769, 0.608],
    light: [0.949, 0.922, 0.867],
    ribbonA: [0.435, 0.506, 0.365],
    ribbonB: [0.337, 0.212, 0.173],
    ribbonWeights: [0.32, 0.18],
    ridge: 0.116,
    gloss: 0.1,
    flowRate: 0.94,
    flowStrength: 0.043,
  },
  {
    id: 'vainilla-cajeta',
    label: 'Vainilla de Papantla · Cajeta',
    base: [0.91, 0.824, 0.667],
    light: [1, 0.957, 0.871],
    ribbonA: [0.663, 0.431, 0.243],
    ribbonB: [0.427, 0.275, 0.204],
    ribbonWeights: [0.29, 0.14],
    ridge: 0.104,
    gloss: 0.12,
    flowRate: 1,
    flowStrength: 0.046,
  },
  {
    id: 'zarzamora-crema',
    label: 'Zarzamora · Crema dulce',
    base: [0.918, 0.859, 0.867],
    light: [1, 0.961, 0.929],
    ribbonA: [0.396, 0.22, 0.31],
    ribbonB: [0.741, 0.471, 0.569],
    ribbonWeights: [0.35, 0.16],
    ridge: 0.11,
    gloss: 0.116,
    flowRate: 1.05,
    flowStrength: 0.05,
  },
];

declare global {
  interface Window {
    __HELADO_CREAM_SESSION__?: CreamSession;
  }
}

function mixUint32(value: number) {
  let mixed = (value + 0x6d2b79f5) >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return (mixed ^ (mixed >>> 14)) >>> 0;
}

function createRandomSeed() {
  const words = new Uint32Array(1);

  try {
    window.crypto.getRandomValues(words);
    return words[0] >>> 0;
  } catch {
    return (
      Date.now()
      ^ Math.floor(performance.now() * 1000)
      ^ (window.screen.width << 16)
      ^ window.screen.height
    ) >>> 0;
  }
}

function createCreamSession(seed: number): CreamSession {
  const recipeRoll = mixUint32(seed);
  const phaseRoll = mixUint32(recipeRoll);
  const dropletSeed = mixUint32(phaseRoll);
  const recipeIndex = recipeRoll % CREAM_RECIPES.length;

  return Object.freeze({
    version: 1 as const,
    seed,
    recipeIndex,
    recipe: CREAM_RECIPES[recipeIndex],
    materialPhase: 0.5 + (phaseRoll / 0x100000000) * 97,
    dropletSeed,
  });
}

function toCssRgb(color: Rgb) {
  return `rgb(${color.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

function applyRecipeCssVariables(session: CreamSession) {
  const root = document.documentElement;
  root.dataset.creamRecipe = session.recipe.id;
  root.style.setProperty('--cream-base', toCssRgb(session.recipe.base));
  root.style.setProperty('--cream-light', toCssRgb(session.recipe.light));
  root.style.setProperty('--cream-ribbon-a', toCssRgb(session.recipe.ribbonA));
  root.style.setProperty('--cream-ribbon-b', toCssRgb(session.recipe.ribbonB));
}

export function getOrCreateCreamSession(): CreamSession {
  if (typeof window === 'undefined') {
    throw new Error('Cream sessions can only be created in the browser.');
  }

  const existing = window.__HELADO_CREAM_SESSION__;
  if (existing?.version === 1) {
    applyRecipeCssVariables(existing);
    return existing;
  }

  const session = createCreamSession(createRandomSeed());
  window.__HELADO_CREAM_SESSION__ = session;
  applyRecipeCssVariables(session);
  return session;
}
