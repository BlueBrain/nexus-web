import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import TextArea from 'antd/lib/input/TextArea';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

const StudioEditorForm: React.FC<{
  form: WrappedFormUtils;
  saveStudio?(label: string, description?: string): void;
  studio?: StudioResource | null;
}> = ({ form, saveStudio, studio }) => {
  const { getFieldDecorator } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        const { label, description } = values;
        saveStudio && saveStudio(label, description);
      }
    });
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
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="A name of your studio">
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
        })(<Input className="ui-studio-label-input" />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A description of your studio">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          initialValue: description,
        })(<TextArea className="ui-studio-description-input" />)}
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default Form.create<{
  form: WrappedFormUtils;
  saveStudio?(label: string): void;
  studio?: StudioResource | null;
}>()(StudioEditorForm);
