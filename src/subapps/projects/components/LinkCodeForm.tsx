import * as React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Button,
  Spin,
  Select,
  Row,
  Col,
} from 'antd';

import './LinkCodeForm.less';

const { Item } = Form;

const LinkCodeForm: React.FC<{
  onClickCancel(): void;
  onClickSubmit(): void;
}> = ({ onClickCancel, onClickSubmit }) => {
  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 9 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 15 } },
  };

  const columnLayout = {
    xs: 24,
    sm: 24,
    md: 24,
  };

  return (
    <Form {...formItemLayout} className="link-code-form">
      <h2>Link Code</h2>
      <Row>
        <Col {...columnLayout}>
          <Spin spinning={false} tip="Please wait...">
            <Item label="Name">
              <Input value={name} onChange={() => {}} />
            </Item>
            <Item label="Description">
              <Input value={name} onChange={() => {}} />
            </Item>
            <Item label="Code Repository*">
              <Input value={name} onChange={() => {}} />
            </Item>
            <Item label="Code Sample Type">
              <Input value={name} onChange={() => {}} />
            </Item>
            <Item label="Programming Language">
              <Input value={name} onChange={() => {}} />
            </Item>
            <Item label="Runtime Platform">
              <Input value={name} onChange={() => {}} />
            </Item>
            <p>
              <em>*the URL of the sample or the path</em>
            </p>
            <div className="link-code-form__buttons">
              <Button onClick={onClickCancel} style={{ marginRight: '15px' }}>
                Cancel
              </Button>
              <Button onClick={onClickSubmit} type="primary">
                Save
              </Button>
            </div>
          </Spin>
        </Col>
      </Row>
    </Form>
  );
};

export default LinkCodeForm;
