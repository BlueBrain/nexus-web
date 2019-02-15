import * as React from 'react';
import { Form, Input, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import './AddMemberForm.less';

interface AddMemberFormProps {
  form: WrappedFormUtils;
  onSubmit(name: string): void;
}

const AddMemberForm: React.FunctionComponent<AddMemberFormProps> = props => {
  const hasErrors = (fieldsError: { [key: string]: any }): boolean => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.form.validateFields((err, value) => {
      if (!err) {
        props.onSubmit(value['username']);
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="AddMemberForm">
      <Form.Item className="new-member-item">
        {props.form.getFieldDecorator('username', {
          rules: [
            { required: true, message: "Please enter a new member's name" },
          ],
        })(<Input placeholder="Enter name" />)}
      </Form.Item>
      <Form.Item className="new-member-item">
        <Button
          htmlType="submit"
          type="primary"
          disabled={hasErrors(props.form.getFieldsError())}
        >
          Add
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create()(AddMemberForm);
