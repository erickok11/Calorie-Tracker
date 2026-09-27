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