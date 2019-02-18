import * as React from 'react';
import { Checkbox, Divider } from 'antd';
import { ACL } from '@bbp/nexus-sdk';

import './ACLs.less';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

interface ACLsFormProps {
  acls: ACL[];
  permissionList?: [];
}
const ACLsForm: React.FunctionComponent<ACLsFormProps> = props => {
  return (
    <div className="ACLs-form">
      <p>lol</p>
    </div>
  );
};

export default ACLsForm;
