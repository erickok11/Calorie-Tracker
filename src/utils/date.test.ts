import { describe, expect, test } from '@jest/globals';
import { formatDateForDatabase } from "./date";

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
});