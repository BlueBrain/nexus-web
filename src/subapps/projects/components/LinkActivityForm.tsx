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
    resourceType: string;
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
      <h2 className="link-activity-form__title">
        Link Activity to Workflow Step
      </h2>

      <Row gutter={24}>
        <Col xs={24} sm={24} md={12}>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Resource</b>
              </p>
            </Col>
            <Col>
              <p>{name || labelOf(resourceId)}</p>
            </Col>
          </Row>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Activity type</b>
              </p>
            </Col>
            {/* TODO: manage multiple types */}
            <Col>
              <p>{labelOf(resourceType)}</p>
            </Col>
          </Row>
          <Row>
            <Col xs={5} sm={5} md={5}>
              {/* TODO: fetch an agent */}
              <p>
                <b>Created by</b>
              </p>
            </Col>
            <Col>
              <p>{getUsername(createdBy)}</p>
            </Col>
          </Row>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Created on</b>
              </p>
            </Col>
            <Col>
              <p>{moment(createdAt).format('L')}</p>
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Input data</b>
              </p>
            </Col>
            <Col>
              <p>
                {usedList && Array.from(usedList).length > 0
                  ? Array.from(usedList).map(outputId => (
                      <p>{labelOf(outputId)}</p>
                    ))
                  : 'No data'}
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Output data</b>
              </p>
            </Col>
            <Col>
              <p>
                {generatedList && Array.from(generatedList).length > 0
                  ? Array.from(generatedList).map(outputId => (
                      <p>{labelOf(outputId)}</p>
                    ))
                  : 'No data'}
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={5} sm={5} md={5}>
              <p>
                <b>Code</b>
              </p>
            </Col>
            <Col>
              <p>Coming soon...</p>
            </Col>
          </Row>
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
