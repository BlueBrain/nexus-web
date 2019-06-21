import * as React from 'react';
import SideMenu from '../Workspace/SideMenu';
import { Project } from '@bbp/nexus-sdk-legacy';
import RoutedComponent from '../Menu/RoutedComponent';
import NavMenuHome from './Home';
import NavMenuOrgsContainer from './SelectOrg';

interface NavMenuProps {
  goToProject(Project: Project): void;
}

export const NavMenu: React.FunctionComponent<NavMenuProps> = props => {
  const { goToProject } = props;
  return (
    <RoutedComponent
      routes={[
        {
          path: '/',
          component: (path, goTo) => (
            <NavMenuHome {...{ path, goTo, goToProject }} />
          ),
        },
        {
          path: '/selectOrg',
          component: (path, goTo) => (
            <NavMenuOrgsContainer {...{ path, goTo }} />
          ),
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
  goToProject(Project: Project): void;
}

const NavigationMenuComponent: React.FunctionComponent<MenuProps> = props => {
  const { goToProject, render } = props;

  const [visible, setVisible] = React.useState(true);

  const toggleVisibility = () => {
    setVisible(!visible);
  };
  const renderable = render(visible, toggleVisibility);
  return (
    <>
      {renderable}
      <SideMenu
        visible={visible}
        onClose={() => setVisible(false)}
        animations={{
          from: () => ({ left: -300, opacity: 0 }),
          leave: () => ({ left: -300, opacity: 0 }),
          enter: () => ({ left: 0, opacity: 1 }),
        }}
      >
        <NavMenu {...{ goToProject }} />
      </SideMenu>
    </>
  );
};

export default NavigationMenuComponent;
