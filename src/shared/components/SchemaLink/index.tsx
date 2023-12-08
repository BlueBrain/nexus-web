import { Resource } from '@bbp/nexus-sdk/es';
import * as React from 'react';

const SchemaLink: React.FunctionComponent<{
  resource: Resource;
  goToSchema?(): void;
}> = ({ resource: { _constrainedBy: constrainedBy }, goToSchema }) =>
  constrainedBy?.includes('unconstrained.json') ? (
    <span>No schema defined for validation</span>
  ) : (
    <a
      href={constrainedBy}
      target="_blank"
      onClick={(e) => {
        if (goToSchema) {
          e.preventDefault();
          goToSchema();
        }
      }}
      rel="noreferrer"
    >
      {constrainedBy}
    </a>
  );

export default SchemaLink;
