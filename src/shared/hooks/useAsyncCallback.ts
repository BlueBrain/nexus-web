import * as React from 'react';

const useAsyncCallback = <C extends (...args: any) => any, T, E = Error>(
  asyncCall: (...args: Parameters<C>) => Promise<T>,
  dependecy: any[]
) => {
  const [{ loading, data, error }, setData] = React.useState<{
    loading: boolean;
    data: T | null;
    error: E | null;
  }>({
    loading: false,
    data: null,
    error: null,
  });

  const callback = React.useMemo(() => {
    const callback = function(...args: Parameters<C>) {
      setData({
        data: null,
        error: null,
        loading: true,
      });
      asyncCall(...args)
        .then((data) => {
          setData({
            data,
            error: null,
            loading: false,
          });
        })
        .catch((error) => {
          setData({
            error,
            data: null,
            loading: false,
          });
        });
    };
    return callback;
  }, dependecy);

  return [
    {
      loading,
      data,
      error,
    },
    callback,
  ] as [
    {
      loading: boolean;
      data: T | null;
      error: E | null;
    },
    (...args: Parameters<C>) => void
  ];
};

export default useAsyncCallback;
