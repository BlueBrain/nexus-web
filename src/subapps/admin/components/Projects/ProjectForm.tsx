import './ProjectForm.scss';

import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Col, Collapse, Form, Input, Modal, Row, Space, Spin } from 'antd';
import * as React from 'react';

export interface PrefixMappingGroupInputState {
  prefix: string;
  namespace: string;
}

const PrefixMappingGroupInput: React.FC<{
  groupId: number;
  value?: any;
}> = ({ groupId, value }) => {
  return (
    <Space.Compact className="project-form__item-inputs">
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
    </Space.Compact>
  );
};

export interface ProjectFormProps {
  project?: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    apiMappings?: PrefixMappingGroupInputState[];
  };
  busy?: boolean;
  onSubmit?(project: ProjectFormProps['project']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
const ProjectForm: React.FunctionComponent<ProjectFormProps> = ({
  project,
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
  mode = 'create',
}) => {
  // logic for generating dynamic prefix mapping fields in form
  const currentId = project && project.apiMappings ? project.apiMappings.length : 0;
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
      activeKeys: [...activeKeys, newId],
    });
  };

  const remove = (k: any) => {
    const { activeKeys } = prefixMappingKeys;
    setPrefixMappingKeys({
      ...prefixMappingKeys,
      activeKeys: activeKeys.filter((key: any) => key !== k),
    });
  };

  const handleSubmit = (data: any) => {
    const mappingObject = data.apiMappings ? data.apiMappings : {};
    const apiMappings = Object.keys(mappingObject).map((mapping: any) => data.apiMappings[mapping]);

    onSubmit({
      ...data,
      apiMappings,
    });
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Project',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  // Dynamic form fields
  const apiMappingsItems = prefixMappingKeys.activeKeys.map((key: number) => (
    <Form.Item key={key}>
      <div className="project-form__form-item">
        <PrefixMappingGroupInput
          groupId={key}
          value={{
            prefix:
              (project &&
                project.apiMappings &&
                project.apiMappings[key - 1] &&
                project.apiMappings[key - 1].prefix) ||
              '',
            namespace:
              (project &&
                project.apiMappings &&
                project.apiMappings[key - 1] &&
                project.apiMappings[key - 1].namespace) ||
              '',
          }}
        />
        {prefixMappingKeys.activeKeys.length > 0 ? (
          <MinusCircleOutlined onClick={() => remove(key)} />
        ) : null}
      </div>
    </Form.Item>
  ));

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };

  return (
    <Spin spinning={busy} tip="Please be patient while the project is scaffolded.">
      <Form onFinish={handleSubmit} className="project-form">
        <Form.Item
          {...formItemLayout}
          label="Label"
          name="_label"
          initialValue={project ? project._label : ''}
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
          initialValue={project ? project.description : ''}
          rules={[{ required: false }]}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item>
          <Collapse
            items={[
              {
                key: '1',
                label: 'Advanced settings',
                children: (
                  <>
                    <Form.Item
                      label="Base"
                      name="base"
                      initialValue={project ? project.base : ''}
                      rules={[{ required: false }]}
                    >
                      <Input placeholder="Base" />
                    </Form.Item>
                    <Form.Item
                      label="Vocab"
                      name="vocab"
                      initialValue={project ? project.vocab : ''}
                      rules={[{ required: false }]}
                    >
                      <Input placeholder="Vocab" />
                    </Form.Item>
                    <h4>API Mappings</h4>
                    {apiMappingsItems}
                    <Form.Item>
                      <Button type="dashed" onClick={add} className="project-form__add-button">
                        <PlusCircleOutlined /> Add API mapping
                      </Button>
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Row justify="end" gutter={16}>
            <Col>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Col>
            {mode === 'edit' && (
              <>
                <Col>
                  <Button danger onClick={confirmDeprecate}>
                    Deprecate
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ProjectForm;
