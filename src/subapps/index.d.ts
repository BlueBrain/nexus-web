import { RouteProps } from 'react-router';
export declare type SubAppObject = {
  subAppType: string;
  title: string;
  namespace: string;
  routes: RouteProps[];
  icon?: string;
  url?: string;
  requireLogin?: boolean;
  description?: string;
  version?: string;
};
export declare type SubApp = () => SubAppObject;
declare const SubApps: Map<string, SubApp>;
export default SubApps;
