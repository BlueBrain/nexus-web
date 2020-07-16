import { RouteProps } from 'react-router';
import Admin from './admin';

export type SubAppObject = {
  title: string;
  namespace: string;
  routes: RouteProps[];
  icon?: string;
};

export type SubApp = () => SubAppObject;

const SubApps: Map<string, SubApp> = new Map();
SubApps.set('Admin', Admin);

export default SubApps;
