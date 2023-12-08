import './LinkActivityForm.scss';

import { Button, Col, Row, Select } from 'antd';
import moment from 'moment';
import * as React from 'react';

import TypesIconList from '../../../shared/components/Types/TypesIcon';
import { getDateString, getUsername, labelOf } from '../../../shared/utils';

const { Option } = Select;

const LinkActivityForm: React.FC<{
  activity: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    resourceType: string;
  };
  stepsList: {
    id: string;
    name: string;
    parentSteps: { id: string; name: string }[];
  }[];
  onSubmit: (value: string) => void;
  onCancel: () => void;
}> = ({ activity, stepsList, onSubmit, onCancel }) => {
  const [selectedStep, setSelectedStep] = React.useState<string>('');
  const { name, createdBy, createdAt, resourceType, resourceId } = activity;

  const renderOptions = () => {
    return stepsList.map(step => (
      <Option key={step.id} value={step.id}>
        {step.parentSteps
          .reverse()
          .map(parentStep => parentStep.name)
          .join(' > ')}
        {step.parentSteps.length > 0 ? ' > ' : ''}
        {step.name}
      </Option>
    ));
  };

  const onClickSave = () => {
    onSubmit(selectedStep);
  };

  return (
    <div className="link-activity-form">
      <h2 className="link-activity-form__title">
        Link Activity to Workflow Step
      </h2>
      <Row>
        <Col xs={9} sm={9} md={9}>
          <p>
            <b>Resource</b>
          </p>
        </Col>
        <Col xs={15} sm={15} md={15}>
          <p>{name || labelOf(resourceId)}</p>
        </Col>
      </Row>
      <Row>
        <Col xs={9} sm={9} md={9}>
          <p>
            <b>Activity type</b>
          </p>
        </Col>
        {/* TODO: manage multiple types */}
        <Col xs={15} sm={15} md={15}>
          <p className="link-activity-form__types">
            {resourceType && Array.from(resourceType).length > 0 ? (
              <TypesIconList
                type={Array.from(resourceType).map(type => labelOf(type))}
              />
            ) : (
              'No data'
            )}
          </p>
        </Col>
      </Row>
      <Row>
        <Col xs={9} sm={9} md={9}>
          {/* TODO: fetch an agent */}
          <p>
            <b>Created by</b>
          </p>
        </Col>
        <Col xs={15} sm={15} md={15}>
          <p>{getUsername(createdBy)}</p>
        </Col>
      </Row>
      <Row>
        <Col xs={9} sm={9} md={9}>
          <p>
            <b>Created on</b>
          </p>
        </Col>
        <Col xs={15} sm={15} md={15}>
          <p>{getDateString(moment(createdAt), { noTime: true })}</p>
        </Col>
      </Row>
      <br />
      <div className="link-activity-form__selection">
        <div>
          <span className="link-activity-form__label">Link to Step</span>
          <Select
            onChange={(value: string) => setSelectedStep(value)}
            style={{ width: '250px' }}
          >
            {renderOptions()}
          </Select>
        </div>
        <div>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onClickSave} type="primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkActivityForm;
