import * as React from 'react';
import RecentlyVisited from '../RecentlyVisited';
import './nav-menu.less';
import { Icon, Divider } from 'antd';

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
      <h3 className="title">
        <a onClick={() => goTo('/selectOrg')}>
          <Icon type="project" /> Select a Project
        </a>
      </h3>
      <Divider />
      <RecentlyVisited visitProject={goToProject} />
    </div>
  );
};

export default NavMenuHome;
