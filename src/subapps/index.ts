import { RouteProps } from 'react-router';
import Admin from './admin';
import StudioLegacy from './studioLegacy';
import Projects from './projects';
import Search from './search';

export type SubAppObject = {
  title: string;
  namespace: string;
  routes: RouteProps[];
  icon?: string;
};

export type SubApp = () => SubAppObject;

const SubApps: Map<string, SubApp> = new Map();

SubApps.set('Admin', Admin);
SubApps.set('StudioLegacy', StudioLegacy);
SubApps.set('Projects', Projects);
SubApps.set('Search', Search);

export default SubApps;
