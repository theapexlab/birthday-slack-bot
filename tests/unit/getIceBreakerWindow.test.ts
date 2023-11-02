import MockDate from "mockdate";
import { describe, expect, it } from "vitest";

import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";
import { testCases } from "@/testUtils/iceBreakerTestCases";

describe("getIceBreakerWindow", () => {
  it("Should return correct window", () => {
    testCases.forEach((testCase) => {
      MockDate.set(testCase.today);

      const window = getIceBreakerWindow();

      expect(window.start.format("YYYY-MM-DD")).toBe(testCase.start);
      expect(window.end.format("YYYY-MM-DD")).toBe(testCase.end);
    });
  });
});
