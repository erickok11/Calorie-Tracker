import {
    deleteFoodById,
    getFoodsByDate,
    getLocalDate,
    insertFood,
    updateFoodById,
    ExtraNutritionInput,
    FoodRow,
    ensureDailyGoals,
    getSettings,
} from "@/database/database";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { AppState } from "react-native";

export type Food = {
    id: string;
    name: string;
    amount?: number;
    unit?: string;
    calories: number;
    protein: number;
} & ExtraNutritionInput;

type FoodContextType = {
    foods: Food[];
    addFood: (food: Omit<Food, "id">, date?: string) => Promise<void>;
    deleteFood: (id: string) => Promise<void>;
    updateFood: (food: Food) => Promise<void>;
};

const FoodContext = createContext<FoodContextType | undefined>(
    undefined
);

export function rowToFood(row: FoodRow): Food {
    return {
        id: row.id.toString(),
        name: row.name,
        amount: row.amount ?? undefined,
        unit: row.unit ?? undefined,
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        sugar: row.sugar,
        fiber: row.fiber,
        sodium_mg: row.sodium_mg,
    };
}

export function FoodProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [foods, setFoods] = useState<Food[]>([]);
    const [currentDate, setCurrentDate]  = useState(getLocalDate);

    useEffect(() => {
        let cancelled = false;

        const loadFoods = async () => {

            const savedFoods = await getFoodsByDate(currentDate);
            
            if(cancelled) return;

            setFoods(savedFoods.map(rowToFood));
        }

        loadFoods();

        return() => {
            cancelled = true;
        };

    }, [currentDate]);

    useEffect (() => {
        const subcription = AppState.addEventListener("change", (nextState) => {
            if(nextState === "active") {
                setCurrentDate(getLocalDate());
            }
        });
        
        return () => subcription.remove();
    }, []);

    const addFood = async (food: Omit<Food, "id">, date?: string) => {
        const today = getLocalDate();
        const targetDate = date ?? today;

        const settings = await getSettings();
        if(settings) {
            await ensureDailyGoals(
                targetDate, settings.calorie_goal, settings.protein_goal
            );
        }

        const result = await insertFood(
            food.name,
            food.amount,
            food.unit,
            food.calories,
            food.protein,
            targetDate,
            {
                carbs: food.carbs,
                fat: food.fat,
                sugar: food.sugar,
                fiber: food.fiber,
                sodium_mg: food.sodium_mg,
            }
        );

        if (targetDate !== today) return;
        
        if (today !== currentDate) {
            setCurrentDate(today);
            return;
        }
        
        const newFood: Food = {
            ...food,
            id: result.lastInsertRowId.toString(),
        };

        setFoods((currentFoods) => [
            ...currentFoods,
            newFood,
        ]);
    };

    const deleteFood = async (id: string) => {
        await deleteFoodById(Number(id));

        setFoods((currentFoods) => 
        currentFoods.filter((food) => food.id !== id)
        );
    };

    const updateFood = async (updatedFood: Food) => {
        const existingFood = foods.find(
            (food) => food.id === updatedFood.id
        );
        
        const mergedFood: Food = {
            ...existingFood,
            ...updatedFood,
        };


        await updateFoodById(
            Number(mergedFood.id),
            mergedFood.name,
            mergedFood.amount,
            mergedFood.unit,
            mergedFood.calories,
            mergedFood.protein,
            {
                carbs: mergedFood.carbs,
                fat: mergedFood.fat,
                sugar: mergedFood.sugar,
                fiber: mergedFood.fiber,
                sodium_mg: mergedFood.sodium_mg,
            }
            
        );

        setFoods((currentFoods) => 
            currentFoods.map((food) =>
                food.id === updatedFood.id
                ? { ...food, ...updatedFood }
                : food
            )
        );
    };

    return (
        <FoodContext.Provider
            value={{
                foods,
                addFood,
                deleteFood,
                updateFood
            }}
        >
            {children}
        </FoodContext.Provider>
    );
}

export function useFood() {
    const context = useContext(FoodContext);

    if(!context){
        throw new Error(
            "useFood must be used inside a FoodProvider"
        );
    }

    return context;
}