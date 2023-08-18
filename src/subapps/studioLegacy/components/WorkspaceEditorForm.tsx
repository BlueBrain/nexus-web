import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk/es';
import { Input, Form, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

export type WorkspaceResource = Resource<{
  label: string;
  description?: string;
  dashboards?: [string];
}>;

const WorkspaceEditorForm: React.FC<{
  saveWorkspace?(label: string, description?: string): void;
  workspace?: WorkspaceResource | null;
}> = ({ saveWorkspace, workspace }) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const handleSubmit = ({
    label,
    description,
  }: {
    label: string;
    description: string;
  }) => {
    saveWorkspace && saveWorkspace(label, description);
  };

  const { label, description } = workspace || {
    label: '',
    description: '',
  };

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      layout="vertical"
      role="form"
    >
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="A name of your workspace">
              <QuestionCircleOutlined />
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
        <Input
          className="ui-workspace-label-input"
          data-testid="workspace-label"
          aria-label="Label"
        />
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A description of your workspace">
              <QuestionCircleOutlined />
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
