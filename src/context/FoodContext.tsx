import {
    deleteFoodById,
    getFoodsByDate,
    getLocalDate,
    insertFood,
    updateFoodById,
    ExtraNutritionInput,
} from "@/database/database";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

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
    addFood: (food: Omit<Food, "id">) => Promise<void>;
    deleteFood: (id: string) => Promise<void>;
    updateFood: (food: Food) => Promise<void>;
};

const FoodContext = createContext<FoodContextType | undefined>(
    undefined
);

export function FoodProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [foods, setFoods] = useState<Food[]>([]);

    useEffect(() => {
        const loadFoods = async () => {
            const today = getLocalDate();

            const savedFoods = await getFoodsByDate(today);

            const formattedFoods: Food[] = savedFoods.map((food) => ({
                id: food.id.toString(),
                name: food.name,
                amount: food.amount ?? undefined,
                unit: food.unit ?? undefined,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                sugar: food.sugar,
                fiber: food.fiber,
                sodium_mg: food.sodium_mg,
            }));

            setFoods(formattedFoods);
        }

        loadFoods();
    }, []);

    const addFood = async (food: Omit<Food, "id">) => {
        const today = getLocalDate();

        const result = await insertFood(
            food.name,
            food.amount,
            food.unit,
            food.calories,
            food.protein,
            today,
            {
                carbs: food.carbs,
                fat: food.fat,
                sugar: food.sugar,
                fiber: food.fiber,
                sodium_mg: food.sodium_mg,
            }
        );

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