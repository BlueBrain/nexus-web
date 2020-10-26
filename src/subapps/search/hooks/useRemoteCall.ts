import * as React from 'react';

export default function useRemoteCall<T>(
  remoteAction: () => Promise<T>,
  dependency: any[]
) {
  const [remoteCall, setRemoteCall] = React.useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
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
