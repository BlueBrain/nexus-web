import * as React from 'react';
import * as moment from 'moment';
import { Resource } from '@bbp/nexus-sdk';
import SchemaLink from '../SchemaLink';
import { getUsername } from '../../utils';

import './ResourceMetadata.less';

const ResourceMetada: React.FC<{
  resource: Resource;
  schemaLink?: React.FunctionComponent<{
    resource: Resource;
  }>;
}> = ({ resource, schemaLink = SchemaLink }) => {
  console.log('resource', resource);
  const {
    _constrainedBy: constrainedBy,
    _createdBy,
    _createdAt,
    _updatedAt: updatedAt,
    _rev,
    _self: self,
    '@type': type,
    '@id': id,
  } = resource;
  const userName = getUsername(_createdBy);

  return (
    <div className="resource-metadata">
      <p>
        <b>Created by: </b>
        {userName}
      </p>
      <p>
        <b>Created on: </b>
        {moment(_createdAt).format('DD/MM/YYYY')}
      </p>
      <p>
        <b>Revision: </b>
        {_rev}
      </p>
      <p>
        <b>Schema: </b>
        <span>{schemaLink({ resource })}</span>
      </p>
    </div>
  );
};

export default ResourceMetada;
