export const WEIGHT_UNITS = [
    "g",
    "oz",
    "lb",
] as const;

export const VOLUME_UNITS = [
    "mL",
    "cup",
    "tbsp",
    "tsp",
] as const;

export const COUNT_UNITS = [
    "piece",
    "slice",
    "serving",
] as const;

export const FOOD_UNITS = [
    ...WEIGHT_UNITS,
    ...VOLUME_UNITS,
    ...COUNT_UNITS,
] as const;

export type FoodUnit = (typeof FOOD_UNITS)[number];