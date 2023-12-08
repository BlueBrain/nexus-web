import './OrgItem.scss';

import { OrgResponseCommon } from '@bbp/nexus-sdk/es';
import { Tag } from 'antd';
import * as React from 'react';

export const OrgItem: React.FunctionComponent<OrgResponseCommon> = props => {
  return (
    <div className="org-item">
      <p className="label">{props._label}</p>
      {props._deprecated && <Tag color="red">deprecated</Tag>}
      {props.description && <p className="description">{props.description}</p>}
    </div>
  );
};

export default OrgItem;
