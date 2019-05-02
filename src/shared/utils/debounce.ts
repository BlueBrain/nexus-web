/**
 * A function that emits a side effect and does not return anything.
 * @author https://github.com/chodorowicz
 * @repo https://github.com/chodorowicz/ts-debounce
 */
export type Procedure = (...args: any[]) => void;

export type DebounceOptions = {
  isImmediate: boolean;
};

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: DebounceOptions = {
    isImmediate: false,
  }
): F {
  let timeoutId: NodeJS.Timeout | undefined;

  return function(this: any, ...args: any[]) {
    const doLater = () => {
      timeoutId = undefined;
      if (!options.isImmediate) {
        func.apply(this, args);
      }
    };

    const shouldCallNow = options.isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(this, args);
    }
  } as any;
}
