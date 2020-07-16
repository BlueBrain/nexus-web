import { RouteProps } from 'react-router';
import Admin from './admin';

export type SubAppObject = {
  title: string;
  namespace: string;
  routes: RouteProps[];
  icon?: string;
};

export type SubApp = () => SubAppObject;

const SubApps: {
  [subAppKey: string]: SubApp;
} = {
  Admin,
};

export default SubApps;
