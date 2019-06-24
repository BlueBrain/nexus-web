import * as React from 'react';
import RecentlyVisited from '../RecentlyVisited';
import './nav-menu.less';
import { Button, Divider } from 'antd';

export interface NavMenuPageProps {
  path: string;
  goTo: (path: string) => void;
}

interface NavMenuHomeProps extends NavMenuPageProps {
  goToProject(orgLabel: string, projectLabel: string): void;
}

export const NavMenuHome: React.FunctionComponent<NavMenuHomeProps> = props => {
  const { path, goTo, goToProject } = props;
  return (
    <div className="page -home">
      <p>
        Projects are where you can compartmentalize your data and access
        settings
      </p>
      <Button icon="project" onClick={() => goTo('/selectOrg')}>
        Select a Project
      </Button>
      <Divider />
      <RecentlyVisited visitProject={goToProject} />
    </div>
  );
};

export default NavMenuHome;
