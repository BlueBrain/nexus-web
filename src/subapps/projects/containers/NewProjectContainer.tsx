import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';
import { displayError } from '../components/Notifications';
import { userOrgLabel } from '../utils';
import { WORKFLOW_STEP_CONTEXT, FUSION_TABLE_CONTEXT } from '../fusionContext';

const NewProjectContainer: React.FC<{
  onSuccess: () => void;
}> = ({ onSuccess }) => {
  const nexus = useNexusContext();
  const userName = useSelector(
    (state: RootState) => state.oidc.user?.profile.preferred_username
  );

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const identities = useSelector((state: RootState) => state.auth.identities);

  const authenticatedIdentity = identities?.data?.identities.find(i => {
    return i['@type'] === 'Authenticated';
  });

  const userOrg = userOrgLabel(authenticatedIdentity?.realm, userName);

  const onClickAddProject = () => {
    setShowForm(true);
  };

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);

    const { name, description, type, visibility } = data;

    const createOrganization = () =>
      nexus.Organization.create(userOrg, {
        description: 'Personal projects storage',
      })
        .then(() => {
          createProject();
        })
        .catch(error => {
          displayError(error, 'An error occurred');
          setShowForm(false);
          setBusy(false);
        });

    const createWorkflowStepContext = () => {
      nexus.Resource.create(userOrg, name, {
        ...WORKFLOW_STEP_CONTEXT,
      })
        .then(() => {})
        .catch(error =>
          displayError(error, 'Failed to create Workflow Step Context')
        );
    };

    const createTableContext = () => {
      nexus.Resource.create(userOrg, name, {
        ...FUSION_TABLE_CONTEXT,
      })
        .then(() => {})
        .catch(error =>
          displayError(error, 'Failed to create Workflow Step Context')
        );
    };

    const createProject = () =>
      nexus.Project.create(userOrg, name, {
        description,
        apiMappings: fusionConfig.defaultAPIMappings,
      })
        .then(() => {
          createResource();
          createWorkflowStepContext();
          createTableContext();
          if (type === 'personal' && visibility === 'public') {
            makeProjectPublic(userOrg, name);
          }
        })
        .catch(error => {
          if (error['@type'] === 'OrganizationNotFound') {
            createOrganization();
          } else {
            displayError(error, 'An error occurred');
            setShowForm(false);
            setBusy(false);
          }
        });

    const createResource = () =>
      nexus.Resource.create(userOrg, name, {
        '@type': fusionConfig.fusionProjectTypes,
        ...data,
      })
        .then(() => {
          notification.success({
            message: `Project ${name} created successfully`,
          });
          setShowForm(false);
          setBusy(false);
          onSuccess();
        })
        .catch(error => {
          displayError(error, 'An error occurred');
          setShowForm(false);
          setBusy(false);
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
      <AccessControl permissions={['organizations/create']} path="/">
        <ActionButton
          title="Create new project"
          onClick={onClickAddProject}
          icon="add"
        />
      </AccessControl>
      <Modal
        visible={showForm}
        footer={null}
        onCancel={handleCancel}
        width={600}
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
