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

import { Status } from '../StatusIcon';
import { ActivityMetadata } from '../../containers/NewActivityContainer';
import { ActivityResource } from '../../views/ActivityView';

import './ActivityForm.less';

const ActivityForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: ActivityMetadata): void;
  busy: boolean;
  parentLabel?: string | undefined;
  layout?: 'vertical' | 'horisontal';
  title?: string;
  activity?: ActivityResource;
  informedByLabel?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  onClickCancel,
  onSubmit,
  busy,
  parentLabel,
  layout,
  title,
  activity,
  informedByLabel,
  siblings,
}) => {
  const [name, setName] = React.useState<string>(
    (activity && activity.name) || ''
  );
  const [description, setDescription] = React.useState<string>(
    (activity && activity.description) || ''
  );
  const [summary, setSummary] = React.useState<string>(
    (activity && activity.summary) || ''
  );
  const [status, setStatus] = React.useState<Status>(
    (activity && activity.status) || Status.toDo
  );
  const [dueDate, setDueDate] = React.useState<any>(
    (activity && activity.dueDate) || null
  );
  const [dateError, setDateError] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [informedBy, setInformedBy] = React.useState<string | undefined>();

  const formItemLayout =
    layout === 'vertical'
      ? {}
      : {
          labelCol: { xs: { span: 24 }, sm: { span: 7 } },
          wrapperCol: { xs: { span: 24 }, sm: { span: 17 } },
        };

  const columnLayout =
    layout === 'vertical'
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

  const onChangeName = (event: any) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
    setDescriptionError(false);
  };

  const onChangeDate = (date: any) => {
    setDueDate(moment(date).format());
    setDateError(false);
  };

  const onChangeInformedBy = (selected: string) => {
    setInformedBy(selected);
  };

  const onClickSubmit = () => {
    if (isValidInput()) {
      const data: any = {
        name,
        description,
        summary,
        dueDate,
        status,
        informedBy,
      };

      if (informedBy) {
        data.wasInformedBy = {
          '@id': informedBy,
        };
      }

      onSubmit(data);
    }
  };

  const { Item } = Form;

  return (
    <Form {...formItemLayout} className="activity-form">
      {title && <h2 className="activity-form__title">{title}</h2>}
      <Spin spinning={busy} tip="Please wait...">
        <Row gutter={24}>
          <Col {...columnLayout}>
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
                  <Radio.Button key={`option-${status}`} value={status}>
                    {status}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Item>
          </Col>
          <Col {...columnLayout}>
            <Item
              label="Provisional End Date *"
              validateStatus={dateError ? 'error' : ''}
              help={dateError && 'Please select a due date'}
            >
              <DatePicker
                allowClear={false}
                value={dueDate ? moment(dueDate) : null}
                onChange={onChangeDate}
              />
            </Item>
            <Item label="Parent Activity">
              <Select value={parentLabel} disabled>
                <Select.Option value={parentLabel}>{parentLabel}</Select.Option>
              </Select>
            </Item>
            <Item label="Informed By">
              {informedByLabel ? (
                <Select disabled value={informedByLabel}>
                  <Select.Option value={informedBy}>{informedBy}</Select.Option>
                </Select>
              ) : (
                <Select onChange={onChangeInformedBy} value={informedBy}>
                  {siblings && siblings.length > 0 ? (
                    siblings.map(sibling => (
                      <Select.Option
                        value={sibling['@id']}
                        key={`sibling-${sibling['@id']}`}
                      >
                        {sibling.name}
                      </Select.Option>
                    ))
                  ) : (
                    <Select.Option value={informedBy}>
                      {informedBy}
                    </Select.Option>
                  )}
                </Select>
              )}
            </Item>
            <Item label="Informs">
              <Select defaultValue="disabled" disabled>
                <Select.Option value="disabled">Disabled</Select.Option>
              </Select>
            </Item>
          </Col>
        </Row>
        <Row>
          <Col {...columnLayout} style={{ textAlign: 'left' }}>
            <em>* Mandatory fields</em>
          </Col>
          <Col {...columnLayout} style={{ textAlign: 'right' }}>
            <Button onClick={onClickCancel}>Cancel</Button>
            <Button onClick={onClickSubmit} type="primary">
              Save
            </Button>
          </Col>
        </Row>
      </Spin>
    </Form>
  );
};

export default ActivityForm;
