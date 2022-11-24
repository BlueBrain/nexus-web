import * as React from 'react';
export interface OrgFormProps {
  org?: {
    label: string;
    description?: string;
    isDeprecated?: boolean;
  };
  busy?: boolean;
  onSubmit?(org: OrgFormProps['org']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}
declare const OrgForm: React.FunctionComponent<OrgFormProps>;
export default OrgForm;
