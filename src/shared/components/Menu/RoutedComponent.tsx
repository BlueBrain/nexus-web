import * as React from 'react';
import './routed-component.less';
import { matchPath } from 'react-router';

export interface Route {
  path: string;
  component: (
    path: string,
    goTo: (path: string) => void,
    urlParams: {
      [urlPathParam: string]: any;
    }
  ) => React.ReactNode;
}

interface RoutedComponentProps {
  routes: Route[];
  notFound?: React.ReactNode;
}

const RoutedComponent: React.FunctionComponent<RoutedComponentProps> = ({
  routes,
  notFound,
}) => {
  const [currentLocation, setCurrentLocation] = React.useState('/');

  const matchedRoute = routes
    .map(route => {
      const match = matchPath(currentLocation, {
        path: route.path,
        strict: true,
        exact: true,
      });
      return (
        !!match && {
          route,
          match,
        }
      );
    })
    .find(match => !!match);

  const Page = matchedRoute
    ? matchedRoute.route.component(
        currentLocation,
        setCurrentLocation,
        matchedRoute.match.params
      )
    : notFound;

  return (
    <div className="routed-component">
      <div className="route-container">{Page}</div>
    </div>
  );
};

export default RoutedComponent;
