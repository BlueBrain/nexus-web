import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';

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
      duration: 3,
    });
  };

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);
    const userOrgLabel = `fusion-${userName}`;
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
        '@type': fusionConfig.fusionProjectTypes,
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

  if (!userName) return null;

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
