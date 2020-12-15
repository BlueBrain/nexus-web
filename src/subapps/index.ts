import { RouteProps } from 'react-router';
import Admin from './admin';
import StudioLegacy from './studioLegacy';
import Workflow from './projects';
import Search from './search';

export type SubAppObject = {
  subAppType: string;
  title: string;
  namespace: string;
  routes: RouteProps[];
  icon?: string;
  url?: string;
  requireLogin?: boolean;
  description?: string;
};

export type SubApp = () => SubAppObject;

const SubApps: Map<string, SubApp> = new Map();

SubApps.set('Admin', Admin);
SubApps.set('StudioLegacy', StudioLegacy);
SubApps.set('Workflow', Workflow);
SubApps.set('Search', Search);

export default SubApps;
