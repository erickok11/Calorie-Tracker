import {
    calculateNutrition,
    calculateProgress,
    calculateTotalCalories,
    calculateTotalProtein
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

    describe("calculateNutrition", () => {
        test("calculates nutrition for multiple servings", () => {
            expect(
                calculateNutrition(4, 187, 35, 8)
            ).toEqual({
                calories: 374,
                protein: 70,
            });
        });

        test("calculates nutrition for partial servings", () => {
            expect(
                calculateNutrition(1, 160, 30, 0.5)
            ).toEqual({
                calories: 80,
                protein: 15,
            });
        });

        test("calculates nutrition for decimal servings", () => {
            expect(
                calculateNutrition(1, 160, 30, 1.5)
            ).toEqual({
                calories: 240,
                protein: 45,
            });
        });

        test("returns zero when serving amount is invalid", () => {
            expect(
                calculateNutrition(0, 160, 30, 1)
            ).toEqual({
                calories: 0,
                protein: 0
            });
        });
    })

});