import * as React from 'react';
import { Collapse, Form, Input, Button, Spin, Modal, Row, Col } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';

/**
 * Custom from controls, based on:
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 */
export interface PrefixMappingGroupInputState {
  prefix: string;
  namespace: string;
}
export interface PrefixMappingGroupInputProps {
  groupId: string | number;
  value?: any;
  onChange?(state: PrefixMappingGroupInputState): void;
}
class PrefixMappingGroupInput extends React.Component<
  PrefixMappingGroupInputProps,
  PrefixMappingGroupInputState
> {
  // Static method called by Form component
  static getDerivedStateFromProps(nextProps: PrefixMappingGroupInputProps) {
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {}),
      };
    }
    return null;
  }

  constructor(props: PrefixMappingGroupInputProps) {
    super(props);
    const value = props.value || {};
    this.state = {
      prefix: value.prefix || '',
      namespace: value.namespace || '',
    };
  }

  handlePrefixChange = (e: React.FormEvent<HTMLInputElement>) => {
    const prefix = e.currentTarget.value;
    this.setState({
      prefix,
    });
    this.props.onChange && this.props.onChange({ ...this.state, prefix });
  };

  handleNamespaceChange = (e: React.FormEvent<HTMLInputElement>) => {
    const namespace = e.currentTarget.value;
    this.setState({
      namespace,
    });
    this.props.onChange && this.props.onChange({ ...this.state, namespace });
  };

  render() {
    return (
      <Input.Group
        compact
        style={
          {
            width: 'calc(100% - 22px)',
            marginRight: 8,
          } /* icon is 14px + 8px margin-right = 22px*/
        }
      >
        <Input
          style={{ width: '20%' }}
          name={`prefix[${this.props.groupId}]`}
          placeholder="prefix"
          onChange={this.handlePrefixChange}
          value={this.state.prefix}
        />
        <Input
          style={{ width: '80%' }}
          name={`namespace[${this.props.groupId}]`}
          placeholder="namespace"
          onChange={this.handleNamespaceChange}
          value={this.state.namespace}
        />
      </Input.Group>
    );
  }
}

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
  const currentId =
    project && project.apiMappings ? project.apiMappings.length : 0;
  const activeKeys = [...Array(currentId + 1).keys()].slice(1);
  const [prefixMappingKeys, setPrefixMappingKeys] = React.useState({
    currentId,
    activeKeys,
  });

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 18, offset: 6 },
    },
  };

  const add = (k: any) => {
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

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      apiMappings:
        (values.apiMappings && values.apiMappings.filter((p: any) => !!p)) ||
        [],
    });
  };

  const checkPrefix = (
    rule: {},
    value: PrefixMappingGroupInputState,
    callback: (message?: string) => void
  ) => {
    if (value.prefix && value.namespace) {
      callback();
      return;
    }
    callback('You need to specify both prefix and namespace');
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Project',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  // Dynamic form fields
  const apiMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item
        label={index === 0 ? 'API Mappings' : ''}
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        key={key}
        name={`apiMappings[${key - 1}]`}
        initialValue={{
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
        rules={[{ validator: checkPrefix, required: true }]}
      >
        <PrefixMappingGroupInput groupId={`${key}`} />
        {prefixMappingKeys.activeKeys.length > 0 ? (
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => remove(key)}
          />
        ) : null}
      </Form.Item>
    )
  );
  return (
    <Spin
      spinning={busy}
      tip="Please be patient while the project is scaffolded."
    >
      <Form onFinish={handleSubmit}>
        <Form.Item
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
          {...formItemLayout}
        >
          <Input placeholder="Label" disabled={mode === 'edit'} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={project ? project.description : ''}
          rules={[{ required: false }]}
          {...formItemLayout}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Collapse>
            <Collapse.Panel header="Advanced settings" key="1">
              <Form.Item
                label="Base"
                name="base"
                initialValue={project ? project.base : ''}
                rules={[{ required: false }]}
                {...formItemLayout}
              >
                <Input placeholder="Base" />
              </Form.Item>
              <Form.Item
                label="Vocab"
                name="vocab"
                initialValue={project ? project.vocab : ''}
                rules={[{ required: false }]}
                {...formItemLayout}
              >
                <Input placeholder="Vocab" />
              </Form.Item>
              {apiMappingsItems}
              <Form.Item {...formItemLayoutWithOutLabel}>
                <Button type="dashed" onClick={add} style={{ width: '60%' }}>
                  <Icon type="plus" /> Add API mapping
                </Button>
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          {/* TODO replace flex */}
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
