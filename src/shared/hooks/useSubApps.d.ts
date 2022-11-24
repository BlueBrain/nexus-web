declare const useSubApps: () => {
  subAppProps: {
    label: string;
    key: string;
    subAppType: string;
    url: string | undefined;
    route: string;
    icon: string | undefined;
    requireLogin: boolean | undefined;
    description: string | undefined;
    version: string | undefined;
  }[];
  subAppRoutes: any[];
  subAppError: Error | undefined;
};
export default useSubApps;
