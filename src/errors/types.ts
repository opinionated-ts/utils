import type { BaseErrorOptions } from "./base";

/**
 * Options accepted by {@link BaseError} and {@link createError}.
 *
 * This is a partial view of {@link BaseErrorOptions}, allowing callers to
 * provide only the properties they want to configure or override.
 */
export type ErrorOptions = Partial<BaseErrorOptions>;

/**
 * Determines whether `T` is a non-array object.
 *
 * Arrays are excluded because they are treated as leaf values by the
 * recursive merge utilities. Non-object values are also excluded.
 *
 * @typeParam T - Type to inspect.
 */
export type IsObject<T> = T extends object ? (T extends readonly unknown[] ? false : true) : false;

/**
 * Flattens an intersection into a regular object type.
 *
 * This is primarily useful for improving the readability of inferred types
 * in editor hovers by materializing the resulting property structure.
 *
 * @typeParam T - Type to simplify.
 */
export type Simplify<T> = {
  [Key in keyof T]: T[Key];
};

/**
 * Recursively flattens an object type while preserving arrays and other
 * non-object values.
 *
 * This is primarily useful for making deeply merged inferred types easier to
 * read in editor hovers.
 *
 * @typeParam T - Type to simplify recursively.
 */
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
 * When `Fixed` is an object, properties existing at both levels are traversed
 * recursively. Properties fixed at a leaf are therefore no longer available
 * as caller-configurable values, while non-fixed descendants remain available.
 *
 * Arrays are treated as leaf values and are returned unchanged.
 *
 * @typeParam Source - Source options from which fixed properties are removed.
 * @typeParam Fixed - Values that are controlled by the factory.
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
 * //       source?: never;
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
 * This check is applied at the current object level. Nested objects are
 * validated through their own recursive mapped types.
 *
 * @typeParam Options - Candidate options supplied by the caller.
 * @typeParam Allowed - Properties that are permitted at this level.
 */
export type Exact<Options, Allowed> = Options &
  Record<Exclude<keyof Options, keyof Allowed>, never>;

/**
 * Recursively merges two types.
 *
 * When both values are objects, their properties are merged recursively.
 * Otherwise, `Override` completely replaces `Base`.
 *
 * @typeParam Base - Base type whose properties provide the initial values.
 * @typeParam Override - Type whose properties override or extend `Base`.
 */
export type Merge<Base, Override> =
  IsObject<Base> extends true
    ? IsObject<Override> extends true
      ? MergeObjects<Extract<Base, object>, Extract<Override, object>>
      : Override
    : Override;

/**
 * Merges two object types while recursively resolving overlapping properties.
 *
 * Properties present only in `Base` are preserved. Properties from `Override`
 * replace matching properties from `Base`, and overlapping object properties
 * are merged recursively.
 *
 * @typeParam Base - Base object type.
 * @typeParam Override - Object type whose properties take precedence.
 */
type MergeObjects<Base extends object, Override extends object> = Simplify<
  Omit<Base, keyof Override> & {
    [Key in keyof Override]: Key extends keyof Base
      ? Merge<Base[Key], Override[Key]>
      : Override[Key];
  }
>;

/**
 * Resolves the final error options by applying the configured precedence.
 *
 * The merge order is:
 *
 * `defaults` → `options` → `fixed`
 *
 * Because `Fixed` is applied last, fixed values take precedence over both
 * defaults and caller-provided options.
 *
 * When corresponding properties are objects, they are merged recursively
 * rather than replacing the entire object.
 *
 * @typeParam Fixed - Values fixed by the generated error factory.
 * @typeParam Defaults - Default values configured for the factory.
 * @typeParam Options - Values supplied by the caller.
 */
export type ResolvedErrorOptions<
  Fixed extends ErrorOptions,
  Defaults extends ErrorOptions,
  Options extends ErrorOptions,
> = Merge<Merge<Defaults, Options>, Fixed>;
