export declare type AsyncCall<T, E = Error> = {
  loading: boolean;
  data: T | null;
  error: E | null;
};
export default function useAsyncCall<T, E>(
  remoteAction: Promise<T>,
  dependency: any[],
  keepDataOnLoading?: boolean
): AsyncCall<T, E>;
