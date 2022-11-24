import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
declare const SchemaLink: React.FunctionComponent<{
  resource: Resource;
  goToSchema?(): void;
}>;
export default SchemaLink;
