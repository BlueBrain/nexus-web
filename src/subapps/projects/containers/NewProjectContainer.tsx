import * as React from 'react';
import { Modal } from 'antd';

import ProjectForm from '../components/ProjectForm';

import ActionButton from '../components/ActionButton';

const NewProjectContainer: React.FC<{}> = () => {
  const [showForm, setShowForm] = React.useState(false);

  const onClickAddProject = () => {
    setShowForm(true);
  };

  const submitProject = () => {
    // create new nexus resource
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      <ActionButton
        title="Create new project"
        onClick={onClickAddProject}
        icon="add"
      />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={handleCancel}
        width={1000}
        destroyOnClose={true}
      >
        <ProjectForm onClickCancel={handleCancel} />
      </Modal>
    </div>
  );
};

export default NewProjectContainer;
