import * as React from 'react';
import { Form, Input, Col, Row, Button } from 'antd';

import './LinkActivityForm.less';

const { Item } = Form;

const LinkActivityForm: React.FC<{}> = () => {
  const [name, setName] = React.useState<string>('');

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 7 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 17 } },
  };

  const columnLayout = {
    xs: 24,
    sm: 24,
    md: 12,
  };

  return (
    <div className="link-activity-form">
      <h2 className="link-activity-form__title">Link Activity to Step</h2>
      <Form {...formItemLayout}>
        <Row gutter={24}>
          <Col {...columnLayout}>
            <Item label="Resource Name">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Activity Type">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Created By">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Created On">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Link to Step">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
          </Col>
          <Col {...columnLayout}>
            <Item label="Input Data">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Output Data">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <Item label="Code">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Item>
            <div>
              <Button onClick={() => {}}>Cancel</Button>
              <Button onClick={() => {}} type="primary">
                Save
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default LinkActivityForm;
