import * as React from 'react';
import './routed-component.less';
// @ts-ignore
import * as makeRoute from 'path-match';

interface Route {
  path: string;
  component: (
    path: string,
    goTo: (path: string) => void,
    params: any
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
  const [currentRoute, setCurrentRoute] = React.useState('/');

  const match = makeRoute();

  const matchRoute = (path: string) => match(path)(currentRoute);

  const matchedRoute = routes.find(({ path }) => {
    return !!matchRoute(path);
  });

  const Page = matchedRoute
    ? matchedRoute.component(
        currentRoute,
        setCurrentRoute,
        matchRoute(matchedRoute.path)
      )
    : notFound;

  return (
    <div className="routed-component">
      <div className="route-container">{Page}</div>
    </div>
  );
};

export default RoutedComponent;
