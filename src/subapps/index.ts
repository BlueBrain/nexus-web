import { RouteProps } from 'react-router';
import Admin from './admin';

export type SubApp = () => {
  title: string;
  namespace: string;
  routes: RouteProps[];
};

const SubApps: {
  [subAppKey: string]: SubApp;
} = {
  Admin,
};

export default SubApps;
