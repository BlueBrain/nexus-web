import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';
import { displayError } from '../components/Notifications';

const NewProjectContainer: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const userName = useSelector(
    (state: RootState) => state.oidc.user?.profile.preferred_username
  );

  const identities = useSelector((state: RootState) => state.auth.identities);
  const authenticatedIdentity = identities?.data?.identities.find(i => {
    return i['@type'] === 'Authenticated';
  });

  const onClickAddProject = () => {
    setShowForm(true);
  };

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);
    const userOrgLabel = `${fusionConfig.personalOrgPrefix}${userName}`;
    const { name, description, type, visibility } = data;
    const createOrganization = () =>
      nexus.Organization.create(userOrgLabel, {
        description: 'Personal projects storage',
      })
        .then(() => {
          createProject();
        })
        .catch(error => {
          displayError(error, 'An error occurred');
          setShowForm(false);
        });

    const createProject = () =>
      nexus.Project.create(userOrgLabel, name, {
        description,
        apiMappings: fusionConfig.defaultAPIMappings,
      })
        .then(() => {
          createResource();
          if (type === 'personal' && visibility === 'public') {
            makeProjectPublic(userOrgLabel, name);
          }
        })
        .catch(error => {
          if (error['@type'] === 'OrganizationNotFound') {
            createOrganization();
          } else {
            displayError(error, 'An error occurred');
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
          displayError(error, 'An error occurred');
          setShowForm(false);
        });

    createProject();
  };

  const makeProjectPublic = async (userOrgLabel: string, name: string) => {
    try {
      const response = await nexus.ACL.append(`${userOrgLabel}/${name}`, 0, {
        acl: [
          {
            permissions: ['resources/read', 'projects/read', 'projects/write'],
            identity: {
              realm: authenticatedIdentity?.realm,
            },
          },
        ],
      });
    } catch (error) {
      displayError(error, 'Failed to make project public');
    }
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
