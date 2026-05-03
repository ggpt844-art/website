/** Shallow-aware merge: objects recurse, arrays and primitives replace. */
export function mergeDeep<T>(base: T, patch: Partial<T> | undefined): T {
  if (patch === undefined) return base;
  if (Array.isArray(patch)) return patch as unknown as T;
  if (patch === null || typeof patch !== "object") return patch as T;
  if (base === null || typeof base !== "object" || Array.isArray(base)) return patch as T;
  const out = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch as object)) {
    const pk = (patch as Record<string, unknown>)[key];
    if (pk === undefined) continue;
    const bk = (base as Record<string, unknown>)[key];
    out[key] = mergeDeep(bk, pk as Partial<unknown>);
  }
  return out as T;
}
