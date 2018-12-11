import * as React from 'react';
import { matchPath } from 'react-router';
import { Breadcrumb } from './Breadcrumb';
import { RouteWithData } from '../../routes';

const DEFAULT_MATCH_OPTIONS = { exact: true };

/**
 *  Attempts to match the routes and find a breadcrumb
 *  to return from the routes list.
 *  if no path is found it returns false
 * @param routes
 * @param pathSection
 * @param state
 * @returns {Breadcrumb | false}
 */
const maybeMatchRouteBreadcrumbWithPath = (
  routes: RouteWithData[],
  pathSection: string,
  state: any
): Breadcrumb | boolean => {
  const match = routes.find(
    (matchOptions: RouteWithData) =>
      !!matchPath(pathSection, {
        ...(matchOptions || DEFAULT_MATCH_OPTIONS),
        path: matchOptions.path,
      })
  );

  if (match) {
    let label = pathSection;
    if (match.breadcrumbLabel) {
      label = match.breadcrumbLabel(state);
    }
    return {
      component: <div className="breadcrumb-label">{label}</div>,
      path: pathSection,
    };
  }
  return false;
};

export interface GetBreadcrumbProps {
  state: any;
  location: any;
  routes: RouteWithData[];
}

/**
 * Gets a list of Breadcumbs (components and paths) from the routes
 * It also requries state as a parameter so that componenents that
 * rely on that can make use of it (see ./BreadcrumbLabels.tsx)
 * @param location (current router location)
 * @param routes RoutesWithData[]
 * @param state
 * @returns {Breadcrumbs[]}
 */
const getBreadcrumbs = ({
  location,
  routes,
  state,
}: GetBreadcrumbProps): Breadcrumb[] => {
  const { pathname } = location;

  const matches: Breadcrumb[] = [];

  // First need to check if there is a default path for the "home page"
  const homeMatch = maybeMatchRouteBreadcrumbWithPath(routes, '/', state);
  if (!!homeMatch) {
    matches.push(homeMatch as Breadcrumb);
  }

  // Now that we've found the home breadcrumb, we can continue using this method
  // to iterate through the pathsections as defined as between /'s
  pathname
    .replace(/\/$/, '')
    .split('/')
    .reduce((previous: any, current: any) => {
      const pathSection = `${previous}/${current}`;
      const matchingBreadcrumb = maybeMatchRouteBreadcrumbWithPath(
        routes,
        pathSection,
        state
      );
      if (matchingBreadcrumb) {
        matches.push(matchingBreadcrumb as Breadcrumb);
      }
      return pathSection;
    });
  return matches;
};

export default getBreadcrumbs;
