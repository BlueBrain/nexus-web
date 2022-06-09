import * as React from 'react';
import * as moment from 'moment';
import { Card, Button, Tooltip, Divider } from 'antd';
import { DownOutlined, CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Resource } from '@bbp/nexus-sdk';

import TypesIcon from '../Types/TypesIcon';
import Copy from '../Copy';
import { getUsername, getResourceLabel } from '../../utils';

import './ResourceCard.less';
import SchemaLink from '../SchemaLink';
import FriendlyTimeAgo from '../FriendlyDate';

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
            render={(copySuccess, triggerCopy) => (
              <Tooltip title={copySuccess ? 'Copied!' : `Copy ${id}`}>
                <Button
                  size="small"
                  icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerCopy(id);
                  }}
                >
                  Identifier
                </Button>
              </Tooltip>
            )}
          />{' '}
          <Copy
            render={(copySuccess, triggerCopy) => (
              <Tooltip title={copySuccess ? 'Copied!' : `Copy ${self}`}>
                <Button
                  size="small"
                  icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerCopy(self);
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
        <div>
          <span>
            <b>Created:</b>
          </span>{' '}
          <FriendlyTimeAgo date={moment(createdAt)} /> <b>by</b> {userName}
        </div>
        <div>
          <span>
            <b>Updated:</b>
          </span>{' '}
          <FriendlyTimeAgo date={moment(updatedAt)} />
        </div>
        <div>
          <span>
            <b>Revision:</b>
          </span>{' '}
          {rev}
        </div>
        <div>
          <span>
            <b>Schema:</b>
          </span>{' '}
          {schemaLink({ resource })}
        </div>
        <div>
          {!!type && (
            <>
              <Divider />
              <div>{!!type && <TypesIcon type={types} full={true} />}</div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ResourceCardComponent;
