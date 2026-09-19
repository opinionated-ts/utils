import type {
  ErrorOptions,
  Exact,
  IsObject,
  Merge,
  RemoveFixed,
  ResolvedErrorOptions,
  Simplify,
  SimplifyDeep,
} from "./types";

import { BaseError, type ErrorContext } from "./base";

/**
 * Represents an error created by a factory returned from {@link createError}.
 *
 * The resulting error contains the factory's configured name together with the
 * final code, message, and context resolved for that specific error.
 */
type ErrorInstance<
  Name extends string,
  Code extends string,
  Message extends string,
  Context,
> = Context extends ErrorContext
  ? BaseError<Code, Message, Context> & {
      readonly name: Name;
    }
  : never;

/**
 * Represents the options accepted by a generated error factory.
 *
 * Values controlled by the factory are removed from the caller's options.
 * Nested objects remain available when they contain properties that are still
 * allowed to be provided by the caller.
 */
type RemainingErrorOptions<Fixed extends ErrorOptions> = Simplify<
  Omit<ErrorOptions, keyof Fixed> & {
    [
      Key in keyof Fixed & keyof ErrorOptions as IsObject<Fixed[Key]> extends true ? Key : never
    ]?: RemoveFixed<ErrorOptions[Key], Fixed[Key]>;
  }
>;

/**
 * Resolves the error code used by the generated factory.
 *
 * Factory-fixed values take precedence over values supplied when creating the
 * error, which in turn take precedence over factory defaults.
 */
type ErrorCode<
  Fixed extends ErrorOptions,
  Defaults extends ErrorOptions,
  Options extends ErrorOptions,
> = Extract<ResolvedErrorOptions<Fixed, Defaults, Options>["code"], string>;

/**
 * Resolves the error message used by the generated factory.
 *
 * Factory-fixed values take precedence over values supplied when creating the
 * error, which in turn take precedence over factory defaults.
 */
type ErrorMessage<
  Fixed extends ErrorOptions,
  Defaults extends ErrorOptions,
  Options extends ErrorOptions,
> = Extract<ResolvedErrorOptions<Fixed, Defaults, Options>["message"], string>;

/**
 * Represents the final context stored on the created error.
 *
 * Default context, per-error context, and fixed context are combined
 * recursively, with fixed values taking precedence.
 */
type ResolvedContext<
  Defaults extends ErrorOptions,
  Options extends ErrorOptions,
  Fixed extends ErrorOptions,
> = SimplifyDeep<
  Extract<Merge<Merge<Defaults["context"], Options["context"]>, Fixed["context"]>, ErrorContext>
>;

/**
 * Callable error factory returned by {@link createError}.
 *
 * Pass the options that should vary for the specific error being created.
 * Values configured as defaults are used automatically, while fixed values
 * always remain under the factory's control.
 */
type ErrorFactory<
  Name extends string,
  Defaults extends ErrorOptions,
  Fixed extends ErrorOptions,
> = <const Options extends RemainingErrorOptions<Fixed>>(
  error: Exact<Options, RemainingErrorOptions<Fixed>>,
) => ErrorInstance<
  Name,
  ErrorCode<Fixed, Defaults, Options>,
  ErrorMessage<Fixed, Defaults, Options>,
  ResolvedContext<Defaults, Options, Fixed>
>;

/**
 * Configuration used to create a specialized error factory.
 *
 * A factory can define:
 *
 * - `name` — the name assigned to the factory and its errors.
 * - `defaults` — values automatically used when an error does not provide
 *   them.
 * - `fixed` — values controlled by the factory and always used as configured.
 *
 * Fixed values cannot be overridden when creating an error.
 */
type CreateErrorOptions<
  Name extends string,
  Defaults extends ErrorOptions,
  Fixed extends ErrorOptions,
> = {
  /** Name assigned to the factory and the errors it creates. */
  name?: Name;

  /**
   * Values used automatically when the corresponding value is not provided
   * when creating an error.
   */
  defaults?: Defaults;

  /**
   * Values controlled by the factory.
   *
   * These values always take precedence over defaults and per-error options
   * and cannot be overridden by callers.
   */
  fixed?: Fixed;
};

