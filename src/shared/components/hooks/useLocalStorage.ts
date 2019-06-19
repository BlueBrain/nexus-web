import * as React from 'react';

const useLocalStorage = (key: string) => {
  const [value, setValue] = React.useState<any>({});
  React.useEffect(() => {
    setValue(JSON.parse(localStorage.getItem(key) || '{}'));
  }, []);
  const setLocalStorageValue = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };
  return [value, setLocalStorageValue];
};

export default useLocalStorage;
