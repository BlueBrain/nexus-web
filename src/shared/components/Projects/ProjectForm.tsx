import * as React from 'react';
import { Form, Icon, Input, Button, Spin } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

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
  value: any;
  onChange(state: PrefixMappingGroupInputState): void;
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
    this.props.onChange({ ...this.state, prefix });
  };

  handleNamespaceChange = (e: React.FormEvent<HTMLInputElement>) => {
    const namespace = e.currentTarget.value;
    this.setState({
      namespace,
    });
    this.props.onChange({ ...this.state, namespace });
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
  form: WrappedFormUtils;
  project?: {
    label: string;
    name: string;
    base?: string;
    prefixMappings?: PrefixMappingGroupInputState[];
  };
  busy?: boolean;
  onSubmit?(project: ProjectFormProps['project']): any;
  mode?: 'create' | 'edit';
}

/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
const ProjectForm: React.FunctionComponent<ProjectFormProps> = ({
  form,
  project,
  busy = false,
  onSubmit = () => {},
  mode = 'create',
}) => {
  // logic for generating dynamic prefix mapping fields in form
  const currentId =
    project && project.prefixMappings ? project.prefixMappings.length : 0;
  const activeKeys = [...Array(currentId + 1).keys()].slice(1);
  const [prefixMappingKeys, setPrefixMappingKeys] = React.useState({
    currentId,
    activeKeys,
  });

  const { getFieldDecorator, getFieldValue } = form;
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
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 19, offset: 5 },
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

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit({
          ...values,
          prefixMappings:
            (values.prefixMappings &&
              values.prefixMappings.filter((p: any) => !!p)) ||
            [],
        });
      }
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

  // Dynamic form fields
  const prefixMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item
        label={index === 0 ? 'Prefix Mappings' : ''}
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        key={key}
      >
        {getFieldDecorator(`prefixMappings[${key - 1}]`, {
          initialValue: {
            prefix:
              (project &&
                project.prefixMappings &&
                project.prefixMappings[key - 1] &&
                project.prefixMappings[key - 1].prefix) ||
              '',
            namespace:
              (project &&
                project.prefixMappings &&
                project.prefixMappings[key - 1] &&
                project.prefixMappings[key - 1].namespace) ||
              '',
          },
          rules: [{ validator: checkPrefix, required: true }],
        })(
          // @ts-ignore
          <PrefixMappingGroupInput groupId={`${key}`} />
        )}
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
    <Spin spinning={busy}>
      <Form onSubmit={handleSubmit}>
        <h1>Project: {getFieldValue('name') || (project && project.name)}</h1>
        <Form.Item label="Name" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: project ? project.name : '',
            rules: [{ required: true }],
          })(<Input placeholder="Name" />)}
        </Form.Item>
        <Form.Item label="Label" {...formItemLayout}>
          {getFieldDecorator('label', {
            initialValue: project ? project.label : '',
            rules: [{ required: true }],
          })(<Input placeholder="Label" disabled={mode === 'edit'} />)}
        </Form.Item>
        <Form.Item label="Base" {...formItemLayout}>
          {getFieldDecorator('base', {
            initialValue: project ? project.base : '',
            rules: [{ required: false }],
          })(<Input placeholder="Base" />)}
        </Form.Item>
        {prefixMappingsItems}
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={add} style={{ width: '60%' }}>
            <Icon type="plus" /> Add prefix mapping
          </Button>
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default Form.create()(ProjectForm);
