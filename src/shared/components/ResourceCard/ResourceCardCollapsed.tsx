import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Card, Button } from 'antd';
import { getResourceLabel } from '../../utils';

import TypesIcon from '../Types/TypesIcon';

const ResourceCardCollapsed: React.FunctionComponent<{
  onClickExpand(): void;
  resource: Resource;
}> = ({ onClickExpand, resource }) => {
  const {
    '@type': type,
    '@id': id,
  } = resource;
  const types: string[] = Array.isArray(type) ? type : [type || ''];
  const label = getResourceLabel(resource);
  
  return (
    <Card
      headStyle={{ fontSize: '12px' }}
      bodyStyle={{ padding: '10px 7px 5px 7px' }}
      title={<span>{label}&nbsp;</span>}
      size="small"
      extra={<Button onClick={onClickExpand} shape="circle" icon="up" size="small" />}
      style={{ maxWidth: '600px' }}
    >
      {!!type && (
        <div>{!!type && <TypesIcon type={types} full={true} />}</div>
      )}
    </Card>
  )
}

export default ResourceCardCollapsed;