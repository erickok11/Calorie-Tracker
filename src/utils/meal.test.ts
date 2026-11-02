import { describe, expect, test } from "@jest/globals";
import { getDefaultMeal, groupFoodsByMeal } from "./meals";

const at = (hour: number, minute = 0) => new Date(2026, 10, 1, hour, minute);

describe("getDefaultMeal", () => {
    test("morning is breakfast", () => {
        expect(getDefaultMeal(at(7))).toBe("breakfast");
        expect(getDefaultMeal(at(10, 29))).toBe("breakfast");
    });

    test("midday is lunch", () => {
        expect(getDefaultMeal(at(10, 30))).toBe("lunch");
        expect(getDefaultMeal(at(14, 59))).toBe("lunch");
    });

    test("afternoon is a snack", () => {
        expect(getDefaultMeal(at(15))).toBe("snack");
    });

    test("evening is dinner", () => {
        expect(getDefaultMeal(at(17))).toBe("dinner");
        expect(getDefaultMeal(at(20, 59))).toBe("dinner");
    });

    test("late night is a snack", () => {
        expect(getDefaultMeal(at(21))).toBe("snack");
        expect(getDefaultMeal(at(2))).toBe("snack");
    });
});

describe("groupFoodsByMeal", () => {
    const foods = [
        { id: 1, meal: "lunch" },
        { id: 2, meal: "breakfast" },
        { id: 3, meal: null },
        { id: 4, meal: "lunch" },
    ];

    test("returns the four meals in order", () => {
        const keys = groupFoodsByMeal(foods).slice(0, 4).map((g) => g.key);
        expect(keys).toEqual(["breakfast", "lunch", "dinner", "snack"]);
    });

    test("puts each food in its meal, keeping log order", () => {
        const lunch = groupFoodsByMeal(foods).find((g) => g.key === "lunch");
        expect(lunch?.foods.map((f) => f.id)).toEqual([1, 4]);
    });

    test("includes meals with nothing logged", () => {
        const dinner = groupFoodsByMeal(foods).find((g) => g.key === "dinner");
        expect(dinner?.foods).toEqual([]);
    });

    test("collects foods without a valid meal under Other", () => {
        const withBadMeal = [...foods, { id: 5, meal: "brunch" }];
        const other = groupFoodsByMeal(withBadMeal).find((g) => g.key === "other");
        expect(other?.foods.map((f) => f.id)).toEqual([3, 5]);
    });

    test("leaves out Other when every food has a meal", () => {
        const groups = groupFoodsByMeal([{ id: 1, meal: "dinner" }]);
        expect(groups.some((g) => g.key === "other")).toBe(false);
    });
});