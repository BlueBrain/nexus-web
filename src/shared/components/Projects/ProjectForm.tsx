import * as React from 'react';
import { Form, Icon, Input, Button, Spin, Modal } from 'antd';
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
    rev: number,
    description?: string;
    base?: string;
    apiMappings?: PrefixMappingGroupInputState[];
  };
  busy?: boolean;
  onSubmit?(project: ProjectFormProps['project']): any;
  onDeprecate?(): any;
  onMakePublic?(): any;
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
  onDeprecate = () => {},
  onMakePublic = () => {},
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
          apiMappings:
            (values.apiMappings &&
              values.apiMappings.filter((p: any) => !!p)) ||
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

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Project',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  const confirmMakePublic = () => {
    Modal.confirm({
      title: 'Make Project Public',
      content: 'Are you sure?',
      onOk: onMakePublic,
    });
  };

  // Dynamic form fields
  const apiMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item
        label={index === 0 ? 'API Mappings' : ''}
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        key={key}
      >
        {getFieldDecorator(`apiMappings[${key - 1}]`, {
          initialValue: {
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
        <Form.Item label="Label" {...formItemLayout}>
          {getFieldDecorator('label', {
            initialValue: project ? project.label : '',
            rules: [
              {
                required: true,
                whitespace: true,
                pattern: /^\S+$/g,
                message: 'Label must be a phrase without spaces',
              },
            ],
          })(<Input placeholder="Label" disabled={mode === 'edit'} />)}
        </Form.Item>
        <Form.Item label="Description" {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: project ? project.description : '',
            rules: [{ required: false }],
          })(<Input placeholder="Description" />)}
        </Form.Item>
        <Form.Item label="Base" {...formItemLayout}>
          {getFieldDecorator('base', {
            initialValue: project ? project.base : '',
            rules: [{ required: false }],
          })(<Input placeholder="Base" />)}
        </Form.Item>
        {apiMappingsItems}
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={add} style={{ width: '60%' }}>
            <Icon type="plus" /> Add API mapping
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
          {mode === 'edit' && (
            <>
              <Button
                type="danger"
                onClick={confirmDeprecate}
                style={{ float: 'right' }}
              >
                Deprecate
              </Button>
              <Button
                onClick={confirmMakePublic}
                style={{float: 'right' }}
              >
                <Icon type="global" />Make public
              </Button>
            </>
          )}
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default Form.create()(ProjectForm);
