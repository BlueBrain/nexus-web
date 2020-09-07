import * as React from 'react';
import { Form, Input, DatePicker, Radio, Row, Col, Button, Spin } from 'antd';
import * as moment from 'moment';

const { Item } = Form;

import './ProjectForm.less';

export type ProjectMetadata = {
  name: string;
  description: string;
  dueDate: string;
  visibility?: string;
  topic?: string;
  hypotheses?: string;
  goals?: string;
  questions?: string;
  type?: string;
};

const ProjectForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: ProjectMetadata): void;
  busy: boolean;
  project?: ProjectMetadata;
}> = ({ onClickCancel, onSubmit, busy, project }) => {
  const [name, setName] = React.useState<string>(project ? project.name : '');
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>(
    project ? project.description : ''
  );
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [topic, setTopic] = React.useState<string>(
    project && project.topic ? project.topic : ''
  );
  const [hypotheses, setHypotheses] = React.useState<string>(
    project && project.hypotheses ? project.hypotheses : ''
  );
  const [goals, setGoals] = React.useState<string>(
    project && project.goals ? project.goals : ''
  );
  const [questions, setQuestions] = React.useState<string>(
    project && project.questions ? project.questions : ''
  );
  const [dueDate, setDueDate] = React.useState<any>(
    project ? project.dueDate : null
  );
  const [dateError, setDateError] = React.useState<boolean>(false);
  const [visibility, setVisibility] = React.useState(
    project && project.visibility ? project.visibility : 'public'
  );

  const formTitle = project ? 'Edit Project' : 'Create a New Project';
  const formItemLayout = project
    ? {}
    : {
        labelCol: { xs: { span: 24 }, sm: { span: 9 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 15 } },
      };

  const formColumnLayOut = project
    ? {}
    : {
        xs: 24,
        sm: 24,
        md: 12,
      };

  const isEmptyInput = (value: string) => {
    return value.split(' ').join('') === '';
  };

  const isValidInput = () => {
    let isValid = true;

    if (isEmptyInput(name)) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }

    if (isEmptyInput(description)) {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    if (!dueDate) {
      setDateError(true);
      isValid = false;
    } else {
      setDateError(false);
    }

    return isValid;
  };

  const onClickSave = () => {
    if (isValidInput()) {
      const data: ProjectMetadata = {
        visibility,
        name,
        description,
        topic,
        hypotheses,
        goals,
        questions,
        dueDate,
        type: 'personal',
      };

      onSubmit(data);
    }
  };

  const onChangeName = (event: any) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
    setDescriptionError(false);
  };

  const onChangeDate = (date: any) => {
    setDueDate(date);
    setDateError(false);
  };

  return (
    <Form {...formItemLayout} className="project-form">
      <h2>{formTitle}</h2>
      <Spin spinning={busy} tip="Please wait...">
        <Row gutter={24}>
          <Col {...formColumnLayOut}>
            <Item label="Project Type">
              <Radio.Group value="personal">
                <Radio.Button value="personal">Personal</Radio.Button>
                <Radio.Button value="organization" disabled={true}>
                  Organization
                </Radio.Button>
              </Radio.Group>
            </Item>
            <Item
              label="Project Name *"
              validateStatus={nameError ? 'error' : ''}
              help={nameError && 'Please enter a project name'}
            >
              <Input
                value={name}
                onChange={onChangeName}
                disabled={!!project}
              />
            </Item>
            <Item
              label="Project Description *"
              validateStatus={descriptionError ? 'error' : ''}
              help={descriptionError && 'Please enter a description'}
            >
              <Input.TextArea
                value={description}
                onChange={onChangeDescription}
              />
            </Item>
            <Item label="Research Topic">
              <Input
                value={topic}
                onChange={event => setTopic(event.target.value)}
              />
            </Item>
            <Item label="Research Question(s)">
              <Input.TextArea
                value={questions}
                onChange={event => setQuestions(event.target.value)}
              />
            </Item>
          </Col>
          <Col {...formColumnLayOut}>
            <Item label="Project Visibility">
              <Radio.Group
                value={visibility}
                onChange={event => setVisibility(event.target.value)}
              >
                <Radio.Button value="public">Public</Radio.Button>
                <Radio.Button value="private">Private</Radio.Button>
              </Radio.Group>
            </Item>
            <Item
              label="Provisional End Date *"
              validateStatus={dateError ? 'error' : ''}
              help={dateError && 'Please select a due date'}
            >
              <DatePicker value={moment(dueDate)} onChange={onChangeDate} />
            </Item>
            <Item label="Hypotheses">
              <Input.TextArea
                value={hypotheses}
                onChange={event => setHypotheses(event.target.value)}
              />
            </Item>
            <Item label="Goals and deliverables">
              <Input.TextArea
                value={goals}
                onChange={event => setGoals(event.target.value)}
              />
            </Item>
          </Col>
        </Row>
        <Row>
          <Col {...formColumnLayOut} style={{ textAlign: 'left' }}>
            <em>* Mandatory fields</em>
          </Col>
          <Col {...formColumnLayOut} style={{ textAlign: 'right' }}>
            <Button onClick={onClickCancel}>Cancel</Button>
            <Button onClick={onClickSave} type="primary">
              {project ? 'Save' : 'Create'}
            </Button>
          </Col>
        </Row>
      </Spin>
    </Form>
  );
};

export default ProjectForm;
