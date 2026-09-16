import { describe, expect, it } from "vitest";

import { failure, normalizeResult, success } from "@/results";

class CustomError extends Error {}

describe("normalizeResult", () => {
  it("should wrap a plain value in Success", () => {
    expect(normalizeResult(42)).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should preserve a Failure", () => {
    const error_ = new CustomError("failed");
    const result = failure(error_);

    expect(normalizeResult(result)).toBe(result);
  });

  it("should preserve a plain Success", () => {
    const result = success(42);

    expect(normalizeResult(result)).toBe(result);
  });

  it("should unwrap a nested Success", () => {
    const result = normalizeResult(success(success(42)));

    expect(result).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should recursively unwrap deeply nested Success values", () => {
    const result = normalizeResult(success(success(success(success(42)))));

    expect(result).toEqual({
      ok: true,
      value: 42,
    });
  });

  it("should unwrap a Failure nested inside Success", () => {
    const error_ = new CustomError("failed");

    const result = normalizeResult(success(success(failure(error_))));

    expect(result).toEqual({
      ok: false,
      error: error_,
    });
  });

  it("should recursively unwrap a Failure from any nesting depth", () => {
    const error_ = new CustomError("failed");

    const result = normalizeResult(success(success(success(failure(error_)))));

    expect(result).toEqual({
      ok: false,
      error: error_,
    });
  });

  it("should preserve falsy values", () => {
    expect(normalizeResult(false)).toEqual({
      ok: true,
      value: false,
    });

    expect(normalizeResult(0)).toEqual({
      ok: true,
      value: 0,
    });

    expect(normalizeResult("")).toEqual({
      ok: true,
      value: "",
    });

    expect(normalizeResult(null)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("should preserve object identity for plain values", () => {
    const value = { id: 1 };

    const result = normalizeResult(value);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toBe(value);
    }
  });
});
