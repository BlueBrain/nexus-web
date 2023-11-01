import * as React from 'react';
import { Form, Input, Button, Spin, Modal } from 'antd';

export interface OrgFormProps {
  org?: {
    label: string;
    description?: string;
    isDeprecated?: boolean;
  };
  busy?: boolean;
  onSubmit?(org: OrgFormProps['org']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

const OrgForm: React.FunctionComponent<OrgFormProps> = ({
  org,
  mode,
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
}) => {
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

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Organization',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  const handleSubmit = (values: OrgFormProps['org']) => {
    onSubmit(values);
  };

  return (
    <Spin spinning={busy}>
      <Form onFinish={handleSubmit}>
        <Form.Item
          label="Label"
          {...formItemLayout}
          name="label"
          initialValue={org ? org.label : ''}
          rules={[
            {
              required: true,
              whitespace: true,
              pattern: /^\S+$/g,
              message: 'Label must be a phrase without spaces',
            },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message:
                'Label should include only letters, numbers, underscores, and dashes.',
            },
          ]}
        >
          <Input placeholder="Label" disabled={mode === 'edit'} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={org ? org.description : ''}
          rules={[{ required: false }]}
          {...formItemLayout}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={org && org.isDeprecated}
          >
            {mode === 'edit' ? 'Save' : 'Create'}
          </Button>
          {mode === 'edit' && (
            <Button
              danger
              onClick={confirmDeprecate}
              style={{ float: 'right' }}
              disabled={org && org.isDeprecated}
            >
              Deprecate
            </Button>
          )}
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default OrgForm;
