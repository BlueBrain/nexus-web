import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Button } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import TextArea from 'antd/lib/input/TextArea';

type WorkspaceResource = Resource<{
  label: string;
  description?: string;
  dashboards?: [string];
}>;

const WorkspaceEditorForm: React.FC<{
  saveWorkspace?(label: string, description?: string): void;
  workspace?: WorkspaceResource | null;
}> = ({ saveWorkspace, workspace }) => {
  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { label, description } = values;
      saveWorkspace && saveWorkspace(label, description);
    } catch (error) {
      // TODO handle errors?
    }
  };

  const { label, description } = workspace || {
    label: '',
    description: '',
  };

  return (
    <Form {...formItemLayout} onChange={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="A name of your workspace">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
        name="label"
        initialValue={label}
        rules={[
          {
            required: true,
            message: 'Please input a label!',
          },
        ]}
      >
        <Input className="ui-workspace-label-input" />
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A description of your workspace">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
        name="description"
        initialValue={description}
      >
        <TextArea className="ui-workspace-description-input" />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default WorkspaceEditorForm;
