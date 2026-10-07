import { describe, expect, test } from '@jest/globals';
import { convertAmount } from './units';

describe("convertAmount", () => {
    test("converts pounds to ounces", () => {
        expect(
            convertAmount(1, "lb", "oz")
        ).toBeCloseTo(16,2);
    });

    test("convert ounces to grams", () => {
        expect(
            convertAmount(1, "oz", "g")
        ).toBeCloseTo(28.35,2);
    });

    test("converts cup to milliliters", () => {
        expect(
            convertAmount(1, "cup", "mL")
        ).toBeCloseTo(236.59, 2);
    });

    test("returns same amount for smae unit", () => {
        expect(
            convertAmount(4, "oz", "oz")
        ).toBe(4);
    });

    test("does not convert weight to volume", () => {
        expect(
            convertAmount(1, "lb", "cup")
        ).toBeNull();
    });
})