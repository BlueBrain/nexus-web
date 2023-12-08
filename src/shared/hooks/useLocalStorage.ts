import * as React from 'react';

export default function useLocalStorage<T = any>(
  key: string,
  defaultValue?: T
) {
  const val = localStorage.getItem(key);
  const [value, setValue] = React.useState<T | undefined>(
    val ? JSON.parse(val) : defaultValue
  );

  React.useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as [
    T | undefined,
    React.Dispatch<React.SetStateAction<T | undefined>>
  ];
}
