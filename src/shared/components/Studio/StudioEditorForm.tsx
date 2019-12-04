import * as React from 'react';
import { Input, Form, Tooltip, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export type studioPayload = {
  dataQuery: string;
  description: string;
  label: string;
};

const StudioEditorForm: React.FC<{
  form: WrappedFormUtils;
  onChange?(studioPayload: studioPayload): void;
  saveStudio?(studioPayload: studioPayload): void;
}> = ({ onChange, form }) => {
  const { getFieldDecorator } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ target: e.target });
  };

  const validate = () => {
    form.validateFields(err => {
      console.log(err);
      if (!err) {
        console.info('success');
      }
    });
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label&nbsp;
            <Tooltip title="What do you want to call this dashboard?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('label', {
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
            Description&nbsp;
            <Tooltip title="A short description of what's in the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          rules: [
            {
              required: false,
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Button type="primary" htmlType="submit" onClick={validate}>
        Save
      </Button>
    </Form>
  );
}

export default Form.create<{
  form: WrappedFormUtils;
  onChange?(studioPayload: studioPayload): void;
}>()(StudioEditorForm);
