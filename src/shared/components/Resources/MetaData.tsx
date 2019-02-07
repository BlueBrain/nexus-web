import * as React from 'react';
import { Card } from 'antd';
import { Meta } from 'antd/lib/list/Item';
import moment = require('moment');
import UserAvatar from '../User/avatar';
import TypesIcon from '../Types/TypesIcon';

export interface ResourceMetadataCardProps {
  name?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  constrainedBy: string;
  type?: string[];
}

const ResourceMetadataCard: React.FunctionComponent<
  ResourceMetadataCardProps
> = props => {
  const { constrainedBy, name, createdAt, updatedAt, createdBy, type } = props;
  const [userName] = createdBy.split('/').slice(-1);
  return (
    <Card>
      <Meta
        avatar={<UserAvatar createdBy={createdBy} />}
        title={
          <div
            className="name"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <em style={{ fontSize: '1.2em' }}>{name}</em>
            {!!type && <TypesIcon type={type} />}
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              created by <b>{userName}</b> on{' '}
              {moment(createdAt).format('DD/MM/YYYY')}
            </div>
            {updatedAt !== createdAt && (
              <div>last updated {moment(updatedAt).fromNow()}</div>
            )}
            <div>
              schema: <b>{constrainedBy}</b>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ResourceMetadataCard;
