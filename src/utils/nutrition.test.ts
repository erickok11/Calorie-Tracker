import {
    calculateProgress,
    calculateTotalCalories,
    calculateTotalProtein,
} from "./nutrition";

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