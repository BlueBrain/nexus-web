import * as React from 'react';
import { Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import ProjectForm from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';

const NewProjectContainer: React.FC<{}> = () => {
  const nexus = useNexusContext();
  const [showForm, setShowForm] = React.useState(false);

  const onClickAddProject = () => {
    setShowForm(true);
  };

  const submitProject = (data: any) => {
    console.log('data submitted', data);
    // create new nexus resource

    // nexus.Resource.create(orgLabel, projectLabel, data, schemaId);
    setShowForm(false);
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
        <ProjectForm onClickCancel={handleCancel} onSubmit={submitProject} />
      </Modal>
    </div>
  );
};

export default NewProjectContainer;
