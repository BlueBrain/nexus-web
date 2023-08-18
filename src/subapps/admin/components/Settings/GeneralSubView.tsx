import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useMutation } from 'react-query';
import { Form, Input, Button, Spin, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { NexusClient, ProjectResponseCommon } from '@bbp/nexus-sdk/es';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';
import useNotification from '../../../../shared/hooks/useNotification';
import './styles.scss';

type TProps = {
  project: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    mode: string;
  };
  apiMappings?: PrefixMappingGroupInputState[];
};
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
export interface PrefixMappingGroupInputState {
  prefix: string;
  namespace: string;
}
const PrefixMappingGroupInput = ({
  groupId,
  value,
}: {
  groupId: number;
  value?: any;
}) => {
  return (
    <Input.Group className="api-mapping-row-inputs">
      <Form.Item
        noStyle
        name={['apiMappings', `apiMappings[${groupId - 1}]`, 'prefix']}
        rules={[
          {
            required: true,
            message: 'You need to specify prefix',
          },
        ]}
        initialValue={value.prefix}
      >
        <Input style={{ width: '33%' }} placeholder="prefix" />
      </Form.Item>
      <Form.Item
        noStyle
        name={['apiMappings', `apiMappings[${groupId - 1}]`, 'namespace']}
        rules={[
          {
            required: true,
            message: 'You need to specify namespace',
          },
        ]}
        initialValue={value.namespace}
      >
        <Input style={{ width: '50%' }} placeholder="namespace" />
      </Form.Item>
    </Input.Group>
  );
};

const submitSettings = async ({
  nexus,
  orgLabel,
  projectLabel,
  rev,
  newProject,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  newProject: ProjectResponseCommon;
}) => {
  const mappingObject = newProject.apiMappings ? newProject.apiMappings : {};
  const apiMappings = Object.keys(mappingObject).map(
    (mapping: any) => newProject.apiMappings![mapping]
  );
  try {
    return await nexus.Project.update(orgLabel, projectLabel, rev, {
      apiMappings,
      base: newProject.base,
      vocab: newProject.vocab,
      description: newProject.description,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not update project settings', { cause: error });
  }
};

const GeneralSubView = ({
  project: { _label, _rev, description, base, vocab, mode },
  apiMappings,
}: TProps) => {
  const nexus = useNexusContext();
  const notification = useNotification();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const {
    params: { orgLabel, projectLabel },
  } = match;
  const {
    status: updateSettingStatus,
    mutateAsync: handleSubmitSettingsAsync,
  } = useMutation(
    (newProject: ProjectResponseCommon) =>
      submitSettings({
        nexus,
        orgLabel,
        newProject,
        projectLabel,
        rev: _rev,
      }),
    {
      onSuccess: () =>
        notification.success({ message: 'Project general data saved' }),
      onError: error =>
        notification.error({
          message: 'An unknown error occurred',
          // @ts-ignore
          description: error.cause.message,
        }),
    }
  );

  const currentId = apiMappings ? apiMappings.length : 0;
  const activeKeys = [...Array(currentId + 1).keys()].slice(1);
  const [prefixMappingKeys, setPrefixMappingKeys] = React.useState({
    currentId,
    activeKeys,
  });
  const add = () => {
    const { currentId, activeKeys } = prefixMappingKeys;
    const newId: number = currentId + 1;
    // @ts-ignore
    setPrefixMappingKeys({
      currentId: newId,
      activeKeys: [newId, ...activeKeys],
    });
  };

  const remove = (k: any) => {
    const { activeKeys } = prefixMappingKeys;
    setPrefixMappingKeys({
      ...prefixMappingKeys,
      activeKeys: activeKeys.filter((key: any) => key !== k),
    });
  };
  const apiMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item key={key}>
        <div className="api-mapping-row">
          <PrefixMappingGroupInput
            groupId={key}
            value={{
              prefix:
                (apiMappings &&
                  apiMappings[key - 1] &&
                  apiMappings[key - 1].prefix) ||
                '',
              namespace:
                (apiMappings &&
                  apiMappings[key - 1] &&
                  apiMappings[key - 1].namespace) ||
                '',
            }}
          />
          {prefixMappingKeys.activeKeys.length > 0 ? (
            <DeleteOutlined
              className="delete-api-mapping-item-btn"
              onClick={() => remove(key)}
            />
          ) : null}
        </div>
      </Form.Item>
    )
  );
  return (
    <div className="settings-view settings-general-view">
      <Form onFinish={handleSubmitSettingsAsync} labelAlign="left">
        <h2>General</h2>
        <Spin spinning={updateSettingStatus === 'loading'} tip="Please wait...">
          <div className="settings-view-container">
            <Form.Item
              {...formItemLayout}
              label="name"
              name="_label"
              initialValue={_label ?? ''}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  pattern: /^\S+$/g,
                  message: 'Label must be a phrase without spaces',
                },
              ]}
            >
              <Input placeholder="Label" disabled={mode === 'edit'} />
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="Description"
              name="description"
              initialValue={description ?? ''}
              rules={[{ required: false }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Description"
                disabled={mode === 'edit'}
              />
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="Base"
              name="base"
              initialValue={base ?? ''}
              rules={[{ required: false }]}
            >
              <Input disabled placeholder="Base" />
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="Vocab"
              name="vocab"
              initialValue={vocab ?? ''}
              rules={[{ required: false }]}
            >
              <Input placeholder="Vocab" />
            </Form.Item>
          </div>
          <div className="api-mapping-title">
            <h2>API Mappings </h2>
            <Button
              style={{ maxWidth: 150, margin: 0, marginRight: 10 }}
              disabled={false} // TODO: write premission to be enabled
              htmlType="button"
              onClick={add}
              type="link"
            >
              Add API Mappings
            </Button>
          </div>
          <div className="settings-view-container">
            <div className="api-mappings-content">{apiMappingsItems}</div>
          </div>
          <Form.Item>
            <AccessControl
              path={[`${orgLabel}/${projectLabel}`]}
              permissions={['projects/write']}
              noAccessComponent={() => () => (
                <Tooltip title="You have no permissions to update this project">
                  <HasNoPermission />
                </Tooltip>
              )}
            >
              <Button
                style={{ maxWidth: 120, margin: 0, right: 0 }}
                type="primary"
                htmlType="submit"
                className="project-form__add-button"
              >
                Save changes
              </Button>
            </AccessControl>
          </Form.Item>
        </Spin>
      </Form>
    </div>
  );
};

export default GeneralSubView;
