import type { ExtraNutrition } from "@/database/database";

export type NutritionFood = {
    calories: number;
    protein: number;
};

export function calculateTotalCalories(
    foods: NutritionFood[]
) {
    return foods.reduce(
        (total, food) => total + food.calories, 0
    );
}

export function calculateTotalProtein(
    foods:NutritionFood[]
){
    return foods.reduce(
        (total, food) => total + food.protein, 0
    );
}

export function calculateProgress(
    value: number,
    goal: number
) {
    if (goal <= 0) {
        return 0;
    }

    return Math.min(value/goal, 1);
}

export type ScalableNutriton = {
    calories: number;
    protein: number;
} & ExtraNutrition;

export function getServingRatio(
    consumedAmount: number | null,
    servingAmount: number
): number {
    if(
        consumedAmount === null || !Number.isFinite(consumedAmount) ||
        consumedAmount <= 0 || !Number.isFinite(servingAmount) || servingAmount <= 0
    ) {
        return 0;
    }

    return consumedAmount / servingAmount;
}

export function scaleNutrients(
    food: ScalableNutriton,
    ratio: number
): ScalableNutriton {
    const scale = (value: number | null) =>
        value === null ? null : value * ratio;

    return {
        calories: food.calories * ratio,
        protein: food.protein * ratio,
        carbs: scale(food.carbs),
        fat: scale(food.fat),
        sugar: scale(food.sugar),
        fiber: scale(food.fiber),
        sodium_mg: scale(food.sodium_mg),
    };
}