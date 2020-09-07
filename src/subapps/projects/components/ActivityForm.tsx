import * as React from 'react';
import { Form, Input, DatePicker, Radio, Row, Col, Button, Spin } from 'antd';

import { Status } from './StatusIcon';

import './ActivityForm.less';

const { Item } = Form;

const ActivityForm: React.FC<{}> = () => {
  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 7 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 17 } },
  };

  const onChangeName = () => {
    console.log('clicked');
  };

  console.log('Object.keys(Status)', Object.keys(Status));

  return (
    <Form {...formItemLayout} className="activity-form">
      <h2>Create New Activity</h2>
      <Row gutter={24}>
        <Col xs={24} sm={24} md={12}>
          <Item
            label="Name *"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
          <Item
            label="Description *"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
          <Item
            label="Summary"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input.TextArea
            //   value={questions}
            //   onChange={event => setQuestions(event.target.value)}
            />
          </Item>
          <Item label="Status">
            <Radio.Group
            //   value={visibility}
            //   onChange={event => setVisibility(event.target.value)}
            >
              {Object.values(Status).map(status => (
                <Radio.Button value="public">{status}</Radio.Button>
              ))}
            </Radio.Group>
          </Item>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Item
            label="Provisional End Date *"
            // validateStatus={dateError ? 'error' : ''}
            // help={dateError && 'Please select a due date'}
          >
            <DatePicker onChange={() => {}} />
          </Item>
          <Item
            label="Parent Activity"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
          <Item
            label="Input Activity"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
          <Item
            label="Output Activity"
            //   validateStatus={nameError ? 'error' : ''}
            //   help={nameError && 'Please enter a project name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'left' }}>
          <em>* Mandatory fields</em>
        </Col>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
          <Button onClick={() => {}}>Cancel</Button>
          <Button onClick={() => {}} type="primary">
            Create
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ActivityForm;
