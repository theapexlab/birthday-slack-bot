import MockDate from "mockdate";
import { afterAll, describe, expect, it } from "vitest";

import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";
import { testCases } from "@/testUtils/unit/iceBreakerTestCases";

describe("getIceBreakerWindow", () => {
  afterAll(() => {
    MockDate.reset();
  });

  testCases.forEach((testCase) => {
    it("Should return correct window", () => {
      MockDate.set(testCase.today);

      const window = getIceBreakerWindow();

      expect(window.start.format("YYYY-MM-DD")).toBe(testCase.start);
      expect(window.end.format("YYYY-MM-DD")).toBe(testCase.end);
    });
  });
});
