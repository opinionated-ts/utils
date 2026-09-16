import { UnknownError } from "@/errors";

import type { Failure, Success } from "./types";

export function success<T>(value: T): Success<T> {
  return {
    ok: true,
    value,
  };
}

export function failure<E extends Error>(error_: E): Failure<E> {
  return {
    error: error_,
    ok: false,
  };
}

export function error<E extends Error>(cause: E): Failure<E>;
export function error(cause: unknown): Failure<UnknownError>;
export function error(cause: unknown): Failure {
  if (cause instanceof Error) {
    return failure(cause);
  }

  return failure(new UnknownError({ cause }));
}
