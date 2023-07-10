const { rest } = require('msw');
fetch = require('node-fetch');
window.fetch = fetch;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('resize-observer-polyfill', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock('lru-cache', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return ({
        fetch: jest.fn(),
        clear: jest.fn(),
      })
    })
  }
});