/**
 * Creates a reusable factory for a specific kind of error.
 *
 * Use the factory configuration to define values that are shared across all
 * errors, and provide per-error values when creating individual errors.
 *
 * When the same option is provided at multiple levels, the most specific
 * value takes precedence:
 *
 * `fixed` > per-error options > `defaults`
 *
 * - `defaults` provide values used when no other value is provided.
 * - Per-error options customize a specific error and take precedence over
 *   `defaults`.
 * - `fixed` values are controlled by the factory, take precedence over other
 *   values, and cannot be overridden by individual errors.
 *
 * This makes it possible to define a common error configuration once while
 * still allowing each created error to provide its own details where needed.
 *
 * If no `code` is provided by `defaults` or `fixed`, each created error must
 * provide its own `code`.
 *
 * @param options - Configuration for the values shared by the factory.
 * @returns A factory for creating errors with the configured defaults and
 *   fixed values.
 *
 * @example
 * ```ts
 * const ApiError = createError({
 *   name: "ApiError",
 *   defaults: {
 *     message: "An API error occurred",
 *     context: {
 *       internal: {
 *         requestPath: "/",
 *       },
 *     },
 *   },
 *   fixed: {
 *     code: "API_ERROR",
 *     context: {
 *       internal: {
 *         source: "api",
 *       },
 *     },
 *   },
 * });
 *
 * throw ApiError({
 *   message: "Request failed", // takes precedence over defaults.message
 *   context: {
 *     internal: {
 *       requestPath: "/other-path", // takes precedence over defaults.context.internal.requestPath
 *     },
 *   },
 * });
 * ```
 */

export function createError<
  const Name extends string = "Error",
  const Defaults extends ErrorOptions = {},
  const Fixed extends ErrorOptions = {},
>(options: CreateErrorOptions<Name, Defaults, Fixed>): ErrorFactory<Name, Defaults, Fixed>;
export function createError<
  const Name extends string = "Error",
  const Defaults extends ErrorOptions = {},
  const Fixed extends ErrorOptions = {},
>(options: CreateErrorOptions<Name, Defaults, Fixed>): ErrorFactory<Name, Defaults, Fixed>;
export function createError(options: {
  name?: string;
  defaults?: ErrorOptions;
  fixed?: ErrorOptions;
}): any {
  const name = options.name ?? "Error";

  /**
   * Concrete error class used internally by the generated factory.
   *
   * The class applies factory defaults, caller options, and fixed values before
   * delegating the final initialization to {@link BaseError}.
   */
  const GeneratedError = class extends BaseError {
    /**
     * Creates an error instance using the configured error options.
     *
     * @param error - Error options supplied by the generated factory.
     * @throws {Error} When no error code is available after option resolution.
     */
    constructor(error: ErrorOptions) {
      const merged = mergeErrorOptions(options.defaults, error, options.fixed);
      const code = merged.code;

      if (code === undefined) {
        throw new Error("An error code is required");
      }

      super({
        ...merged,
        code,
      });
    }
  };

  Object.defineProperty(GeneratedError, "name", {
    value: name,
    configurable: true,
  });

  /**
   * Creates an instance of the generated error class.
   *
   * @param error - Error options resolved using the factory configuration.
   * @returns A configured error instance.
   */
  function create(error: ErrorOptions) {
    const instance = new GeneratedError(error);

    Object.defineProperty(instance, "name", {
      value: name,
      configurable: true,
      writable: true,
    });

    captureStackTrace(instance, create);

    return instance;
  }

  Object.defineProperty(create, "name", {
    value: name,
    configurable: true,
  });

  create.prototype = GeneratedError.prototype;

  return create;
}

/**
 * Captures an error stack trace while excluding the specified internal
 * factory frame when the runtime provides a compatible `Error.captureStackTrace`
 * implementation.
 *
 * @param error - Error whose stack trace should be captured.
 * @param constructor - Factory or constructor frame to exclude from the trace.
 */
function captureStackTrace(error: Error, constructor?: Function): void {
  const capture = (
    Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    }
  ).captureStackTrace;

  capture?.(error, constructor);
}

/**
 * Determines whether a value is a plain object that can safely participate
 * in the recursive error-options merge.
 *
 * Arrays, `null`, and class instances are treated as leaf values rather than
 * recursively merged objects.
 *
 * @param value - Value to test.
 * @returns `true` when `value` is a plain object whose prototype is either
 * `Object.prototype` or `null`.
 */
function isMergeableObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Recursively merges error options from left to right.
 *
 * Later values override earlier values. When both values are mergeable plain
 * objects, their properties are merged recursively; otherwise the later value
 * replaces the earlier value.
 *
 * @param options - Error-option objects to merge in precedence order.
 * @returns The merged error options.
 */
function mergeErrorOptions(...options: Array<ErrorOptions | undefined>): ErrorOptions {
  let result: ErrorOptions = {};

  for (const option of options) {
    if (option === undefined) {
      continue;
    }

    result = mergeObjects(result, option);
  }

  return result;
}

/**
 * Recursively merges two plain objects.
 *
 * Properties from `override` take precedence over properties from `base`.
 * Nested plain objects are merged recursively, while all other values replace
 * the corresponding value from `base`.
 *
 * Neither input object is mutated.
 *
 * @param base - Base object whose properties provide the initial values.
 * @param override - Object whose properties override or extend `base`.
 * @returns A new object containing the merged properties.
 */
function mergeObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = result[key];

    result[key] =
      isMergeableObject(current) && isMergeableObject(value) ? mergeObjects(current, value) : value;
  }

  return result;
}
