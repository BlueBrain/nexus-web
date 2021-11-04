import * as React from 'react';
import { Col, Row, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { getUsername } from '../utils';
import { Resource } from '@bbp/nexus-sdk/lib/types';
import * as moment from 'moment';

const ResourceViewMetadata: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel }) => {
  return (
    <Row>
      <Col span={12}>
        <Row>
          <Col>
            <b>Organization:</b>{' '}
            <Link
              to={`/admin/${orgLabel}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {orgLabel}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Project:</b>{' '}
            <Link
              to={`/admin/${orgLabel}/${projectLabel}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {projectLabel}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Type(s):</b>{' '}
            {[resource?.['@type']].flat().map((el, ix) => {
              return <Tag key={ix}>{el}</Tag>;
            })}
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row>
          <Col>
            <b>Created At:</b> {moment(resource?._createdAt).format()}
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Created By:</b>{' '}
            {resource ? getUsername(resource._createdBy) : ''}
          </Col>
        </Row>

        <Row>
          <Col>
            <b>Updated At:</b> {moment(resource?._updatedAt).format()}
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Updated By:</b>{' '}
            {resource ? getUsername(resource._updatedBy) : ''}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ResourceViewMetadata;
