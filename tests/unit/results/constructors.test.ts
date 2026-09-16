import { describe, expect, it } from "vitest";

import { error, failure, success } from "@/results";

class CustomError extends Error {}

describe("results constructors", () => {
  describe("success", () => {
    it("should create a successful result", () => {
      expect(success(42)).toEqual({
        ok: true,
        value: 42,
      });
    });

    it("should preserve the original value", () => {
      const value = { id: 1 };

      expect(success(value).value).toBe(value);
    });

    it("should support undefined as a successful value", () => {
      expect(success(undefined)).toEqual({
        ok: true,
        value: undefined,
      });
    });
  });

  describe("failure", () => {
    it("should create a failed result", () => {
      const error_ = new CustomError("failed");

      expect(failure(error_)).toEqual({
        ok: false,
        error: error_,
      });
    });

    it("should preserve the original error", () => {
      const error_ = new CustomError("failed");

      expect(failure(error_).error).toBe(error_);
    });
  });

  describe("error", () => {
    it("should preserve an Error instance", () => {
      const error_ = new CustomError("failed");

      const result = error(error_);

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(error_);
      }
    });

    it("should wrap non-Error causes in UnknownError", () => {
      const result = error("failed");

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.name).toBe("UnknownError");
      }
    });

    it("should preserve the original cause", () => {
      const cause = { reason: "failed" };

      const result = error(cause);

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.cause).toBe(cause);
      }
    });
  });
});
