import * as React from 'react';
export default function useLocalStorage<T = any>(
  key: string,
  defaultValue?: T
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
