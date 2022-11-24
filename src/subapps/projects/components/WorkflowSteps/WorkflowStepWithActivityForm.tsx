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
  Modal,
} from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import { Status, StepResource, WorkflowStepMetadata } from '../../types';
import { isEmptyInput } from '../../utils';

import './WorkflowStepWithActivityForm.less';

const WorkflowStepWithActivityForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: WorkflowStepMetadata): void;
  onDeprecate?(): any;
  busy: boolean;
  parentLabel?: string | undefined;
  layout?: 'vertical' | 'horisontal';
  title?: string;
  workflowStep?: StepResource;
  informedByIds?: string[];
  siblings?: {
    name: string;
    '@id': string;
  }[];
  activityList: {
    label: string;
    '@id': string;
  }[];
  allowActivitySearch?: boolean;
  defaultActivityType?: string;
  isFullForm?: boolean;
  hideDescription?: boolean;
}> = ({
  onClickCancel,
  onSubmit,
  onDeprecate,
  busy,
  parentLabel,
  layout,
  title,
  workflowStep,
  informedByIds,
  siblings,
  isFullForm,
  hideDescription = false,
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

  const [nameError, setNameError] = React.useState<boolean>(false);

  const [informedBy, setInformedBy] = React.useState<string[]>(
    informedByIds ? informedByIds : []
  );

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
          md: 24,
        };

  const isValidInput = () => {
    let isValid = true;

    if (isEmptyInput(name)) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }

    return isValid;
  };

  const onChangeName = (event: any) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
  };

  const onChangeDate = (date: any) => {
    setDueDate(moment(date).format());
  };

  const onChangeInformedBy = (selected: string[]) => {
    if (selected) {
      setInformedBy(selected);
    } else {
      setInformedBy([]);
    }
  };

  const onClickSubmit = () => {
    if (isValidInput()) {
      const data: any = {
        name,
        activityType,
        description,
        summary,
        dueDate,
        status,
      };

      if (informedBy) {
        data.wasInformedBy = informedBy.map(i => {
          return { '@id': i };
        });
      }

      onSubmit(data);
    }
  };

  const { Item } = Form;

  return (
    <Form {...formItemLayout} className="workflow-step-form">
      {title && <h2 className="workflow-step-form__title">{title}</h2>}
      <Spin spinning={busy} tip="Please wait...">
        <Row gutter={24}>
          <Col {...columnLayout}>
            <Item
              label="Name *"
              validateStatus={nameError ? 'error' : ''}
              help={nameError && 'Please enter a name'}
              tooltip={{
                title: '',
                icon: <InfoCircleOutlined />,
              }}
            >
              <Input
                value={name}
                onChange={onChangeName}
                placeholder={'<step-name>'}
              />
            </Item>
            <Item label="Previous Steps">
              <Select
                mode="multiple"
                onChange={onChangeInformedBy}
                value={informedBy}
                defaultValue={informedBy}
                allowClear
                size={'middle'}
                placeholder="<step-name>"
              >
                {siblings && siblings.length > 0 ? (
                  siblings.map(sibling => (
                    <Select.Option value={sibling['@id']} key={sibling['@id']}>
                      {sibling.name}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value={''}>{''}</Select.Option>
                )}
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
          {isFullForm ? (
            <Col {...columnLayout}>
              <Item label="Provisional End Date">
                <DatePicker
                  allowClear={false}
                  value={dueDate ? moment(dueDate) : null}
                  onChange={onChangeDate}
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
              {!hideDescription && (
                <Item label="Description">
                  <Input.TextArea
                    value={description}
                    onChange={onChangeDescription}
                  />
                </Item>
              )}
              <Item label="Summary">
                <Input.TextArea
                  value={summary}
                  onChange={event => setSummary(event.target.value)}
                />
              </Item>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col {...columnLayout} style={{ textAlign: 'left' }}>
            <em>* Mandatory fields</em>
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            {workflowStep ? (
              <Button
                style={{ margin: '10px 10px 10px 0' }}
                onClick={() => {
                  Modal.confirm({
                    title: 'Deprecate Resource',
                    content: (
                      <>
                        Are you sure you want to deprecate this step? <br />
                        <br />
                        <em>
                          This will result in all substeps and associated tables
                          also being deprecated.
                        </em>
                      </>
                    ),
                    onOk: () => {
                      onDeprecate && onDeprecate();
                    },
                  });
                }}
                type="default"
                icon={<DeleteOutlined />}
                danger={true}
              >
                Deprecate
              </Button>
            ) : (
              <></>
            )}
          </Col>
          <Col span={10} offset={10}>
            <div
              style={{ textAlign: 'right', width: '100%' }}
              className="workflow-step-form__buttons"
            >
              <Button
                style={{ margin: '10px 10px 10px 0' }}
                onClick={onClickCancel}
              >
                Cancel
              </Button>
              <Button
                style={{ margin: '10px 10px 10px 0' }}
                onClick={onClickSubmit}
                type="primary"
              >
                Save
              </Button>
            </div>
          </Col>
        </Row>
      </Spin>
    </Form>
  );
};

export default WorkflowStepWithActivityForm;
