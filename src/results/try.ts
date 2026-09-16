import { error } from "./constructors";
import { normalizeResult } from "./normalize";

export function tryResult<T>(factory: () => T) {
  try {
    return normalizeResult(factory());
  } catch (error_) {
    return error(error_);
  }
}

export async function tryResultAsync<T>(factory: () => Promise<T>) {
  try {
    return normalizeResult(await factory());
  } catch (error_) {
    return error(error_);
  }
}
