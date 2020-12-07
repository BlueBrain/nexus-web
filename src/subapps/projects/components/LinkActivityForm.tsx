import * as React from 'react';
import { Col, Row, Button, Select } from 'antd';
import * as moment from 'moment';

import { getUsername, labelOf } from '../../../shared/utils';

import './LinkActivityForm.less';

const { Option } = Select;

const LinkActivityForm: React.FC<{
  activity: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    usedList?: string[];
    generatedList?: string[];
    resourceType?: string;
  };
  stepsList: {
    id: string;
    name: string;
  }[];
  onSubmit: (value: string) => void;
}> = ({ activity, stepsList, onSubmit }) => {
  const [selectedStep, setSelectedStep] = React.useState<string>('');
  const {
    name,
    createdBy,
    createdAt,
    usedList,
    generatedList,
    resourceType,
    resourceId,
  } = activity;

  const columnLayoutProperties = {
    xs: 12,
    sm: 12,
    md: 3,
  };

  const columnLayout = {
    xs: 12,
    sm: 12,
    md: 9,
  };

  const renderOptions = () => {
    return stepsList.map(step => (
      <Option key={step.id} value={step.id}>
        {step.name}
      </Option>
    ));
  };

  const onClickSave = () => {
    onSubmit(selectedStep);
  };

  return (
    <div className="link-activity-form">
      <h2 className="link-activity-form__title">Link Activity to Step</h2>

      <Row gutter={24}>
        <Col {...columnLayoutProperties}>
          <p>Resource</p>
          <p>Activity type</p>
          {/* TODO: fetch an agent */}
          <p>Created by</p>
          <p>Created on</p>
        </Col>
        <Col {...columnLayout}>
          <p>
            <b>{name || labelOf(resourceId)}</b>
          </p>
          {/* TODO: manage multiple types */}
          <p>{resourceType}</p>
          <p>{getUsername(createdBy)}</p>
          <p>{moment(createdAt).format('L')}</p>
        </Col>
        <Col {...columnLayoutProperties}>
          <p>Input data</p>
          <p>Output data</p>
          <p>Code</p>
        </Col>
        <Col {...columnLayout}>
          <p>
            {usedList
              ? Array.from(usedList).map(outputId => <p>{labelOf(outputId)}</p>)
              : 'No data'}
          </p>
          <p>
            {generatedList
              ? Array.from(generatedList).map(outputId => (
                  <p>{labelOf(outputId)}</p>
                ))
              : 'No data'}
          </p>
          <p>Coming soon...</p>
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
          <Button onClick={() => {}}>Cancel</Button>
          <Button onClick={onClickSave} type="primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkActivityForm;
