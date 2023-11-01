import MockDate from "mockdate";
import { afterEach, describe, expect, it } from "vitest";

import { getIceBreakerWindow } from "@/services/birthday/getIcebreakerWindow";

describe("getIceBreakerWindow", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("Should return correct window when today is 2023-11-01", () => {
    MockDate.set("2023-11-01");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2023-12-06");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-02-07");
  });

  it("Should return correct window when today is 2023-12-01", () => {
    MockDate.set("2023-12-01");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-01-03");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-03-06");
  });

  it("Should return correct window when today is 2024-01-01", () => {
    MockDate.set("2024-01-01");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-02-07");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-04-03");
  });

  it("Should return correct window when today is 2024-02-01", () => {
    MockDate.set("2024-02-01");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-03-06");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-05-01");
  });

  it("Should return correct window when today is 2024-03-01", () => {
    MockDate.set("2024-03-01");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-04-03");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-06-05");
  });

  it("Should return correct window when today is 2023-11-25", () => {
    MockDate.set("2023-11-25");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2023-12-06");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-02-07");
  });

  it("Should return correct window when today is 2023-12-25", () => {
    MockDate.set("2023-12-25");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-01-03");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-03-06");
  });

  it("Should return correct window when today is 2024-01-25", () => {
    MockDate.set("2024-01-25");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-02-07");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-04-03");
  });

  it("Should return correct window when today is 2024-02-25", () => {
    MockDate.set("2024-02-25");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-03-06");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-05-01");
  });

  it("Should return correct window when today is 2024-03-25", () => {
    MockDate.set("2024-03-25");

    const window = getIceBreakerWindow();

    expect(window.start.format("YYYY-MM-DD")).toBe("2024-04-03");
    expect(window.end.format("YYYY-MM-DD")).toBe("2024-06-05");
  });
});
