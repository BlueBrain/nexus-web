import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { QuestionCircleOutlined } from '@ant-design/icons';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const StudioEditorForm: React.FC<{
  saveStudio?(label: string, description?: string): void;
  studio?: StudioResource | null;
}> = ({ saveStudio, studio }) => {
  const handleSubmit = (values: { label: string; description: string }) => {
    const { label, description } = values;
    saveStudio && saveStudio(label, description);
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const { label, description } = studio || {
    label: '',
    description: '',
  };

  return (
    <Form {...formItemLayout} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="A name of your studio">
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
        <Input className="ui-studio-label-input" />
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A description of your studio">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        name="description"
        initialValue={description}
      >
        <TextArea className="ui-studio-description-input" />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default StudioEditorForm;
