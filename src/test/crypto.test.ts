import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../api/crypto";

describe("encrypt / decrypt", () => {
  it("round-trips plaintext", async () => {
    const enc = await encrypt("hello", "secret");
    expect(await decrypt(enc, "secret")).toBe("hello");
  });

  it("round-trips empty string", async () => {
    const enc = await encrypt("", "secret");
    expect(await decrypt(enc, "secret")).toBe("");
  });

  it("round-trips Japanese text", async () => {
    const enc = await encrypt("日本語テスト", "secret");
    expect(await decrypt(enc, "secret")).toBe("日本語テスト");
  });

  it("round-trips special characters", async () => {
    const enc = await encrypt("!@#$%^&*()<>?", "secret");
    expect(await decrypt(enc, "secret")).toBe("!@#$%^&*()<>?");
  });

  it("produces different ciphertext for same input due to random IV", async () => {
    const enc1 = await encrypt("hello", "secret");
    const enc2 = await encrypt("hello", "secret");
    expect(enc1).not.toBe(enc2);
  });

  it("fails to decrypt with wrong secret", async () => {
    const enc = await encrypt("hello", "secret");
    await expect(decrypt(enc, "wrong-secret")).rejects.toThrow();
  });
});
