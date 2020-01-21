import * as React from 'react';

export default function useLocalStorage<T = any>(key: string) {
  const [value, setValue] = React.useState<T | undefined>();

  React.useEffect(() => {
    const val = localStorage.getItem(key);
    setValue(!!val && JSON.parse(val));
    console.log({ key, value, val });
  }, []);

  const setLocalStorage = (value: T | undefined) => {
    if (typeof value === undefined) {
      localStorage.removeItem(key);
      setValue(undefined);
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
