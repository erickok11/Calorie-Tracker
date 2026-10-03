import {
    ensureDailyGoals,
    getSettings,
    updateDailyGoals,
    updateGoal as updateGoalInDatabase,
} from "@/database/database";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    formatDateForDatabase
} from "@/utils/date";

type GoalsContextType = {
    calorieGoal: number;
    proteinGoal: number;

    updateGoal: (
        calorieGoal: number,
        proteinGoal: number,
    ) => Promise<void>;
};

const GoalsContext = createContext<GoalsContextType | undefined>(
    undefined
);

export function GoalsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [calorieGoal, setCalorieGoal] = useState(1800);
    const [proteinGoal, setProteinGoal] = useState (140);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async() => {
        const settings = await getSettings();

        if(settings) {
            setCalorieGoal(settings.calorie_goal);
            setProteinGoal(settings.protein_goal);

            const today = formatDateForDatabase(
                new Date()
            );

            await ensureDailyGoals(
                today,
                settings.calorie_goal,
                settings.protein_goal
            );

        }

    };

    const updateGoal = async(
        newCalorieGoal: number,
        newProteinGoal: number
    ) => {
        await updateGoalInDatabase(
            newCalorieGoal,
            newProteinGoal
        );

        const today = formatDateForDatabase (
            new Date()
        );

        await updateDailyGoals(
            today,
            newCalorieGoal,
            newProteinGoal
        )
        setCalorieGoal(newCalorieGoal);
        setProteinGoal(newProteinGoal);
    };

    return (
        <GoalsContext.Provider value={{calorieGoal,proteinGoal,updateGoal}}>
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoal() {
    const context = useContext(GoalsContext);

    if(!context) {
        throw new Error(
            "useGoal must be used inside a GoalsProvider"
        );
    }

    return context;
}