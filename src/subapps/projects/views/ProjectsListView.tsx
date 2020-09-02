import * as React from 'react';

import ProjectCard from '../components/ProjectCard';
import NewProjectContainer from '../containers/NewProjectContainer';

const ProjectsListView: React.FC<{}> = () => {
  return (
    <div className="view-container projects-subapp-container">
      <div>
        <h1>Projects</h1>
        <NewProjectContainer />
        {/* This is just an example */}
        {/* <ProjectCard
          name="COVID-19"
          description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod"
          activitiesNumber={9}
          collaboratorsNumber={5}
          status="In progress"
        /> */}
      </div>
    </div>
  );
};

export default ProjectsListView;
