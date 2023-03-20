import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';

import { makeOrganizationUri } from '../../../../shared/utils';
import useNotification, {
  NexusError,
} from '../../../../shared/hooks/useNotification';
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
  const nexus = useNexusContext();
  const history = useHistory();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

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
  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Project',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };
  return (
    <div className="settings-view settings-danger-zone-view">
      <h2>Danger Zone</h2>
      <div className="settings-view-container">
        <div className="danger-text">
          Delete this Project
          <br />
          Once you delete a project, there is no going back. Please be certain.
          <br />
          Instead deprecating the project can be undone 🙂
        </div>
        <div className="danger-actions">
          <Button
            danger
            loading={busyDeprecating}
            style={{ margin: 0, marginRight: 10 }}
            type="primary"
            disabled={false} // TODO: write premission to be enabled
            htmlType="submit"
            onClick={confirmDeprecate}
          >
            Deprecate Project
          </Button>
          <Button
            danger
            style={{ margin: 0 }}
            type="primary"
            disabled={false} // TODO: write premission to be enabled
            htmlType="submit"
            className="project-form__add-button"
          >
            Delete Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneSubView;
