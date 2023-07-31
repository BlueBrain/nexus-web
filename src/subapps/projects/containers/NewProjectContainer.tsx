import * as React from 'react';
import { Modal } from 'antd';
import { useNexusContext, AccessControl } from '@bbp/react-nexus';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import ActionButton from '../components/ActionButton';
import { userOrgLabel } from '../utils';
import { createProject } from '../utils/workFlowMetadataUtils';
import useNotification, {
  NexusError,
  parseNexusError,
} from '../../../shared/hooks/useNotification';

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
  const realm = authenticatedIdentity?.realm || undefined;

  const onClickAddProject = () => {
    setShowForm(true);
  };
  const notification = useNotification();

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);

    try {
      createProject(userOrg, data, realm, nexus);
      notification.success({
        message: `Project ${data.name} created successfully`,
      });
      setShowForm(false);
      setBusy(false);
      onSuccess();
    } catch (error) {
      notification.error({
        message: 'An error occurred',
        description: parseNexusError(error as NexusError),
      });
      setShowForm(false);
      setBusy(false);
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
        open={showForm}
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
