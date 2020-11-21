import * as React from 'react';

export type AsyncCall<T> = {
  loading: boolean;
  data: T | null;
  error: Error | null;
};

export default function useAsyncCall<T>(
  remoteAction: () => Promise<T>,
  dependency: any[]
) {
  const [remoteCall, setRemoteCall] = React.useState<AsyncCall<T>>({
    loading: true,
    data: null,
    error: null,
  });

  React.useEffect(() => {
    setRemoteCall({
      loading: true,
      data: null,
      error: null,
    });
    remoteAction()
      .then(data => {
        setRemoteCall({
          data,
          error: null,
          loading: false,
        });
      })
      .catch(error => {
        setRemoteCall({
          error,
          loading: false,
          data: null,
        });
      });
  }, dependency);

  return remoteCall;
}
