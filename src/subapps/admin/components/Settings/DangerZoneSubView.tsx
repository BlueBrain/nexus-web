import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';

import useNotification, { NexusError, } from '../../../../shared/hooks/useNotification';
import { makeOrganizationUri } from '../../../../shared/utils';
import { RootState } from '../../../../shared/store/reducers';
import './SettingsView.less';

type Props = {
  project: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    mode: string;
  };
};

const DangerZoneSubView = ({ project }: Props) => {
  const notification = useNotification();
  const { user } = useSelector((state: RootState) => state.oidc);
  const nexus = useNexusContext();
  const history = useHistory();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const [depValue, setDepValue] = useState('');
  const [openDepModal, setOpenDepModal] = useState<boolean>(false);
  const handleCloseModal = () => setOpenDepModal(false);
  const handleOpenModal = () => setOpenDepModal(true);
  const handleOnDepProjectValueChange = (e:React.ChangeEvent<HTMLInputElement> ) => setDepValue(e.target.value);
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const [busyDeprecating, setBusyDeprecating] = useState(false);

  const onDeprecate = () => {
    if (!project) {
      return;
    }
    setBusyDeprecating(true);
    nexus.Project.deprecate(orgLabel, projectLabel, project._rev)
      .then(() => {
        history.push(makeOrganizationUri(orgLabel));
        notification.success({ message: 'Project deprecated' });
      })
      .catch((error: NexusError) => {
        notification.error({
          message: 'Error deprecating project',
          description: error.reason,
        });
      })
      .finally(() => {
        setBusyDeprecating(false);
      });
  };
  const deprecateVerification = `${user?.profile.family_name}/${projectLabel}`.toLowerCase();
  const handleDeprecateProject = () => {
    if(depValue.toLowerCase() === deprecateVerification.toLowerCase()){
      alert(`@@value ${depValue}`);
    }
  }
  return (
    <>
      <div className="settings-view settings-danger-zone-view">
        <h2>Danger Zone</h2>
        <div className="settings-view-container">
          {/* <div className="danger-text">
            Delete this Project
            <br />
            Once you delete a project, there is no going back. Please be certain.
            <br />
            Instead deprecating the project can be undone 🙂
          </div> */}
          <div className="danger-actions">
            <Button
              danger
              loading={busyDeprecating}
              style={{ margin: 0, marginRight: 10 }}
              type="primary"
              disabled={false} // TODO: write premission to be enabled
              htmlType="submit"
              onClick={handleOpenModal}
            >
              Deprecate Project
            </Button>
            {/* <Button
              danger
              style={{ margin: 0 }}
              type="primary"
              disabled={false} // TODO: write premission to be enabled
              htmlType="submit"
              className="project-form__add-button"
            >
              Delete Project
            </Button> */}
          </div>
        </div>
      </div>
      <Modal
        visible={openDepModal}
        onCancel={handleCloseModal}
        maskClosable={false}
        footer={[
          <Button type='primary' danger onClick={handleDeprecateProject}>
            I understand the consequences, deprecate this project
          </Button>
        ]}
      >
        <h4>Are you absolutely sure?</h4>
        <p>
          This action cannot be undone. This will permanently deprecate the {deprecateVerification}, 
          Please type {deprecateVerification} to confirm.
        </p>
        <Input value={depValue} onChange={handleOnDepProjectValueChange}/>
      </Modal>
    </>
  );
};

export default DangerZoneSubView;
