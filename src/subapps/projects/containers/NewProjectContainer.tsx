import * as React from 'react';

import ActionButton from '../components/ActionButton';

const NewProjectContainer = () => {
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

export default NewProjectContainer;
