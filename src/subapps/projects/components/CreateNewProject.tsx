import * as React from 'react';

import ActionButton from './ActionButton';

const CreateNewProject: React.FC<{}> = () => {
  const onClickAddProject = () => {
    console.log('clicked');
  };

  return (
    <ActionButton
      title="Create new project"
      onClick={onClickAddProject}
      type="add"
    />
  );
};

export default CreateNewProject;
