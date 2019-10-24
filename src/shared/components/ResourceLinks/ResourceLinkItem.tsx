import * as React from 'react';
import { Tooltip } from 'antd';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { ResourceLink } from '@bbp/nexus-sdk';

import './ResourceLinkItem.less';
import { labelOf } from '../../utils';

const ResourceLinkItem: React.FunctionComponent<{ link: ResourceLink }> = ({
  link,
}) => {
  const paths = Array.isArray(link.paths) ? link.paths : [link.paths];
  return (
    <div className="link-item">
      <div className="label">
        <Tooltip title={link['@id']}>{labelOf(link['@id'])}</Tooltip>
      </div>
      <div className="description">
        <div>{paths.map(labelOf).join(', ')}</div>
      </div>
    </div>
  );
};

export default ResourceLinkItem;
