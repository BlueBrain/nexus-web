import * as React from 'react';
import { Form, Input, DatePicker, Select, Radio, Row, Col, Button } from 'antd';

import ActionButton from './ActionButton';

import './ProjectForm.less';

const ProjectForm: React.FC<{ onClickCancel(): void }> = ({
  onClickCancel,
}) => {
  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>('');
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [topic, setTopic] = React.useState<string>('');
  const [hypotheses, setHypotheses] = React.useState<string>('');
  const [goals, setGoals] = React.useState<string>('');
  const [questions, setQuestions] = React.useState<string>('');

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 9 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 15 } },
  };

  const onSubmit = () => {
    if (name === '') {
      setNameError(true);
    } else {
      setNameError(false);
    }

    if (description === '') {
      setDescriptionError(true);
    } else {
      setDescriptionError(false);
    }
  };

  return (
    <Form {...formItemLayout} className="project-form">
      <h2>Create a New Project</h2>
      <Row gutter={24}>
        <Col xs={24} sm={24} md={12}>
          <Form.Item label="Project Type">
            <Radio.Group value="personal">
              <Radio.Button value="personal">Personal</Radio.Button>
              <Radio.Button value="organization" disabled={true}>
                Organization
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Project Name *"
            validateStatus={nameError ? 'error' : ''}
            help={nameError && 'Please enter a project name'}
          >
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Project Description *"
            validateStatus={descriptionError ? 'error' : ''}
            help={descriptionError && 'Please enter a description'}
          >
            <Input.TextArea
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Research Topic">
            <Input
              value={topic}
              onChange={event => setTopic(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Research Question(s)">
            <Input.TextArea
              value={questions}
              onChange={event => setQuestions(event.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Form.Item label="Project Visibility">
            <Radio.Group defaultValue="public">
              <Radio.Button value="public">Public</Radio.Button>
              <Radio.Button value="private">Private</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Provisional End Date *"
            validateStatus="error"
            help="Please select a due date"
          >
            <DatePicker />
          </Form.Item>
          <Form.Item label="Members">
            <Select defaultValue="You!">
              <Select.Option value="jack">Jack</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Hypotheses">
            <Input.TextArea
              value={hypotheses}
              onChange={event => setHypotheses(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Goals and deliverables">
            <Input.TextArea
              value={goals}
              onChange={event => setGoals(event.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'left' }}>
          <em>* Mandatory fields</em>
        </Col>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
          <ActionButton
            title="Cancel"
            onClick={onClickCancel}
            bordered={true}
          />
          <ActionButton title="Create" onClick={onSubmit} bordered={true} />
        </Col>
      </Row>
    </Form>
  );
};

export default ProjectForm;
