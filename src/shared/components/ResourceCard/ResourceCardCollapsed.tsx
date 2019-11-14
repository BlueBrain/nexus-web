import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Card, Descriptions } from 'antd';

import TypesIcon from '../Types/TypesIcon';

const ResourceCardCollapsed: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const {
    _constrainedBy: constrainedBy,
    _self: self,
    '@type': type,
    '@id': id,
  } = resource;
  const types: string[] = Array.isArray(type) ? type : [type || ''];
  
  return (
    <Card size="small" style={{ width: '600px' }}>
      <Descriptions size={'small'}>
        <Descriptions.Item label="Schema">
          <a href={constrainedBy} target="_blank">
            {constrainedBy}
          </a>
        </Descriptions.Item>
      </Descriptions>
      {!!type && (
        <div>{!!type && <TypesIcon type={types} full={true} />}</div>
      )}
    </Card>
  )
}

export default ResourceCardCollapsed;