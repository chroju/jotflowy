import { describe, it, expect, afterEach, vi } from "vitest";

const { FONT_FAMILY_MAP, applyTypographySettings } = await import(
  "../../public/scripts/utils.js"
);

describe("FONT_FAMILY_MAP", () => {
  it("has gothic entry", () => {
    expect(FONT_FAMILY_MAP["gothic"]).toBeDefined();
    expect(typeof FONT_FAMILY_MAP["gothic"]).toBe("string");
  });

  it("has hiragino entry", () => {
    expect(FONT_FAMILY_MAP["hiragino"]).toBeDefined();
    expect(FONT_FAMILY_MAP["hiragino"]).toContain("Hiragino");
  });

  it("has mincho entry", () => {
    expect(FONT_FAMILY_MAP["mincho"]).toBeDefined();
    expect(FONT_FAMILY_MAP["mincho"]).toContain("serif");
  });
});

describe("applyTypographySettings", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets CSS variables for default settings", () => {
    const spy = vi.spyOn(document.documentElement.style, "setProperty");
    applyTypographySettings({ fontSize: 16, lineHeight: 1.8, fontFamily: "gothic" });
    expect(spy).toHaveBeenCalledWith("--font-size", "16px");
    expect(spy).toHaveBeenCalledWith("--line-height", "1.8");
    expect(spy).toHaveBeenCalledWith("--font-family", expect.any(String));
  });

  it("sets numeric font size correctly", () => {
    const spy = vi.spyOn(document.documentElement.style, "setProperty");
    applyTypographySettings({ fontSize: 20, lineHeight: 1.8, fontFamily: "gothic" });
    expect(spy).toHaveBeenCalledWith("--font-size", "20px");
  });

  it("sets numeric line height correctly", () => {
    const spy = vi.spyOn(document.documentElement.style, "setProperty");
    applyTypographySettings({ fontSize: 16, lineHeight: 2.2, fontFamily: "gothic" });
    expect(spy).toHaveBeenCalledWith("--line-height", "2.2");
  });

  it("uses default values when settings are undefined", () => {
    const spy = vi.spyOn(document.documentElement.style, "setProperty");
    applyTypographySettings({});
    expect(spy).toHaveBeenCalledWith("--font-size", "16px");
    expect(spy).toHaveBeenCalledWith("--line-height", "1.8");
  });
});
