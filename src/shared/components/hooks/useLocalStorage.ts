import * as React from 'react';

const useLocalStorage = (key: string) => {
  const [value, setValue] = React.useState<any>({});
  React.useEffect(() => {
    if (localStorage) {
      setValue(JSON.parse(localStorage.getItem(key) || '{}'));
      return;
    }
  }, []);
  const setLocalStorageValue = (value: any) => {
    if (localStorage) {
      return localStorage.setItem(key, JSON.stringify(value));
    }
  };
  return [value, setLocalStorageValue];
};

export default useLocalStorage;
