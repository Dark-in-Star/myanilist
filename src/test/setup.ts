import "@testing-library/jest-dom/vitest";

// Node's built-in experimental `localStorage` global can shadow jsdom's implementation,
// leaving `window.localStorage` undefined. Provide a minimal in-memory polyfill so tests
// don't depend on that interaction.
if (!window.localStorage) {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(window, "localStorage", { value: memoryStorage, configurable: true });
}

// jsdom doesn't implement these, but Radix's Select uses them for pointer interactions.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom doesn't implement these, but embla-carousel (used for horizontally
// scrollable rows) needs them to initialize.
if (!("IntersectionObserver" in window)) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { value: MockIntersectionObserver, configurable: true });
  Object.defineProperty(globalThis, "IntersectionObserver", { value: MockIntersectionObserver, configurable: true });
}

if (!("ResizeObserver" in window)) {
  class MockResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", { value: MockResizeObserver, configurable: true });
  Object.defineProperty(globalThis, "ResizeObserver", { value: MockResizeObserver, configurable: true });
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
