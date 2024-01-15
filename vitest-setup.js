import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

window.fetch = fetch;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const { getComputedStyle } = window;
window.getComputedStyle = elt => getComputedStyle(elt);

vi.mock('resize-observer-polyfill', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('lru-cache', () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => {
      return {
        fetch: vi.fn(),
        clear: vi.fn(),
      };
    }),
  };
});
