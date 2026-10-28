import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { getFoodsById } from "@/database/database";
import { type Food, rowToFood} from "@/context/FoodContext";

export function useFoodById(id: string | undefined) {
    const [food, setFood] = useState<Food | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const load = async () => {
                try {
                    const row = id ? await getFoodsById(Number(id)) : null;

                    if(active) setFood(row ? rowToFood(row) : null);
                } catch (error) {
                    console.error("Failed to load food:", error);

                    if(active) setFood(null);
                } finally {
                    if (active) setLoading(false);
                }
            };

            load();

            return () => {
                active = false;
            };
        }, [id])
    );

    return {food, loading};
}