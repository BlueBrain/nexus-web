import * as React from 'react';
import { Popover, Card } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './Resources.less';
import { Meta } from 'antd/lib/list/Item';
import moment = require('moment');

export interface ResourceItemProps extends ResourceMetadataCardProps {
  id: string;
  type?: string[];
  onClick?(): void;
  onEdit?(): void;
}

export interface ResourceMetadataCardProps {
  name?: string;
  createdAt: string;
  updatedAt: string;
  constrainedBy: string;
}

const ResourceMetadataCard: React.FunctionComponent<
  ResourceMetadataCardProps
> = props => {
  const { constrainedBy, name, createdAt, updatedAt } = props;
  return (
    <Card>
      <Meta
        title={
          <div
            className="name"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <em>{name}</em>
            <span>{moment(createdAt).format('DD/MM/YYYY')}</span>
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>last updated {moment(updatedAt).fromNow()}</div>
            <div>
              constrained by <b>{constrainedBy}</b>
            </div>
          </div>
        }
      />
    </Card>
  );
};

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = props => {
  const { type, name, onClick = () => {} } = props;
  return (
    <Popover content={<ResourceMetadataCard {...props} />}>
      <div className="clickable-container resource-item" onClick={onClick}>
        <div className="name">
          <em>{name}</em>
        </div>
        {type && type.length && <TypesIcon type={type} />}
      </div>
    </Popover>
  );
};

export default ResourceListItem;
