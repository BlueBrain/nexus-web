import * as React from 'react';
import { Button, Divider } from 'antd';
import SideMenu from '../Workspace/SideMenu';
import RecentlyVisited from '../RecentlyVisited';
import { Project } from '@bbp/nexus-sdk-legacy';
import RoutedComponent from '../Menu/RoutedComponent';

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
            <div>
              Home <a onClick={() => goTo('/about')}>About</a>
              <RecentlyVisited visitProject={goToProject} />
            </div>
          ),
        },
        {
          path: '/about',
          component: (path, goTo) => (
            <div>
              About <a onClick={() => goTo('/')}>Home</a>
            </div>
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
  // setTackMenu(): boolean;
}

const NavigationMenuContainer: React.FunctionComponent<MenuProps> = props => {
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
        <NavMenu goToProject={goToProject} />
      </SideMenu>
    </>
  );
};

export default NavigationMenuContainer;
