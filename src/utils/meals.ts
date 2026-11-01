import type { MealType } from "@/constants/meals";

export function getDefaultMeal(now: Date): MealType {
    const minutes = now.getHours() * 60 + now.getMinutes();

    if(minutes >= 5 * 60 && minutes < 10 * 60 + 30) return "breakfast";
    if(minutes >= 10 * 60 + 30 && minutes < 15 * 60) return "lunch";
    if(minutes >= 17 * 60 && minutes < 21 * 60) return "dinner";
    return "snack";
}