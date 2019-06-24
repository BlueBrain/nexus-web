import * as React from 'react';
import SideMenu from '../Workspace/SideMenu';
import RoutedComponent from '../Menu/RoutedComponent';
import NavMenuHome from './Home';
import NavMenuOrgsContainer from './SelectOrg';
import NavMenuProjectsContainer from './SelectProject';
import './nav-menu.less';

interface NavMenuProps {
  goToProject(orgLabel: string, projectLabel: string): void;
  activateOrg(orgLabel: string): void;
}

export const NavMenu: React.FunctionComponent<NavMenuProps> = props => {
  const { goToProject, activateOrg } = props;
  return (
    <RoutedComponent
      routes={[
        {
          path: '/',
          component: (path, goTo) => {
            return <NavMenuHome {...{ path, goTo, goToProject }} />;
          },
        },
        {
          path: '/selectOrg',
          component: (path, goTo) => {
            return <NavMenuOrgsContainer {...{ path, goTo, activateOrg }} />;
          },
        },
        {
          path: '/selectProject/:orgLabel',
          component: (path, goTo, params) => {
            const { orgLabel } = params;
            return (
              <NavMenuProjectsContainer
                {...{
                  path,
                  goTo,
                  activateOrg,
                  goToProject,
                  orgLabel,
                }}
              />
            );
          },
        },
      ]}
    />
  );
};

interface MenuProps {
  render: (
    visible: boolean,
    toggleVisibility: () => void
  ) => React.ReactElement<any>;
  goToProject(orgLabel: string, projectLabel: string): void;
  activateOrg(orgLabel: string): void;
  defaultVisibility?: boolean;
}

const NavigationMenuComponent: React.FunctionComponent<MenuProps> = props => {
  const { goToProject, activateOrg, render, defaultVisibility } = props;

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
        animations={{
          from: () => ({ left: -300, opacity: 0 }),
          leave: () => ({ left: -300, opacity: 0 }),
          enter: () => ({ left: 0, opacity: 1 }),
        }}
      >
        <div className="nav-menu">
          <NavMenu {...{ goToProject, activateOrg }} />
        </div>
      </SideMenu>
    </>
  );
};

export default NavigationMenuComponent;
