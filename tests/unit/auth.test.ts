import { describe, expect, it } from "vitest";
import { createOAuthTransaction, pkceChallenge, randomToken } from "../../functions/_lib/auth";

describe("OAuth primitives", () => {
  it("uses the RFC 7636 S256 challenge", async () => {
    await expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).resolves.toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("creates independent state, nonce, verifier, and a ten-minute transaction", () => {
    const transaction = createOAuthTransaction("/");
    expect(new Set([transaction.state, transaction.nonce, transaction.codeVerifier]).size).toBe(3);
    expect(transaction.exp - transaction.iat).toBe(600);
    expect(randomToken()).toHaveLength(43);
  });
});
