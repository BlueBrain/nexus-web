import * as React from 'react';
import { Tag } from 'antd';
import { OrgResponseCommon } from '@bbp/nexus-sdk';

import './OrgItem.scss';

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
