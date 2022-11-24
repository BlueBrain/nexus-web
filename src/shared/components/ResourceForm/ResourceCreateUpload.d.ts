import * as React from 'react';
import './ResourceCreateUpload.less';
import { Resource, ResourcePayload } from '@bbp/nexus-sdk';
declare const ResourceCreateUpload: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  createResource: (
    schemaId: string,
    payload: ResourcePayload
  ) => Promise<Resource>;
}>;
export default ResourceCreateUpload;
