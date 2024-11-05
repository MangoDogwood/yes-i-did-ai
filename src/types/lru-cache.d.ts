declare module 'lru-cache' {
    namespace LRU {
      interface Options<K = any, V = any> {
        max?: number;
        maxAge?: number;
        length?: (value: V, key: K) => number;
        dispose?: (key: K, value: V) => void;
        stale?: boolean;
        maxSize?: number;
        sizeCalculation?: (value: V, key: K) => number;
        ttl?: number;
        updateAgeOnGet?: boolean;
        updateAgeOnHas?: boolean;
        allowStale?: boolean;
        noDisposeOnSet?: boolean;
      }
    }
  
    class LRU<K = any, V = any> {
      constructor(options?: number | LRU.Options<K, V>);
      set(key: K, value: V, maxAge?: number): boolean;
      get(key: K): V | undefined;
      peek(key: K): V | undefined;
      has(key: K): boolean;
      delete(key: K): boolean;
      clear(): void;
      reset(): void;
      keys(): K[];
      values(): V[];
      length: number;
      itemCount: number;
      dump(): Array<{ k: K; v: V; e?: number }>;
      load(cacheEntries: Array<{ k: K; v: V; e?: number }>): void;
      prune(): void;
    }
  
    export = LRU;
  }