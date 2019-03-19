import * as React from 'react';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Meta } from 'antd/lib/list/Item';
import * as moment from 'moment';
import UserAvatar from '../User/Avatar';
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
  // const [userName] = createdBy.split('/').slice(-1);
  const [userName] = '';
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
                      style={{ margin: '0 1em' }}
                      size="small"
                      icon={copySuccess ? 'check' : 'copy'}
                      onClick={() => triggerCopy()}
                    >
                      @id
                    </Button>
                  </Tooltip>
                )}
              />

              <Copy
                textToCopy={self}
                render={(copySuccess, triggerCopy) => (
                  <Tooltip title={copySuccess ? 'Copied!' : 'Copy _self'}>
                    <Button
                      size="small"
                      icon={copySuccess ? 'check' : 'copy'}
                      onClick={() => triggerCopy()}
                    >
                      _self
                    </Button>
                  </Tooltip>
                )}
              />
            </div>
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 22 }}>
              {!!type && <TypesIcon type={type} full={true} />}
            </div>
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
