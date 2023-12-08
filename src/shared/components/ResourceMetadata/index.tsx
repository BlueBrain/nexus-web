import { Resource } from '@bbp/nexus-sdk/lib/types';
import { Col, Row, Tag } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { getUsername } from '../../utils';
import FriendlyTimeAgo from '../FriendlyDate';

const ResourceMetadata: React.FC<{
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
            <Link to={`/orgs/${orgLabel}`} target="_blank" rel="noopener noreferrer">
              {orgLabel}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Project:</b>{' '}
            <Link
              to={`/orgs/${orgLabel}/${projectLabel}`}
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
            {[resource['@type']].flat().map((el, ix) => {
              return <Tag key={ix}>{el}</Tag>;
            })}
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row>
          <Col>
            <b>Created:</b> <FriendlyTimeAgo date={moment(resource._createdAt)} />
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Created By:</b> {getUsername(resource._createdBy)}
          </Col>
        </Row>

        <Row>
          <Col>
            <b>Updated:</b> <FriendlyTimeAgo date={moment(resource._updatedAt)} />
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Updated By:</b> {getUsername(resource._updatedBy)}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ResourceMetadata;
