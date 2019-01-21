import * as React from 'react';
import { Form, Input, Button, Spin, Modal } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export interface OrgFormProps {
  form: WrappedFormUtils;
  org?: {
    label: string;
    description?: string;
  };
  busy?: boolean;
  onSubmit?(project: OrgFormProps['org']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

const OrgForm: React.FunctionComponent<OrgFormProps> = ({
  form,
  org,
  mode,
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
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

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Organization',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
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
        <h1>Organization: {getFieldValue('label') || (org && org.label)}</h1>
        <Form.Item label="Label" {...formItemLayout}>
          {getFieldDecorator('label', {
            initialValue: org ? org.label : '',
            rules: [{ required: true }],
          })(<Input placeholder="Label" disabled={mode === 'edit'} />)}
        </Form.Item>
        <Form.Item label="Description" {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: org ? org.description : '',
            rules: [{ required: true }],
          })(<Input placeholder="Description" disabled={mode === 'edit'} />)}
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="primary" htmlType="submit">
            {mode === 'edit' ? 'Save' : 'Create'}
          </Button>
          {mode === 'edit' && (
            <Button
              type="danger"
              onClick={confirmDeprecate}
              style={{ float: 'right' }}
            >
              Deprecate
            </Button>
          )}
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default Form.create()(OrgForm);
