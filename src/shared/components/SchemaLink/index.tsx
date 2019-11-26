import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';

const SchemaLink: React.FunctionComponent<{
  resource: Resource;
  goToSchema?(): void;
}> = ({ resource: { _constrainedBy: constrainedBy }, goToSchema }) => (
  <a
    href={constrainedBy}
    target="_blank"
    onClick={e => {
      if (goToSchema) {
        e.preventDefault();
        goToSchema();
      }
    }}
  >
    {constrainedBy}
  </a>
);

export default SchemaLink;
