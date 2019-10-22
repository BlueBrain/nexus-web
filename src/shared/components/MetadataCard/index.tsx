import * as React from 'react';
import * as moment from 'moment';
import { Card, Button, Tooltip, Divider, Descriptions } from 'antd';
import { Resource } from '@bbp/nexus-sdk';

import TypesIcon from '../Types/TypesIcon';
import Copy from '../Copy';
import { getUsername, getResourceLabel } from '../../utils';

import './MetadataCard.less';

const MetadataCardComponent: React.FunctionComponent<{
  // TODO: fix type when sdk has generic Resource types
  resource: Resource & { [key: string]: any };
  preview?: React.ReactNode;
}> = ({ resource, preview }) => {
  // in case the resource has been expanded, all the metadata values
  // would be replaced by their graph predicate IRI
  // in this case we put them back as
  // eg:  _rev instead of https://bluebrain.github.io/nexus/vocabulary/rev
  const processedResource = Object.keys(resource).reduce(
    (memo: { [key: string]: any }, key: string) => {
      const value = resource[key]['@id'] ? resource[key]['@id'] : resource[key];
      memo[
        key.replace('https://bluebrain.github.io/nexus/vocabulary/', '_')
      ] = value;
      return memo;
    },
    { ...resource }
  );
  const {
    '@id': id,
    '@type': type,
    _createdBy: createdBy,
    _createdAt: createdAt,
    _updatedAt: updatedAt,
    _constrainedBy: constrainedBy,
    _rev: rev,
    _self: self,
  } = processedResource;
  const userName = getUsername(createdBy);
  const label = getResourceLabel(resource);
  const types: string[] = Array.isArray(type) ? type : [type];

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
          />

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
            <a href={constrainedBy} target="_blank">
              {constrainedBy}
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
