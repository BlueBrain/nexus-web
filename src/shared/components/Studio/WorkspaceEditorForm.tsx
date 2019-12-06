import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

type WorkspaceResource = Resource<{
  label: string;
  description?: string;
  dashboards?: [string];
}>;

const WorkspaceEditorForm: React.FC<{
  form: WrappedFormUtils;
  saveWorkspace?(label: string, description?: string): void;
  workspace?: WorkspaceResource | null; 
}> = ({ form, saveWorkspace, workspace }) => {
  const { getFieldDecorator } = form;

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    form.validateFields((err, values) => {
      if (!err) {
        const { label, description } = values;
        saveWorkspace && saveWorkspace(label, description);
      }
    });
  };

  const { label, description } = workspace || {
    label: '',
    description: '',
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="A name of your workspace">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('label', {
          initialValue: label,
          rules: [
            {
              required: true,
              message: 'Please input a label!',
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Desription{' '}
            <Tooltip title="A desription of your workspace">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          initialValue: description,
        })(<Input />)}
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
}

export default Form.create<{
  form: WrappedFormUtils;
  saveWorkspace?(label: string): void;
  studio?: WorkspaceResource | null;
}>()(WorkspaceEditorForm);