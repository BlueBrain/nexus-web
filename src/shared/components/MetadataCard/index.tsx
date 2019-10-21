import * as React from 'react';
import * as moment from 'moment';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Meta } from 'antd/lib/list/Item';
import { Resource } from '@bbp/nexus-sdk';

import TypesIcon from '../Types/TypesIcon';
import UserAvatar from '../User/Avatar';
import Copy from '../Copy';
import { getUsername } from '../../utils';

import './MetadataCard.less';

const MetadataCardComponent: React.FunctionComponent<{
  // TODO: fix type when sdk has generic Resource types
  resource: Resource & { [key: string]: any };
  preview?: React.ReactNode;
}> = props => {
  const {
    preview,
    resource: {
      _rev,
      '@type': type,
      '@id': id,
      _self,
      _constrainedBy,
      _createdAt,
      _updatedAt,
      _createdBy,
    },
  } = props;

  const name = props.resource.name || props.resource.label || id;
  const userName = getUsername(_createdBy);
  const types: string[] = Array.isArray(type) ? type : [type];

  return (
    <Card className="metadata-card" cover={preview}>
      <Meta
        title={
          <div className="name">
            <div>
              <em>{name}</em>
              <Copy
                textToCopy={id}
                render={(copySuccess, triggerCopy) => (
                  <Tooltip title={copySuccess ? 'Copied!' : 'Copy Identifier'}>
                    <Button
                      size="small"
                      icon={copySuccess ? 'check' : 'copy'}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerCopy();
                      }}
                    >
                      Identifier
                    </Button>
                  </Tooltip>
                )}
              />

              <Copy
                textToCopy={_self}
                render={(copySuccess, triggerCopy) => (
                  <Tooltip
                    title={copySuccess ? 'Copied!' : 'Copy Nexus Address'}
                  >
                    <Button
                      size="small"
                      icon={copySuccess ? 'check' : 'copy'}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerCopy();
                      }}
                    >
                      Nexus Address
                    </Button>
                  </Tooltip>
                )}
              />
            </div>
          </div>
        }
        description={
          <div>
            <div>{!!type && <TypesIcon type={types} full={true} />}</div>
            <div>
              created by <b>{userName}</b> on{' '}
              {moment(_createdAt).format('DD/MM/YYYY')}
            </div>
            <div>
              <Icon type="file-sync" /> <em>revision: {_rev}</em>{' '}
              {_updatedAt !== _createdAt && (
                <span>, last updated {moment(_updatedAt).fromNow()}</span>
              )}
            </div>
            <div>
              schema:{' '}
              <a href={_constrainedBy} target="_blank">
                {_constrainedBy}
              </a>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default MetadataCardComponent;
