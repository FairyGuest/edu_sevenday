/** Small, short-lived cache for read-only page data. Invalidating also detaches in-flight reads. */
export function createReadCache(limit = 64, ttl = 15000) {
  const entries = new Map<string, { promise: Promise<any>; expires: number }>();
  return {
    clear: () => entries.clear(),
    get(key: string, load: () => Promise<any>): Promise<any> {
      const cached = entries.get(key);
      if (cached && cached.expires > Date.now()) {
        entries.delete(key);
        entries.set(key, cached);
        return cached.promise;
      }
      const entry = { promise: null as unknown as Promise<any>, expires: Infinity };
      entry.promise = Promise.resolve().then(load).then((result) => {
        if (entries.get(key) === entry) {
          if (result?.code === 200) entry.expires = Date.now() + ttl;
          else entries.delete(key);
        }
        return result;
      }, (error) => {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      });
      entries.set(key, entry);
      if (entries.size > limit) entries.delete(entries.keys().next().value!);
      return entry.promise;
    },
  };
}
