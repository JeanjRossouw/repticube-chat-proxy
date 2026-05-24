// Prey options per category. 'Other...' lets users type custom values.

export const PREY_TYPES: Record<string, string[]> = {
  snake: ['Mice', 'Rats', 'Chicks', 'Quail', 'Rabbit', 'Fish', 'Other...'],
  gecko: ['Crickets', 'Dubia roaches', 'Mealworms', 'Waxworms', 'Hornworms', 'BSFL', 'CGD', 'Pinky mice', 'Other...'],
  lizard: ['Crickets', 'Dubia roaches', 'Mealworms', 'Hornworms', 'Mice', 'Pinky mice', 'Greens', 'Fruit', 'Eggs', 'Other...'],
  tortoise: ['Greens', 'Grass / hay', 'Vegetables', 'Fruit', 'Pellets', 'Other...'],
  other: ['Mice', 'Rats', 'Crickets', 'Greens', 'Fish', 'Other...'],
};

// Rodent / rabbit / chicks sizes (mass-based)
export const PREY_SIZES_RODENT: string[] = [
  'Pinky', 'Fuzzy', 'Hopper', 'Weaner', 'Small', 'Medium', 'Large', 'X-Large', 'Adult', 'Mixed', 'Other...',
];

// Insect sizes (age/length-based, applies to all feeder insects)
export const PREY_SIZES_INSECT: string[] = [
  '3 day', '7 day', 'Small', 'Medium', 'Large', 'Adult', 'Mixed', 'Other...',
];

// Tortoise / herbivore portions
export const PREY_SIZES_PLANT: string[] = [
  'Small portion', 'Medium portion', 'Large portion', 'Mixed', 'Other...',
];

// CGD brands (commercial gecko diet)
export const CGD_BRANDS: string[] = [
  'Pangea', 'Ultimate Exotics', 'Urban Gecko', 'Repashy', 'Other...',
];

const INSECT_TYPES = new Set([
  'Crickets', 'Dubia roaches', 'Mealworms', 'Waxworms', 'Hornworms', 'BSFL', 'Locusts', 'Silkworms', 'Superworms',
]);

const PLANT_TYPES = new Set([
  'Greens', 'Grass / hay', 'Grass', 'Hay', 'Vegetables', 'Fruit', 'Pellets',
]);

const CGD_TYPES = new Set([
  'CGD', 'CGD (commercial gecko diet)', 'Pangea', 'Ultimate Exotics', 'Urban Gecko', 'Repashy',
]);

/**
 * Returns the appropriate size list based on the prey type chosen.
 * E.g., picking "Crickets" returns insect sizes, picking "Mice" returns rodent sizes.
 */
export function getPreySizesForType(preyType?: string | null): string[] {
  if (!preyType) return PREY_SIZES_RODENT;
  const t = preyType.trim();
  if (INSECT_TYPES.has(t)) return PREY_SIZES_INSECT;
  if (PLANT_TYPES.has(t)) return PREY_SIZES_PLANT;
  if (CGD_TYPES.has(t)) return CGD_BRANDS;
  return PREY_SIZES_RODENT;
}

export function getPreyTypesForCategory(category?: string | null): string[] {
  if (!category) return PREY_TYPES.other;
  return PREY_TYPES[category] || PREY_TYPES.other;
}

/**
 * Returns true if the prey type is CGD/porridge (treated specially in the UI but still logged as a feeding)
 */
export function isCGDFeeding(preyType?: string | null): boolean {
  if (!preyType) return false;
  return CGD_TYPES.has(preyType.trim());
}

// Backward compatibility export — points to rodent sizes as the default
export const PREY_SIZES = PREY_SIZES_RODENT;
