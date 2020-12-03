import * as React from 'react';
import { Col, Row, Button, Select } from 'antd';
import * as moment from 'moment';

import { getUsername } from '../../../shared/utils';

import './LinkActivityForm.less';

const { Option } = Select;

const LinkActivityForm: React.FC<{
  activity: {
    name: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
  };
}> = ({ activity }) => {
  const { name, createdBy, createdAt } = activity;

  const columnLayout = {
    xs: 12,
    sm: 12,
    md: 6,
  };

  return (
    <div className="link-activity-form">
      <h2 className="link-activity-form__title">Link Activity to Step</h2>

      <Row gutter={24}>
        <Col {...columnLayout}>
          <p>Resource name</p>
          <p>Activity type</p>
          <p>Created by</p>
          <p>Created on</p>
        </Col>
        <Col {...columnLayout}>
          <p>{name}</p>
          <p>{name}</p>
          <p>{getUsername(createdBy)}</p>
          <p>{moment(createdAt).format('L')}</p>
        </Col>
        <Col {...columnLayout}>
          <p>Input data</p>
          <p>Output data</p>
          <p>Code</p>
        </Col>
        <Col {...columnLayout}>
          <p>{name}</p>
          <p>{name}</p>
          <p>{name}</p>
        </Col>
      </Row>
      <br />
      <div className="link-activity-form__selection">
        <div>
          <span className="link-activity-form__label">Link to Step</span>
          <Select defaultValue="123">
            <Option value="123">Pre-filled Step</Option>
          </Select>
        </div>
        <div>
          <Button onClick={() => {}}>Cancel</Button>
          <Button onClick={() => {}} type="primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkActivityForm;
