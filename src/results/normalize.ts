import type { Normalize } from "./types";

// oxlint-disable typescript/no-unsafe-type-assertion
import { success } from "./constructors";
import { isFailure, isSuccess } from "./guards";

export function normalizeResult<T>(value: T): Normalize<T> {
  if (isFailure(value)) {
    return value as Normalize<T>;
  }

  if (isSuccess(value)) {
    const inner = value.value;

    if (isFailure(inner)) {
      return inner as Normalize<T>;
    }

    if (isSuccess(inner)) {
      return normalizeResult(inner) as Normalize<T>;
    }

    return value as Normalize<T>;
  }

  return success(value) as Normalize<T>;
}
