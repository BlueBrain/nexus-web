import React, { RefObject, useEffect, useRef } from 'react';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

// // MediaQueryList Event based useEventListener interface
// function useEventListener<K extends keyof MediaQueryListEventMap>(
//   eventName: K,
//   handler: (event: MediaQueryListEventMap[K]) => void,
//   element: RefObject<MediaQueryList>,
//   options?: boolean | AddEventListenerOptions,
// ): void

// // Window Event based useEventListener interface
// function useEventListener<K extends keyof WindowEventMap>(
//   eventName: K,
//   handler: (event: WindowEventMap[K]) => void,
//   element?: undefined,
//   options?: boolean | AddEventListenerOptions,
// ): void

// // Element Event based useEventListener interface
// function useEventListener<
//   K extends keyof HTMLElementEventMap,
//   T extends HTMLElement = HTMLDivElement,
// >(
//   eventName: K,
//   handler: (event: HTMLElementEventMap[K]) => void,
//   element: RefObject<T>,
//   options?: boolean | AddEventListenerOptions,
// ): void

// // Document Event based useEventListener interface
// function useEventListener<K extends keyof DocumentEventMap>(
//   eventName: K,
//   handler: (event: DocumentEventMap[K]) => void,
//   element: RefObject<Document>,
//   options?: boolean | AddEventListenerOptions,
// ): void

function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KM extends keyof MediaQueryListEventMap,
  T extends HTMLElement | MediaQueryList
>(
  eventName: KW | KH | KM,
  handler: (
    event:
      | WindowEventMap[KW]
      | HTMLElementEventMap[KH]
      | MediaQueryListEventMap[KM]
      | Event
      | MouseEvent
  ) => void,
  element?: RefObject<T>,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement: T | Window = element?.current ?? window;

    if (!(targetElement && targetElement.addEventListener)) return;
    const listener: typeof handler = event => savedHandler.current(event);

    targetElement.addEventListener(eventName, listener, options);
    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

export default useEventListener;
