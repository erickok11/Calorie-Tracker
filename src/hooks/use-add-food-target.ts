import { useLocalSearchParams } from "expo-router";
import { isMealType } from "@/constants/meals";

export function useAddFoodTarget() {
    const params = useLocalSearchParams<{ date?: string; meal?: string }>();

    const date = params.date || undefined;
    const meal = isMealType(params.meal) ? params.meal : undefined;

    const forwardParams = {
        ...(date ? {date} : {}),
        ...(meal ? {meal} : {}),
    };

    return {date, meal, forwardParams};
}