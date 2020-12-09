import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import TypesIconList from '../Types/TypesIcon';
import { getResourceLabel } from '../../utils';

const ResourceHit: React.FC<{ resource: Resource }> = ({ resource }) => {
  const title = getResourceLabel(resource);
  const typeList =
    !!resource['@type'] &&
    (Array.isArray(resource['@type']) ? (
      <TypesIconList type={resource['@type']} />
    ) : (
      <TypesIconList type={[resource['@type']]} />
    ));
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}
      <span>{typeList}</span>
    </div>
  );
};

export default ResourceHit;
