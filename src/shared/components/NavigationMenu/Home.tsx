import * as React from 'react';
import RecentlyVisited from '../RecentlyVisited';
import { Project } from '@bbp/nexus-sdk-legacy';

export interface NavMenuPageProps {
  path: string;
  goTo: (path: string) => void;
}

interface NavMenuHomeProps extends NavMenuPageProps {
  goToProject(Project: Project): void;
}

export const NavMenuHome: React.FunctionComponent<NavMenuHomeProps> = props => {
  const { path, goTo, goToProject } = props;
  return (
    <div>
      <h3>
        <a onClick={() => goTo('/selectOrg')}>Select an Organziation</a>
      </h3>
      <RecentlyVisited visitProject={goToProject} />
    </div>
  );
};

export default NavMenuHome;
