import * as React from 'react';
import { Tooltip } from 'antd';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';

import './ResourceLinkItem.less';
import { labelOf } from '../../utils';

const ResourceLinkItem: React.FunctionComponent<{
  link: ResourceLink;
  onInternalClick?: (internalLink: ResourceLink) => void;
}> = ({ link, onInternalClick }) => {
  const isInternal = !!(link as Resource)._self;
  const paths = Array.isArray(link.paths) ? link.paths : [link.paths];
  return (
    <div
      className="link-item"
      onClick={() => {
        isInternal
          ? // link inside nexus
            onInternalClick && onInternalClick(link)
          : // normal link to the internet
            window && window.open(link['@id'], '_blanl');
      }}
    >
      <div className="label">
        <Tooltip title={link['@id']}>
          {isInternal ? (
            labelOf(link['@id'])
          ) : (
            <a href={link['@id']} target="_blank">
              {link['@id']}
            </a>
          )}
        </Tooltip>
      </div>
      <div className="description">
        <div>{paths.map(labelOf).join(', ')}</div>
      </div>
    </div>
  );
};

export default ResourceLinkItem;
