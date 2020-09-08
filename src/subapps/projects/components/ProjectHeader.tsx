import * as React from 'react';
import ActioButton from '../components/ActionButton';
import NewActivityContainer from '../containers/NewActivityContainer';

import './ProjectHeader.less';

const ProjectHeader: React.FC<{
  children?: React.ReactChild;
  orgLabel?: string;
  projectLabel?: string;
}> = ({ children, projectLabel, orgLabel }) => {
  return (
    <div className="project-header">
      <span className="project-header__name">{projectLabel}</span>
      <div className="project-header__actions">
        <div className="project-header__buttons">
          {orgLabel && projectLabel && (
            <NewActivityContainer
              projectLabel={projectLabel}
              orgLabel={orgLabel}
            />
          )}
          <ActioButton
            icon="Add"
            onClick={() => {}}
            title="Add activities from template"
          />
        </div>
        {children}
      </div>
    </div>
  );
};

export default ProjectHeader;
