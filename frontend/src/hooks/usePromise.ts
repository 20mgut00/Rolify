import { use } from 'react';

/**
 * React 19's use() hook demo - unwraps promises directly in render
 * This is useful for reading promises without useEffect/useState boilerplate
 *
 * Example usage:
 * ```tsx
 * function Component() {
 *   const data = usePromise(fetchData());
 *   return <div>{data}</div>;
 * }
 * ```
 *
 * Note: The component must be wrapped in Suspense boundary
 */
export function usePromise<T>(promise: Promise<T>): T {
  return use(promise);
}

/**
 * Cache for storing promise results
 * Prevents creating new promises on every render
 */
const promiseCache = new Map<string, Promise<any>>();

/**
 * Create a cached promise that won't be recreated on re-renders
 */
export function createCachedPromise<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  if (!promiseCache.has(key)) {
    promiseCache.set(key, factory());
  }
  return promiseCache.get(key)!;
}

/**
 * Clear a cached promise
 */
export function clearCachedPromise(key: string): void {
  promiseCache.delete(key);
}

/**
 * Clear all cached promises
 */
export function clearAllCachedPromises(): void {
  promiseCache.clear();
}
