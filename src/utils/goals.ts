export type GoalStatus =
 | "complete"
 | "partial"
 | "incomplete";

export function getGoalStatus(
    calories:number,
    protein:number,
    calorieGoal: number,
    proteinGoal: number
): GoalStatus {
    const calorieComplete = calories <= calorieGoal;

    const proteinComplete = protein >= proteinGoal;

    if(calorieComplete && proteinComplete){
        return "complete";
    }

    if(calorieComplete || proteinComplete) {
        return "partial";
    }

    return "incomplete";
}