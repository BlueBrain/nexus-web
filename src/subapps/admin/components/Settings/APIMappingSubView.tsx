import React, { useState } from 'react';
import { Form, Input, Button, Spin, Row } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import { useRouteMatch } from 'react-router';
import useNotification from '../../../../shared/hooks/useNotification';
import './SettingsView.less';

export interface PrefixMappingGroupInputState {
  prefix: string;
  namespace: string;
}
type Props = {
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

const PrefixMappingGroupInput: React.FC<{
  groupId: number;
  value?: any;
}> = ({ groupId, value }) => {
  return (
    <Input.Group className="project-form__item-inputs">
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
        <Input style={{ width: '65%' }} placeholder="namespace" />
      </Form.Item>
    </Input.Group>
  );
};

const APIMappingSubView = ({ apiMappings, project }: Props) => {
  const notification = useNotification();
  const nexus = useNexusContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();
  const [busy, setFormBusy] = useState(false);
  const {
    params: { orgLabel, projectLabel },
  } = match;

  const currentId = apiMappings ? apiMappings.length : 0;
  const activeKeys = [...Array(currentId + 1).keys()].slice(1);
  const [prefixMappingKeys, setPrefixMappingKeys] = useState({
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
  const handleOnSubmitApiMapping = (data: any) => {
    console.log('newProject.apiMappings', data.apiMappings);
    const mappingObject = data.apiMappings ? data.apiMappings : {};
    const apiMappings = Object.keys(mappingObject).map(
      (mapping: any) => data.apiMappings[mapping]
    );
    if (!project) {
      return;
    }
    setFormBusy(true);
    nexus.Project.update(orgLabel, projectLabel, project._rev, {
      apiMappings: apiMappings || [],
    })
      .then(() => {
        notification.success({ message: 'API mapping saved' });
        setFormBusy(false);
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };
  const apiMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item key={key}>
        <div className="project-form__form-item">
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
    <div className="settings-view settings-apimappings-view">
      <h2>API Mappings </h2>
      <div className="settings-view-container">
        <div className="api-mappings-content">
          <Form
            onFinish={handleOnSubmitApiMapping}
            labelAlign="left"
            style={{ marginLeft: 60 }}
          >
            <Row gutter={8} style={{ marginBottom: 10 }}>
              <Button
                style={{ maxWidth: 150, margin: 0, marginRight: 10 }}
                disabled={false} // TODO: write premission to be enabled
                htmlType="button"
                onClick={add}
              >
                Add API Mappings
              </Button>
              <Button
                style={{ maxWidth: 150, margin: 0 }}
                type="primary"
                disabled={false} // TODO: write premission to be enabled
                htmlType="submit"
              >
                Save API Mappings
              </Button>
            </Row>
            <Spin spinning={busy} tip="Please wait...">
              {apiMappingsItems}
            </Spin>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default APIMappingSubView;
