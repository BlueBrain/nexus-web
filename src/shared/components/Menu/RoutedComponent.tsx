import * as React from 'react';
import './routed-component.less';
import { useTransition, animated } from 'react-spring';
import useMeasure from '../hooks/useMeasure';

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
  const [bind, bounds] = useMeasure();

  const pages = routes.map(
    route => ({ style, reference }: { style: any; reference: any }) => (
      <animated.div ref={reference} style={style}>
        {route.component(currentRoute, setCurrentRoute)}
      </animated.div>
    )
  );

  const routeIndexToShow = routes.findIndex(
    ({ path }) => path === currentRoute
  );

  const transitions = useTransition(routeIndexToShow, r => r, {
    from: {
      position: 'absolute',
      opacity: 0,
      transform: 'translate3d(100%,0,0)',
    },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  });
  return (
    <div className="routed-component">
      <div
        className="route-container"
        style={bounds && { height: bounds.height }}
      >
        {transitions.map(({ item, props, key }) => {
          const Page = pages[item];
          return (
            <Page
              reference={bind && bind.ref}
              key={key}
              style={{ ...props, width: '100%' }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RoutedComponent;
