import {
    calculateProgress,
    calculateTotalCalories,
    calculateTotalProtein,
    scaleNutrients,
    getServingRatio,
} from "./nutrition";

import { describe, expect, test } from '@jest/globals';


describe("nutrition calculations", () => {
    const foods = [
        {
            calories: 300,
            protein: 30,
        },
        {
            calories: 450,
            protein: 40,
        },
    ];

    test("calculates total calories", () => {
        expect(calculateTotalCalories(foods)).toBe(750);
    });

    test("calculates total protein", () => {
        expect(calculateTotalProtein(foods)).toBe(70);
    });

    test("calculates progess", () => {
        expect(calculateProgress(900, 1800)).toBe(0.5);
    });

    test("caps progress at 100%", () => {
        expect(calculateProgress(2000,1800)).toBe(1);
    });

    test("returns 0 when goal is 0", () => {
        expect(calculateProgress(500, 0)).toBe(0);
    });

});

describe("getServingRatio", () => {
    test("divides consumed amount by serving amount", () => {
        expect(getServingRatio(8, 4)).toBe(2);
    });

    test("returns 0 when serving amount is 0", () => {
        expect(getServingRatio(8, 0)).toBe(0);
    });

    test("returns 0 when units are incompatible (null amount)", () => {
        expect(getServingRatio(null, 4)).toBe(0);
    });
});

describe("scaleNutrients", () => {
    const food = {
        calories: 200, protein: 10,
        carbs: 30, fat: 5, sugar: 12, fiber: 3, sodium_mg: 400,
    };

    test("scales every nutrient by the ratio", () => {
        expect(scaleNutrients(food, 1.5)).toEqual({
            calories: 300, protein: 15,
            carbs: 45, fat: 7.5, sugar: 18, fiber: 4.5, sodium_mg: 600,
        });
    });

    test("keeps unknown nutrients as null, not 0", () => {
        const result = scaleNutrients({ ...food, sugar: null }, 2);
        expect(result.sugar).toBeNull();
    });
});