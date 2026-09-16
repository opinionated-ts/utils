export type Failure<E extends Error = Error> = {
  error: E;
  ok: false;
};

export type Success<T> = {
  ok: true;
  value: T;
};

export type Result<T, E extends Error = Error> = Failure<E> | Success<T>;

/**
 * Normalizes any value into the canonical Result shape.
 *
 * - Failure<E> -> Failure<E>
 * - Success<T> -> recursively normalize T
 * - T -> Success<T>
 *
 * Examples:
 * Normalize<number>                         -> Success<number>
 * Normalize<Success<number>>               -> Success<number>
 * Normalize<Success<Success<number>>>      -> Success<number>
 * Normalize<Success<Failure<MyError>>>     -> Failure<MyError>
 */
export type Normalize<T> =
  T extends Failure<infer E> ? Failure<E> : T extends Success<infer U> ? Normalize<U> : Success<T>;

export type NormalizedResult<T> = Normalize<T>;
