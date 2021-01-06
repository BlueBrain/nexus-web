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
  AutoComplete,
} from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import * as moment from 'moment';

import { Status } from '../StatusIcon';
import { WorkflowStepMetadata } from '../../containers/NewWorkflowStepContainer';
import { StepResource } from '../../views/WorkflowStepView';
import { isEmptyInput } from '../../utils';
import TypesIconList from '../../../../shared/components/Types/TypesIcon';
import { labelOf } from '../../../../shared/utils';

import './WorkflowStepForm.less';

const WorkflowStepWithActivityForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: WorkflowStepMetadata): void;
  busy: boolean;
  parentLabel?: string | undefined;
  layout?: 'vertical' | 'horisontal';
  title?: string;
  workflowStep?: StepResource;
  informedByLabel?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
  activityList: string[];
}> = ({
  onClickCancel,
  onSubmit,
  busy,
  parentLabel,
  layout,
  title,
  workflowStep,
  informedByLabel,
  siblings,
  activityList,
}) => {
  const [name, setName] = React.useState<string>(
    (workflowStep && workflowStep.name) || ''
  );
  const [activityType, setActivityType] = React.useState<string>(
    (workflowStep && workflowStep.activityType) || ''
  );
  const [description, setDescription] = React.useState<string>(
    (workflowStep && workflowStep.description) || ''
  );
  const [summary, setSummary] = React.useState<string>(
    (workflowStep && workflowStep.summary) || ''
  );
  const [status, setStatus] = React.useState<Status>(
    (workflowStep && workflowStep.status) || Status.toDo
  );
  const [dueDate, setDueDate] = React.useState<any>(
    (workflowStep && workflowStep.dueDate) || null
  );
  const [dateError, setDateError] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [informedBy, setInformedBy] = React.useState<string>('');

  const activityOptions = activityList.map(activity => ({
    value: labelOf(activity),
  }));

  const formItemLayout =
    layout === 'vertical'
      ? {}
      : {
          labelCol: { xs: { span: 24 }, sm: { span: 8 } },
          wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        };

  const columnLayout =
    layout === 'vertical'
      ? { xs: 24, sm: 24, md: 24 }
      : {
          xs: 24,
          sm: 24,
          md: 12,
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

  const onSelectActivity = (value: string) => {
    setName(value);
    setActivityType(value);
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
  const { Search } = Input;

  return (
    <Form {...formItemLayout} className="workflow-step-form">
      {title && <h2 className="workflow-step-form__title">{title}</h2>}
      <Spin spinning={busy} tip="Please wait...">
        <Row gutter={24}>
          <Col {...columnLayout}>
            <AutoComplete
              style={{ width: '100%', marginBottom: 30 }}
              options={activityOptions}
              filterOption={(inputValue, option) =>
                option!.value
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={onSelectActivity}
            >
              <Search size="large" placeholder="Search exisiting activity" />
            </AutoComplete>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col {...columnLayout}>
            <Item
              label="Name *"
              validateStatus={nameError ? 'error' : ''}
              help={nameError && 'Please enter a name'}
            >
              <Input value={name} onChange={onChangeName} />
            </Item>
            <Item label="Activity Type">
              {activityType && (
                <div className="workflow-step-form__activity-type">
                  <TypesIconList type={[activityType]} />
                  <Button
                    shape="circle"
                    type="default"
                    icon={<CloseCircleOutlined />}
                    onClick={() => setActivityType('')}
                  />
                </div>
              )}
            </Item>
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
            <Item label="Informed By">
              {informedByLabel ? (
                <Select disabled value={informedByLabel}>
                  <Select.Option value={informedByLabel}>
                    {informedByLabel}
                  </Select.Option>
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
            <Item label="Parent Workflow Step">
              <Select value={parentLabel} disabled>
                <Select.Option value={parentLabel ? parentLabel : ''}>
                  {parentLabel}
                </Select.Option>
              </Select>
            </Item>
          </Col>
          <Col {...columnLayout}>
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
            <Item
              label="Description *"
              validateStatus={descriptionError ? 'error' : ''}
              help={descriptionError && 'Please enter a description'}
            >
              <Input.TextArea
                value={description}
                onChange={onChangeDescription}
              />
            </Item>
            <Item label="Summary">
              <Input.TextArea
                value={summary}
                onChange={event => setSummary(event.target.value)}
              />
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

export default WorkflowStepWithActivityForm;
