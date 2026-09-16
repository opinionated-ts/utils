/**
 * Stable `code` of every {@link UnknownError}, for checks that do not rely on
 * the error's class or name.
 */
export const unknownErrorCode = "UNKNOWN_ERROR" as const;

const defaultMessage = "An unknown error occurred" as const;

/**
 * Error for failures whose cause is not an `Error` instance.
 *
 * Created by {@link error} when wrapping values like strings, objects or
 * `undefined`; the original cause is kept in the `cause` property.
 */
export class UnknownError extends Error {
  public readonly code = unknownErrorCode;

  constructor(options?: { cause?: unknown }) {
    super(defaultMessage, options);

    this.name = "UnknownError";
  }
}
