import * as React from 'react';
import { ACL } from '@bbp/nexus-sdk';
import './ACLs.less';
interface ACLsFormProps {
  acls: ACL[];
  path: string;
  permissionList?: [];
}
declare const ACLsForm: React.FunctionComponent<ACLsFormProps>;
export default ACLsForm;
