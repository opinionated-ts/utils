import { describe, expect, it } from "vitest";

import { UnknownError, unknownErrorCode } from "@/errors";
import {
  error,
  failure,
  isFailure,
  isSuccess,
  normalizeResult,
  success,
  tryResult,
  tryResultAsync,
} from "@/results";

describe("results integration", () => {
  it("should compose success, normalization and guards", () => {
    const result = normalizeResult(success(success(42)));

    expect(isSuccess(result)).toBe(true);
    expect(isFailure(result)).toBe(false);

    if (isSuccess(result)) {
      expect(result.value).toBe(42);
    }
  });

  it("should compose failure, normalization and guards", () => {
    const error_ = new Error("failed");

    const result = normalizeResult(success(success(failure(error_))));

    expect(isFailure(result)).toBe(true);
    expect(isSuccess(result)).toBe(false);

    if (isFailure(result)) {
      expect(result.error).toBe(error_);
    }
  });

  it("should convert an unknown thrown value through the complete try flow", () => {
    const result = tryResult(() => {
      throw {
        reason: "invalid input",
      };
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBeInstanceOf(UnknownError);
      expect(result.error.code).toBe(unknownErrorCode);
      expect(result.error.cause).toEqual({
        reason: "invalid input",
      });
    }
  });

  it("should preserve an existing Error through the complete try flow", () => {
    const error_ = new Error("database failed");

    const result = tryResult(() => {
      throw error_;
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBe(error_);
    }
  });

  it("should normalize an existing Result returned by tryResult", () => {
    const result = tryResult(() => success(success("value")));

    expect(result).toEqual({
      ok: true,
      value: "value",
    });
  });

  it("should normalize an existing Failure returned by tryResult", () => {
    const error_ = new Error("failed");

    const result = tryResult(() => success(failure(error_)));

    expect(result).toEqual({
      ok: false,
      error: error_,
    });
  });

  it("should compose async execution, normalization and guards", async () => {
    const result = await tryResultAsync(async () => success(success("value")));

    expect(isSuccess(result)).toBe(true);

    if (isSuccess(result)) {
      expect(result.value).toBe("value");
    }
  });

  it("should convert async unknown failures through the complete flow", async () => {
    const result = await tryResultAsync(async () => {
      throw 123;
    });

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBeInstanceOf(UnknownError);
      expect(result.error.cause).toBe(123);
    }
  });

  it("should preserve native Error instances passed to error", () => {
    const error_ = new TypeError("invalid value");

    const result = error(error_);

    expect(isFailure(result)).toBe(true);

    if (isFailure(result)) {
      expect(result.error).toBe(error_);
    }
  });
});
