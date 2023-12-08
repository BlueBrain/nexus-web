import * as React from 'react';

export type AsyncCall<T, E = Error> = {
  loading: boolean;
  data: T | null;
  error: E | null;
};

export default function useAsyncCall<T, E>(
  remoteAction: Promise<T>,
  dependency: any[],
  keepDataOnLoading?: boolean
) {
  const [remoteCall, setRemoteCall] = React.useState<AsyncCall<T, E>>({
    loading: true,
    data: null,
    error: null,
  });

  React.useEffect(() => {
    setRemoteCall({
      loading: true,
      data: (keepDataOnLoading && remoteCall.data) || null,
      error: null,
    });

    remoteAction
      .then((data) => {
        setRemoteCall({
          data,
          error: null,
          loading: false,
        });
      })
      .catch((error) => {
        setRemoteCall({
          error,
          loading: false,
          data: null,
        });
      });
  }, dependency);

  return remoteCall;
}
