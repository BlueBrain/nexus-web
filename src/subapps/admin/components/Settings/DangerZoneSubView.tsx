import React, { useState } from 'react';
import { Button, Modal, Input, Form, Row, Col } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { NexusClient } from '@bbp/nexus-sdk';
import { makeOrganizationUri } from '../../../../shared/utils';
import { RootState } from '../../../../shared/store/reducers';
import useNotification from '../../../../shared/hooks/useNotification';
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
const deprecateProject = async ({
  nexus,
  orgLabel,
  projectLabel,
  rev,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.Project.deprecate(orgLabel, projectLabel, rev);
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not deprecate you project', { cause: error });
  }
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
  const handleOnDepProjectValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setDepValue(e.target.value);
  const {
    params: { orgLabel, projectLabel },
  } = match;

  const { mutateAsync: deprecateProjectAsync, status } = useMutation(
    deprecateProject,
    {
      onSuccess: () => {
        history.push(makeOrganizationUri(orgLabel));
        notification.success({ message: 'Project deprecated' });
      },
      onError: error => {
        notification.error({
          message: 'Error deprecating project',
          // @ts-ignore
          description: error.cause.message,
        });
      },
    }
  );
  const deprecateVerification = `${orgLabel}/${projectLabel}`.toLowerCase();
  const handleDeprecateProject = () =>
    deprecateProjectAsync({ nexus, orgLabel, projectLabel, rev: project._rev });
  return (
    <>
      <div className="settings-view settings-danger-zone-view">
        <h2>Danger Zone</h2>
        <div className="settings-view-container">
          <div className="danger-actions">
            <Button
              danger
              style={{ margin: 0, marginRight: 10 }}
              type="primary"
              disabled={false} // TODO: write premission to be enabled
              htmlType="submit"
              onClick={handleOpenModal}
            >
              Deprecate Project
            </Button>
          </div>
        </div>
      </div>
      <Modal
        visible={openDepModal}
        onCancel={handleCloseModal}
        maskClosable={false}
        footer={null}
      >
        <Form onFinish={handleDeprecateProject}>
          <Row>
            <h4>Are you absolutely sure?</h4>
            <p>
              This action cannot be undone. This will permanently deprecate the{' '}
              {deprecateVerification}.
              <br />
              Please type <strong>{deprecateVerification}</strong> to confirm.
            </p>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="projectName"
                rules={[
                  {
                    required: true,
                    message: 'This is required field',
                  },
                  {
                    validator: (_, value) => {
                      if (value.toLowerCase() === deprecateVerification) {
                        return Promise.resolve();
                      }
                      return Promise.reject();
                    },
                  },
                ]}
              >
                <Input
                  value={depValue}
                  onChange={handleOnDepProjectValueChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const projectName = getFieldValue('projectName');
                  const disabled =
                    (projectName as string)?.toLowerCase() !==
                    deprecateVerification;
                  return (
                    <Button
                      loading={status === 'loading'}
                      disabled={disabled}
                      type="primary"
                      htmlType="submit"
                      danger
                    >
                      I understand the consequences, deprecate this project
                    </Button>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DangerZoneSubView;
