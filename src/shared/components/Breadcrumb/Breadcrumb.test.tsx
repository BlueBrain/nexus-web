import React = require('react');
import { mount } from 'enzyme';
import getBreadcrumbs from './getBreadcrumbs';
import { RouteWithData } from '../../routes';
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: () => <div>home</div>,
    breadcrumbLabel: () => <span>home</span>,
  },
  {
    path: '/login',
    component: () => <div>login</div>,
  },
  {
    path: '/:org',
    exact: true,
    component: () => <div>Org</div>,
    breadcrumbLabel: () => <span>org</span>,
  },
  {
    path: '/:org/:project',
    exact: true,
    component: () => <div>home</div>,
    breadcrumbLabel: () => <span>project</span>,
  },
];

describe('Breadcrumbs', () => {
  describe('getBreadcrumbs()', () => {
    it('should return a breadcrumb with home', () => {
      const location = {
        pathname: '/',
      };
      const state = {};
      const breadcrumbs = getBreadcrumbs({ routes, location, state });

      expect(breadcrumbs).toMatchSnapshot();
    });

    it('should result in two breadcrumbs, one for org and one for home', () => {
      const location = {
        pathname: '/someOrg',
      };
      const state = {};
      const breadcrumbs = getBreadcrumbs({ routes, location, state });

      expect(breadcrumbs).toMatchSnapshot();
    });

    it('should three breadcrumbs, one for org and one for home, as well as a project', () => {
      const location = {
        pathname: '/someOrg/someProject',
      };
      const state = {};
      const breadcrumbs = getBreadcrumbs({ routes, location, state });

      expect(breadcrumbs).toMatchSnapshot();
    });

    it('should three breadcrumbs, one for org and one for home, as well as a project, even with a dangling slash', () => {
      const location = {
        pathname: '/someOrg/someProject/',
      };
      const state = {};
      const breadcrumbs = getBreadcrumbs({ routes, location, state });

      expect(breadcrumbs).toMatchSnapshot();
    });
  });
});
