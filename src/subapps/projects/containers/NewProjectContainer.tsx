import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import ProjectForm from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';

const FUSION_PROJECT_TYPE = ['fusionMetadata', 'fusionProject'];

export type ProjectMetadata = {
  name: string;
  description: string;
  dueDate: string;
  visibility?: string;
  topic?: string;
  hypotheses?: string;
  goals?: string;
  questions?: string;
  type?: string;
};

type NexusError = {
  reason?: string;
  message?: string;
  [key: string]: any;
};

const NewProjectContainer: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const userName = useSelector(
    (state: RootState) => state.oidc.user?.profile.preferred_username
  );

  const onClickAddProject = () => {
    setShowForm(true);
  };

  const showErrorNotification = (error: NexusError) => {
    notification.error({
      message: 'An error occurred',
      description: error.message || error.reason || 'An unknown error occurred',
      duration: 0,
    });
  };

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);
    const userOrgLabel = `fusion2-${userName}`;

    const { name, description } = data;

    const createOrganization = () =>
      nexus.Organization.create(userOrgLabel, {
        description: 'Personal projects storage',
      })
        .then(() => {
          createProject();
        })
        .catch(error => {
          showErrorNotification(error);
          setShowForm(false);
        });

    const createProject = () =>
      nexus.Project.create(userOrgLabel, name, {
        description,
      })
        .then(() => {
          createResource();
        })
        .catch(error => {
          if (error['@type'] === 'OrganizationNotFound') {
            createOrganization();
          } else {
            showErrorNotification(error);
            setShowForm(false);
          }
        });

    const createResource = () =>
      nexus.Resource.create(userOrgLabel, name, {
        '@type': FUSION_PROJECT_TYPE,
        ...data,
      })
        .then(() => {
          notification.success({
            message: `Project ${name} created successfully`,
          });
          setShowForm(false);
        })
        .catch(error => {
          showErrorNotification(error);
          setShowForm(false);
        });

    createProject();
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
        <ProjectForm
          onClickCancel={handleCancel}
          onSubmit={submitProject}
          busy={busy}
        />
      </Modal>
    </div>
  );
};

export default NewProjectContainer;
