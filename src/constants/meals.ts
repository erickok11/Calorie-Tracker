export const MEALS = [
    { key: "breakfast", label: "Breakfast"},
    { key: "lunch", label: "Lunch"},
    { key: "dinner", label: "Dinner"},
    { key: "snack", label: "Snacks"},
] as const;

export type MealType = (typeof MEALS)[number]["key"];

export function isMealType(value: unknown): value is MealType{
    return MEALS.some((meal) => meal.key === value);
}

