export const unknownErrorCode = "UNKNOWN_ERROR" as const;

const defaultMessage = "An unknown error occurred" as const;

export class UnknownError extends Error {
  public readonly code = unknownErrorCode;

  constructor(cause: unknown) {
    super(defaultMessage, { cause });

    this.name = "UnknownError";
  }
}
