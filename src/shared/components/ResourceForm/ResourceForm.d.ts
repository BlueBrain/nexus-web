import * as React from 'react';
import { ResourcePayload } from '@bbp/nexus-sdk';
import './ResourceForm.less';
export interface ResourceFormProps {
  resource?: {
    schemaId: string;
    payload: ResourcePayload;
  };
  busy?: boolean;
  onSubmit(resource: {
    schemaId: string;
    payload: ResourcePayload;
  }): Promise<boolean>;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}
/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
declare const ResourceForm: React.FunctionComponent<ResourceFormProps>;
export default ResourceForm;
