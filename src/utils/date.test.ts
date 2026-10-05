import { describe, expect, test } from '@jest/globals';
import { formatDateForDatabase, getDaysInMonth } from "./date";

describe( "date utilities", () => {
    test("formats a date as YYYY-MM-DD", () => {
        const date = new Date(2026, 8, 27);

        expect(
            formatDateForDatabase(date)
        ).toBe("2026-09-27");
    });

    test("adds leading zeros", () => {
        const date = new Date(2026, 0, 5);

        expect(
            formatDateForDatabase(date)
        ).toBe("2026-01-05");
    });

    test("returns correct number of days for each month", () => {
        expect(getDaysInMonth(2026,0)).toBe(31);
        expect(getDaysInMonth(2026,1)).toBe(28);
        expect(getDaysInMonth(2026,2)).toBe(31);
        expect(getDaysInMonth(2026,3)).toBe(30);
        expect(getDaysInMonth(2026,4)).toBe(31);
        expect(getDaysInMonth(2026,5)).toBe(30);
        expect(getDaysInMonth(2026,6)).toBe(31);
        expect(getDaysInMonth(2026,7)).toBe(31);
        expect(getDaysInMonth(2026,8)).toBe(30);
        expect(getDaysInMonth(2026,9)).toBe(31);
        expect(getDaysInMonth(2026,10)).toBe(30);
        expect(getDaysInMonth(2026,11)).toBe(31);
    });

    test("handles leap years", () => {
        expect(getDaysInMonth(2028,1)).toBe(29);
        expect(getDaysInMonth(2024,1)).toBe(29);
    })
});

