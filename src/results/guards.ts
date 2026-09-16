// oxlint-disable typescript/no-unsafe-type-assertion
import type { Failure, Success } from "./types";

export function isFailure(value: unknown): value is Failure {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    (value as { ok?: unknown }).ok === false
  );
}

export function isSuccess(value: unknown): value is Success<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    (value as { ok?: unknown }).ok === true
  );
}
