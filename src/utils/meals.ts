import { type MealType, isMealType, MEALS} from "@/constants/meals";

export type MealGroup<T> = {
    key: MealType | "other";
    label: string;
    foods: T[];
};

export function groupFoodsByMeal<T extends {meal?: string | null}>(
    foods: T[]
): MealGroup<T>[] {
    const groups: MealGroup<T>[] = MEALS.map((meal) => ({
        key: meal.key,
        label: meal.label,
        foods: foods.filter((food) => food.meal === meal.key),
    }));

    const other = foods.filter((food) => !isMealType(food.meal));

    if(other.length > 0){
        groups.push({ key: "other", label:"Other", foods: other });
    }
    
    return groups;
}

export function getDefaultMeal(now: Date): MealType {
    const minutes = now.getHours() * 60 + now.getMinutes();

    if(minutes >= 5 * 60 && minutes < 10 * 60 + 30) return "breakfast";
    if(minutes >= 10 * 60 + 30 && minutes < 15 * 60) return "lunch";
    if(minutes >= 17 * 60 && minutes < 21 * 60) return "dinner";
    return "snack";
}

