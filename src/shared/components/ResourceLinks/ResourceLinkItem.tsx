import './ResourceLinkItem.scss';

import { Resource,ResourceLink } from '@bbp/nexus-sdk/es';
import { Tooltip } from 'antd';
import * as React from 'react';

import { labelOf } from '../../utils';
import TypesIconList from '../Types/TypesIcon';

export type ResourceLinkAugmented = ResourceLink &
  Resource & {
    isRevisionSpecific: boolean;
    originalLinkID: string;
  };

const ResourceLinkItem: React.FunctionComponent<{
  link: ResourceLinkAugmented;
  onInternalClick?: (internalLink: ResourceLinkAugmented) => void;
}> = ({ link, onInternalClick }) => {
  const isInternal = !!(link as Resource)._self;
  const paths = link.paths
    ? Array.isArray(link.paths)
      ? link.paths
      : [link.paths]
    : [];

  return (
    <div
      className="link-item"
      onClick={() => {
        isInternal
          ? // link inside nexus
            onInternalClick && onInternalClick(link)
          : // normal link to the internet
            window && window.open(link['@id'], '_blank');
      }}
    >
      <div className="label">
        <Tooltip title={link['originalLinkID']}>
          {isInternal ? (
            labelOf(link['originalLinkID'])
          ) : (
            <a href={link['originalLinkID']} target="_blank" rel="noreferrer">
              {link['originalLinkID']}
            </a>
          )}
        </Tooltip>
      </div>
      <div className="description">
        <div>{paths.map(labelOf).join(', ')}</div>
      </div>
      <div className="types">
        {!!link['@type'] &&
          (Array.isArray(link['@type']) ? (
            <TypesIconList type={link['@type']} />
          ) : (
            <TypesIconList type={[link['@type']]} />
          ))}
      </div>
    </div>
  );
};

export default ResourceLinkItem;
