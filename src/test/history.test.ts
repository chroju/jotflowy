import { describe, it, expect } from "vitest";
import { addDays, dateKeysBack } from "../api/history";

describe("addDays", () => {
  it("adds days within the same month", () => {
    expect(addDays("2026-05-10", 3)).toBe("2026-05-13");
  });

  it("subtracts days with negative n", () => {
    expect(addDays("2026-05-10", -3)).toBe("2026-05-07");
  });

  it("crosses month boundary forward", () => {
    expect(addDays("2026-05-31", 1)).toBe("2026-06-01");
  });

  it("crosses month boundary backward", () => {
    expect(addDays("2026-05-01", -1)).toBe("2026-04-30");
  });

  it("crosses year boundary backward", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("handles leap year", () => {
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
  });

  it("returns same date for n=0", () => {
    expect(addDays("2026-05-10", 0)).toBe("2026-05-10");
  });
});

describe("dateKeysBack", () => {
  it("returns consecutive date keys going backward from start", () => {
    expect(dateKeysBack("2026-05-10", 3)).toEqual([
      "2026-05-10",
      "2026-05-09",
      "2026-05-08",
    ]);
  });

  it("crosses month boundary", () => {
    expect(dateKeysBack("2026-06-01", 3)).toEqual([
      "2026-06-01",
      "2026-05-31",
      "2026-05-30",
    ]);
  });

  it("returns single key for count=1", () => {
    expect(dateKeysBack("2026-05-10", 1)).toEqual(["2026-05-10"]);
  });

  it("returns empty array for count=0", () => {
    expect(dateKeysBack("2026-05-10", 0)).toEqual([]);
  });
});
