import * as React from 'react';
import * as moment from 'moment';
import {
  Card,
  Icon,
  Button,
  Tooltip,
  Divider,
  Statistic,
  Descriptions,
} from 'antd';
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
    <Card
      className="metadata-card"
      cover={preview}
      title={name}
      extra={
        <div className="actions">
          <Copy
            textToCopy={id}
            render={(copySuccess, triggerCopy) => (
              <Tooltip title={copySuccess ? 'Copied!' : `Copy ${id}`}>
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
              <Tooltip title={copySuccess ? 'Copied!' : `Copy ${_self}`}>
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
      }
    >
      <div>
        <Descriptions size={'small'}>
          <Descriptions.Item label="Created">
            {moment(_createdAt).format('DD/MM/YYYY')} by <b>{userName}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {moment(_updatedAt).fromNow()}
          </Descriptions.Item>
          <Descriptions.Item label="Revision">{_rev}</Descriptions.Item>
          <Descriptions.Item label="Schema">
            <a href={_constrainedBy} target="_blank">
              {_constrainedBy}
            </a>
          </Descriptions.Item>
        </Descriptions>
        {!!type && (
          <>
            <Divider />
            <div>{!!type && <TypesIcon type={types} full={true} />}</div>
          </>
        )}
      </div>
    </Card>
  );
};

export default MetadataCardComponent;
