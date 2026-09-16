export const unknownErrorCode = "UNKNOWN_ERROR" as const;

const defaultMessage = "An unknown error occurred" as const;

export class UnknownError extends Error {
  public readonly code = unknownErrorCode;

  constructor(options?: { cause?: unknown }) {
    super(defaultMessage, options);

    this.name = "UnknownError";
  }
}
