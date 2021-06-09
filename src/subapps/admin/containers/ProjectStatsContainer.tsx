import * as React from 'react';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';

const ProjectStatsContainer: React.FC<{}> = () => {
  // load some data here from somewhere

  return (
    <div style={{ display: 'flex' }}>
      <ProjectGraph />
      <ResourceInfoPanel />
    </div>
  );
};

export default ProjectStatsContainer;
