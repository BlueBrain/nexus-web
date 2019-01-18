import * as React from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export interface OrgFormProps {
  form: WrappedFormUtils;
  org?: {
    label: string;
    name: string;
  };
  busy?: boolean;
  onSubmit?(project: OrgFormProps['org']): any;
  mode?: 'create' | 'edit';
}

const OrgForm: React.FunctionComponent<OrgFormProps> = ({
  form,
  org,
  mode,
  busy = false,
  onSubmit = () => {},
}) => {
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

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  };

  return (
    <Spin spinning={busy}>
      <Form onSubmit={handleSubmit}>
        <h1>Organization: {getFieldValue('name') || (org && org.name)}</h1>
        <Form.Item label="Name" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: org ? org.name : '',
            rules: [{ required: true }],
          })(<Input placeholder="Name" />)}
        </Form.Item>
        <Form.Item label="Label" {...formItemLayout}>
          {getFieldDecorator('label', {
            initialValue: org ? org.label : '',
            rules: [{ required: true }],
          })(<Input placeholder="Label" disabled={mode === 'edit'} />)}
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

export default Form.create()(OrgForm);
