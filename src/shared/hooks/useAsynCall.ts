import * as React from 'react';

const useAsyncCall = <T, E = Error>(
  asyncCall: Promise<T>,
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

  React.useEffect(() => {
    setData({
      data: null,
      error: null,
      loading: true,
    });
    asyncCall
      .then(data => {
        setData({
          data,
          error: null,
          loading: false,
        });
      })
      .catch(error => {
        setData({
          error,
          data: null,
          loading: false,
        });
      });
  }, dependecy);

  return {
    loading,
    data,
    error,
  };
};

export default useAsyncCall;
