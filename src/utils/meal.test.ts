import { describe, expect, test } from "@jest/globals";
import { getDefaultMeal } from "./meals";

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