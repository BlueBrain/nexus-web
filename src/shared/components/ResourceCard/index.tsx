import * as React from 'react';
import * as moment from 'moment';
import { Card, Button, Tooltip, Divider, Descriptions } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk';

import TypesIcon from '../Types/TypesIcon';
import Copy from '../Copy';
import { getUsername, getResourceLabel } from '../../utils';

import './ResourceCard.less';
import SchemaLink from '../SchemaLink';

const ResourceCardComponent: React.FunctionComponent<{
  resource: Resource;
  preview?: React.ReactNode;
  onClickCollapse?(): void;
  schemaLink?: React.FunctionComponent<{
    resource: Resource;
  }>;
}> = ({ resource, preview, onClickCollapse, schemaLink = SchemaLink }) => {
  const {
    _constrainedBy: constrainedBy,
    _createdBy: createdBy,
    _createdAt: createdAt,
    _updatedAt: updatedAt,
    _rev: rev,
    _self: self,
    '@type': type,
    '@id': id,
  } = resource;

  const userName = getUsername(createdBy);
  const label = getResourceLabel(resource);
  const types: string[] = Array.isArray(type) ? type : [type || ''];

  return (
    <Card
      className="metadata-card"
      cover={preview}
      title={label}
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
          />{' '}
          <Copy
            textToCopy={self}
            render={(copySuccess, triggerCopy) => (
              <Tooltip title={copySuccess ? 'Copied!' : `Copy ${self}`}>
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
          {!!onClickCollapse && (
            <>
              <span>&nbsp;</span>
              <Button
                onClick={onClickCollapse}
                shape="circle"
                icon={<DownOutlined />}
                size="small"
              />
            </>
          )}
        </div>
      }
    >
      <div>
        <Descriptions size={'small'}>
          <Descriptions.Item label="Created">
            {moment(createdAt).format('DD/MM/YYYY')} by <b>{userName}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {moment(updatedAt).fromNow()}
          </Descriptions.Item>
          <Descriptions.Item label="Revision">{rev}</Descriptions.Item>
          <Descriptions.Item label="Schema">
            {schemaLink({ resource })}
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

export default ResourceCardComponent;
