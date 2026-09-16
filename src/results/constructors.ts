import { UnknownError } from "@/errors";

import type { Failure, Success } from "./types";

/**
 * Creates a {@link Success} result from `value`.
 *
 * No normalization is performed: an existing {@link Result} is wrapped as-is.
 * Use {@link normalizeResult} to flatten nested results.
 *
 * @typeParam T - Type of the successful value.
 * @param value - Value to wrap.
 * @returns A {@link Success} containing `value`.
 * @example
 * const result = success(42);
 * // => { ok: true, value: 42 }
 */
export function success<T>(value: T): Success<T> {
  return {
    ok: true,
    value,
  };
}

/**
 * Creates a {@link Failure} result from `error_`.
 *
 * The error instance is preserved as-is.
 *
 * @typeParam E - Error type, constrained to `Error`.
 * @param error_ - Error to wrap.
 * @returns A {@link Failure} containing `error_`.
 * @example
 * const result = failure(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 */
export function failure<E extends Error>(error_: E): Failure<E> {
  return {
    error: error_,
    ok: false,
  };
}

/**
 * Creates a {@link Failure} from any thrown value.
 *
 * - `Error` causes are preserved as-is.
 * - Anything else is wrapped in a {@link UnknownError}, keeping the original
 *   cause in its `cause` property.
 *
 * Designed for `catch` blocks; used internally by {@link tryResult} and
 * {@link tryResultAsync}.
 *
 * @typeParam E - Error type, constrained to `Error`.
 * @param cause - The cause of the failure.
 * @returns A {@link Failure}: `cause` itself when it is an `Error`, a
 * {@link UnknownError} wrapping it otherwise.
 * @example
 * error(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 *
 * error("failed");
 * // => { ok: false, error: UnknownError { cause: "failed" } }
 */
export function error<E extends Error>(cause: E): Failure<E>;
export function error(cause: unknown): Failure<UnknownError>;
export function error(cause: unknown): Failure {
  if (cause instanceof Error) {
    return failure(cause);
  }

  return failure(new UnknownError({ cause }));
}
