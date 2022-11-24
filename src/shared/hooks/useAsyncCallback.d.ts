declare const useAsyncCallback: <C extends (...args: any) => any, T, E = Error>(
  asyncCall: (...args: Parameters<C>) => Promise<T>,
  dependecy: any[]
) => [
  {
    loading: boolean;
    data: T | null;
    error: E | null;
  },
  (...args: Parameters<C>) => void
];
export default useAsyncCallback;
