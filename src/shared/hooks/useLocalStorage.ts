import * as React from 'react';

export default function useLocalStorage<T = any>(key: string) {
  const val = localStorage.getItem(key);
  const [value, setValue] = React.useState<T | undefined>(
    !!val && JSON.parse(val)
  );

  const setLocalStorage = (value: T | undefined) => {
    if (value === undefined) {
      localStorage.removeItem(key);
      setValue(value);
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
  };

  return [value, setLocalStorage] as [
    T | undefined,
    (value: T | undefined) => void
  ];
}
