import * as React from 'react';

import ProjectHeader from '../components/ProjectHeader';

import './ProjectView.less';

const ProjectView: React.FC = () => {
  // fetch project based on params

  return (
    <div className="project-container">
      <ProjectHeader name="Thalamic microcircuit" />
      <div>Main stuff</div>
    </div>
  );
};

export default ProjectView;
