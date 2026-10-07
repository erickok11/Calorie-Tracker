import { FoodUnit } from "@/constants/unit";

const WEIGHT_TO_GRAMS = {
    g: 1,
    oz: 28.3495,
    lb: 453.592,
};

const VOLUME_TO_ML = {
    mL: 1,
    tsp: 4.92892,
    tbsp: 14.7868,
    cup: 236.588
};

export function convertAmount(
    amount: number,
    fromUnit: FoodUnit,
    toUnit: FoodUnit,
): number | null {
    if (fromUnit === toUnit){
        return amount;
    }

    if (
        fromUnit in WEIGHT_TO_GRAMS &&
        toUnit in WEIGHT_TO_GRAMS
    ) {
        const grams = amount * WEIGHT_TO_GRAMS[fromUnit as keyof typeof WEIGHT_TO_GRAMS];
        
        return (grams / WEIGHT_TO_GRAMS[toUnit as keyof typeof WEIGHT_TO_GRAMS]);
    }
    
    if (
        fromUnit in VOLUME_TO_ML &&
        toUnit in VOLUME_TO_ML
    ) {
        const milliliters = amount * VOLUME_TO_ML[fromUnit as keyof typeof VOLUME_TO_ML];

        return (milliliters/VOLUME_TO_ML[toUnit as keyof typeof VOLUME_TO_ML]);
    }

    return null;
}

export function getCompatibleUnits(
    unit: FoodUnit
): FoodUnit[] {
    if (unit in WEIGHT_TO_GRAMS) {
        return ["g", "oz", "lb"];
    }

    if (unit in VOLUME_TO_ML) {
        return ["mL", "cup", "tbsp", "tsp"];
    }

    return [unit];
}