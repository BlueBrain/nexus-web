import * as React from 'react';
import { Form, Input, DatePicker, Radio, Button, Spin, Select } from 'antd';

const { Item } = Form;

const LinkCodeForm: React.FC<{
  onClickCancel(): void;
  onClickSubmit(): void;
}> = ({ onClickCancel, onClickSubmit }) => {
  return (
    <Form className="link-code-form">
      <h2>Link Code</h2>
      <Spin spinning={false} tip="Please wait...">
        <Item label="Name *">
          <Input value={name} onChange={() => {}} />
        </Item>

        <Button onClick={onClickCancel}>Cancel</Button>
        <Button onClick={onClickSubmit} type="primary">
          Save
        </Button>
      </Spin>
    </Form>
  );
};

export default LinkCodeForm;
