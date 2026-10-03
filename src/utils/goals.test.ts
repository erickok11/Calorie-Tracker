import { getGoalStatus } from "./goals";

import { describe, expect, test } from '@jest/globals';


describe("goal status", () => {
  test("complete when both goals are accomplished", () => {
    expect(
      getGoalStatus(1700, 150, 1800, 140)
    ).toBe("complete");
  });

  test("partial when only calorie goal is accomplished", () => {
    expect(
      getGoalStatus(1700, 100, 1800, 140)
    ).toBe("partial");
  });

  test("partial when only protein goal is accomplished", () => {
    expect(
      getGoalStatus(1900, 150, 1800, 140)
    ).toBe("partial");
  });

  test("incomplete when neither goal is accomplished", () => {
    expect(
      getGoalStatus(1900, 100, 1800, 140)
    ).toBe("incomplete");
  });

  test("calorie goal counts when exactly at target", () => {
    expect(
      getGoalStatus(1800, 140, 1800, 140)
    ).toBe("complete");
  });
});