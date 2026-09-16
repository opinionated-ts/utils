import { describe, expect, it } from "vitest";

import { UnknownError, unknownErrorCode } from "@/errors";

describe("UnknownError", () => {
  it("should extend Error", () => {
    const error = new UnknownError("failed");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnknownError);
  });

  it("should use the expected name", () => {
    const error = new UnknownError("failed");

    expect(error.name).toBe("UnknownError");
  });

  it("should use the expected code", () => {
    const error = new UnknownError("failed");

    expect(error.code).toBe(unknownErrorCode);
    expect(error.code).toBe("UNKNOWN_ERROR");
  });

  it("should use the default message", () => {
    const error = new UnknownError("failed");

    expect(error.message).toBe("An unknown error occurred");
  });

  it("should preserve the cause", () => {
    const cause = {
      reason: "failed",
    };

    const error = new UnknownError(cause);

    expect(error.cause).toBe(cause);
  });
});
