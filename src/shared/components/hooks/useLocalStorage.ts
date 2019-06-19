import * as React from 'react';

const useLocalStorage = (key: string) => {
  const [value, setValue] = React.useState<any>({});
  React.useEffect(() => {
    if (localStorage) {
      setValue(JSON.parse(localStorage.getItem(key) || '{}'));
      return;
    }
    console.warn('no localStorage found');
  }, []);
  const setLocalStorageValue = (value: any) => {
    if (localStorage) {
      return localStorage.setItem(key, JSON.stringify(value));
    }
    console.warn('no localStorage found');
  };
  return [value, setLocalStorageValue];
};

export default useLocalStorage;
