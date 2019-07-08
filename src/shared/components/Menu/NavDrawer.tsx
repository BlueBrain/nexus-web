import * as React from 'react';
import RoutedComponent, { Route } from './RoutedComponent';
import SideMenu from './SideMenu';
import './NavDrawer.less';

interface NavDrawerComponentProps {
  render: (
    visible: boolean,
    toggleVisibility: () => void
  ) => React.ReactElement<any>;
  routes: Route[];
  defaultVisibility?: boolean;
}

export const NavDrawer: React.FunctionComponent<
  NavDrawerComponentProps
> = props => {
  const { render, defaultVisibility, routes } = props;

  const [visible, setVisible] = React.useState(
    typeof defaultVisibility !== 'undefined' ? defaultVisibility : true
  );

  const toggleVisibility = () => {
    setVisible(!visible);
  };
  const renderable = render(visible, toggleVisibility);

  return (
    <>
      {renderable}
      <SideMenu
        title={'Projects'}
        visible={visible}
        onClose={() => setVisible(false)}
        side={'left'}
      >
        <div className="nav-drawer">
          <RoutedComponent routes={routes} />
        </div>
      </SideMenu>
    </>
  );
};

export default NavDrawer;
