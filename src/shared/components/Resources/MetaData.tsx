import * as React from 'react';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Meta } from 'antd/lib/list/Item';
import moment = require('moment');
import UserAvatar from '../User/avatar';
import TypesIcon from '../Types/TypesIcon';
import Copy from '../Copy';

export interface ResourceMetadataCardProps {
  name?: string;
  id: string;
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
    id,
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
              <Tooltip title={self}>
                <em style={{ fontSize: '1.2em', marginRight: '4px' }}>
                  {name}
                </em>
              </Tooltip>
              <Copy
                textToCopy={id}
                render={(copySuccess, triggerCopy) => (
                  <Tooltip title={copySuccess ? 'Copied!' : 'Copy @id'}>
                    <Button
                      size="small"
                      icon={copySuccess ? 'check' : 'copy'}
                      onClick={() => triggerCopy()}
                    >
                      ID
                    </Button>
                  </Tooltip>
                )}
              />
            </div>
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>{!!type && <TypesIcon type={type} />}</div>
            <div>
              created by <b>{userName}</b> on{' '}
              {moment(createdAt).format('DD/MM/YYYY')}
            </div>
            <div>
              <Tooltip title={`Revision #${rev}`}>
                <Icon type="file-sync" /> <em>v.{rev}</em>{' '}
              </Tooltip>
              {updatedAt !== createdAt && (
                <span>, last updated {moment(updatedAt).fromNow()}</span>
              )}
            </div>
            <div>
              schema:{' '}
              <a href={constrainedBy} target="_blank">
                {constrainedBy}
              </a>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ResourceMetadataCard;
