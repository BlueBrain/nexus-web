import * as React from 'react';
import './routed-component.less';

interface Route {
  path: string;
  component: (path: string, goTo: (path: string) => void) => React.ReactNode;
}

interface RoutedComponentProps {
  routes: Route[];
}

const RoutedComponent: React.FunctionComponent<RoutedComponentProps> = ({
  routes,
}) => {
  const [currentRoute, setCurrentRoute] = React.useState('/');

  const pages = routes.map(route =>
    route.component(currentRoute, setCurrentRoute)
  );

  const routeIndexToShow = routes.findIndex(
    ({ path }) => path === currentRoute
  );

  const Page = pages[routeIndexToShow];

  return (
    <div className="routed-component">
      <div className="route-container">{Page}</div>
    </div>
  );
};

export default RoutedComponent;
