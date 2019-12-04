import * as React from 'react';
import { Input, Form, Tooltip, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

const StudioEditorForm: React.FC<{
  form: WrappedFormUtils;
  saveStudio?(label: string): void;
}> = ({ form, saveStudio }) => {
  const { getFieldDecorator } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        console.log('success', values);
        
        saveStudio && saveStudio(values);
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
            <Tooltip title="A name of your studio">
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
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
}

export default Form.create<{
  form: WrappedFormUtils;
  saveStudio?(label: string): void;
}>()(StudioEditorForm);
