import * as React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Row,
  Col,
  Button,
  Spin,
  Select,
} from 'antd';
import * as moment from 'moment';

import { Status } from './StatusIcon';
import { ActivityMetadata } from '../containers/NewActivityContainer';

import './ActivityForm.less';

const ActivityForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: ActivityMetadata): void;
}> = ({ onClickCancel, onSubmit }) => {
  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>('');
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [summary, setSummary] = React.useState<string>();
  const [status, setStatus] = React.useState<Status>(Status.toDo);
  const [dueDate, setDueDate] = React.useState<any>();
  const [dateError, setDateError] = React.useState<boolean>(false);

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 7 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 17 } },
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

  const onClickSubmit = () => {
    if (isValidInput()) {
      const data: any = {
        name,
        description,
        summary,
        dueDate,
        status,
      };

      onSubmit(data);
    }
  };

  const { Item } = Form;

  return (
    <Form {...formItemLayout} className="activity-form">
      <h2 className="activity-form__title">Create New Activity</h2>
      <Row gutter={24}>
        <Col xs={24} sm={24} md={12}>
          <Item
            label="Name *"
            validateStatus={nameError ? 'error' : ''}
            help={nameError && 'Please enter an activity name'}
          >
            <Input value={name} onChange={onChangeName} />
          </Item>
          <Item
            label="Description *"
            validateStatus={descriptionError ? 'error' : ''}
            help={descriptionError && 'Please enter a description'}
          >
            <Input value={description} onChange={onChangeDescription} />
          </Item>
          <Item label="Summary">
            <Input.TextArea
              value={summary}
              onChange={event => setSummary(event.target.value)}
            />
          </Item>
          <Item label="Status">
            <Radio.Group
              value={status}
              onChange={event => setStatus(event.target.value)}
            >
              {Object.values(Status).map(status => (
                <Radio.Button value={status}>{status}</Radio.Button>
              ))}
            </Radio.Group>
          </Item>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Item
            label="Provisional End Date *"
            validateStatus={dateError ? 'error' : ''}
            help={dateError && 'Please select a due date'}
          >
            <DatePicker
              value={dueDate ? moment(dueDate) : null}
              onChange={onChangeDate}
            />
          </Item>
          <Item label="Parent Activity">
            <Select defaultValue="disabled" disabled>
              <Select.Option value="disabled">Disabled</Select.Option>
            </Select>
          </Item>
          <Item label="Input Activity">
            <Select defaultValue="disabled" disabled>
              <Select.Option value="disabled">Disabled</Select.Option>
            </Select>
          </Item>
          <Item label="Output Activity">
            <Select defaultValue="disabled" disabled>
              <Select.Option value="disabled">Disabled</Select.Option>
            </Select>
          </Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'left' }}>
          <em>* Mandatory fields</em>
        </Col>
        <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
          <Button onClick={onClickCancel}>Cancel</Button>
          <Button onClick={onClickSubmit} type="primary">
            Create
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ActivityForm;
