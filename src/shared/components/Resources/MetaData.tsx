import * as React from 'react';
import { Card, Icon, Button } from 'antd';
import { Meta } from 'antd/lib/list/Item';
import moment = require('moment');
import UserAvatar from '../User/avatar';
import TypesIcon from '../Types/TypesIcon';
import Copy from '../Copy';

export interface ResourceMetadataCardProps {
  name?: string;
  self: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  constrainedBy: string;
  rev: number;
  type?: string[];
}

const ResourceMetadataCard: React.FunctionComponent<
  ResourceMetadataCardProps
> = props => {
  const {
    self,
    constrainedBy,
    name,
    createdAt,
    updatedAt,
    createdBy,
    type,
    rev,
  } = props;
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
            <div style={{ marginRight: '1em' }}>
              <em style={{ fontSize: '1.2em', marginRight: '4px' }}>{name}</em>
              <Copy
                textToCopy={self}
                render={(copySuccess, triggerCopy) => (
                  <Button
                    icon={copySuccess ? 'check' : 'copy'}
                    onClick={() => triggerCopy()}
                  />
                )}
              />
            </div>
            <div>{!!type && <TypesIcon type={type} />}</div>
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              created by <b>{userName}</b> on{' '}
              {moment(createdAt).format('DD/MM/YYYY')}
            </div>
            <div>
              <Icon type="file-sync" /> <em>v.{rev}</em>{' '}
              {updatedAt !== createdAt && (
                <span>, last updated {moment(updatedAt).fromNow()}</span>
              )}
            </div>
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
