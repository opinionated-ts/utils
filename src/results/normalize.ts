// oxlint-disable typescript/no-unsafe-type-assertion
import type { Normalize } from "./types";

import { success } from "./constructors";
import { isFailure, isSuccess } from "./guards";

export function normalizeResult<T>(value: T): Normalize<T> {
  if (isFailure(value)) {
    return value as Normalize<T>;
  }

  if (isSuccess(value)) {
    return normalizeResult(value.value) as Normalize<T>;
  }

  return success(value) as Normalize<T>;
}
