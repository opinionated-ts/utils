import type { BaseErrorOptions } from "./base";

/**
 * Options accepted by `BaseError` and `createError`.
 */
export type ErrorOptions = Partial<BaseErrorOptions>;

/**
 * Determines whether `T` is a non-array object.
 *
 * `null`, arrays, and non-object values are excluded.
 *
 * `NonNullable` is used so optional object properties such as
 * `{ ... } | undefined` are still recognized as objects.
 */
export type IsObject<T> = T extends object ? (T extends readonly unknown[] ? false : true) : false;

/**
 * Flattens an intersection into a regular object type.
 *
 * This is mainly useful for improving type readability in editor hovers.
 */
export type Simplify<T> = {
  [Key in keyof T]: T[Key];
};

export type SimplifyDeep<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? {
        [Key in keyof T]: SimplifyDeep<T[Key]>;
      }
    : T;

/**
 * Removes properties from `Source` that are controlled by `Fixed`.
 *
 * Nested objects are traversed recursively. A fixed leaf becomes `undefined`
 * in the resulting type, preventing callers from providing that property.
 * A fixed object remains available only through its non-fixed descendants,
 * also preventing callers from providing that property.
 *
 * @example
 * preventing callers from providing that property.
 *
 * @example
 * ```ts
 * type Source = {
 *   context?: {
 *     internal?: {
 *       source?: string;
 *       requestId?: string;
 *     };
 *   };
 * };
 *
 * type Fixed = {
 *   context: {
 *     internal: {
 *       source: "api";
 *     };
 *   };
 * };
 *
 * type Result = RemoveFixed<Source, Fixed>;
 *
 * // {
 * //   context?: {
 * //     internal?: {
 * //       source?: string; // force `undefined` because `Fixed` has a value for this property
 * //       requestId?: string;
 * //     };
 * //   };
 * // }
 * ```
 */
export type RemoveFixed<Source, Fixed> =
  IsObject<Fixed> extends true
    ? Source extends object
      ? Source extends readonly unknown[]
        ? Source
        : Omit<Source, keyof Fixed> &
            Partial<{
              [Key in keyof Fixed & keyof Source]: RemoveFixed<Source[Key], Fixed[Key]>;
            }>
      : Source
    : never;

/**
 * Rejects properties that are not present in `Allowed`.
 *
 * This check applies to the current object level. Nested objects are handled
 * separately by `RemoveFixed` and the other recursive utility types.
 */
export type Exact<Options, Allowed> = Options &
  Record<Exclude<keyof Options, keyof Allowed>, never>;

/**
 * Recursively merges two option types.
 *
 * `Override` takes precedence over `Base`.
 */
export type Merge<Base, Override> =
  IsObject<Base> extends true
    ? IsObject<Override> extends true
      ? MergeObjects<Extract<Base, object>, Extract<Override, object>>
      : Override
    : Override;

type MergeObjects<Base extends object, Override extends object> = Simplify<
  Omit<Base, keyof Override> & {
    [Key in keyof Override]: Key extends keyof Base
      ? Merge<Base[Key], Override[Key]>
      : Override[Key];
  }
>;

/**
 * Resolves the final options using the following precedence:
 *
 * `Fixed` → `Options` → `Defaults`
 *
 * When both sides contain an object, their properties are merged
 * recursively rather than replacing the entire object.
 */
export type ResolvedErrorOptions<
  Fixed extends ErrorOptions,
  Defaults extends ErrorOptions,
  Options extends ErrorOptions,
> = Merge<Merge<Defaults, Options>, Fixed>;
