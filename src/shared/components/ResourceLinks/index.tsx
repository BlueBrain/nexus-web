import * as React from 'react';
import { Spin, Empty, Skeleton } from 'antd';
import { ResourceLink } from '@bbp/nexus-sdk';

import ListItem from '../List/Item';
import ResourceLinkItem from './ResourceLinkItem';
import InfiniteSearch from '../List/InfiniteSearch';

const ResourceLinks: React.FunctionComponent<{
  firstLoad: boolean;
  error: Error | null;
  links: ResourceLink[];
  total: number;
  onLoadMore: () => void;
  onClick?: (link: ResourceLink) => void;
}> = props => {
  const { firstLoad, error, links, total, onLoadMore, onClick } = props;
  const scrollParent = React.useRef<HTMLDivElement>(null);
  const hasMore = links.length < total;

  return (
    <div className="resource-links" ref={scrollParent}>
      {firstLoad ? (
        <Skeleton active></Skeleton>
      ) : (
        <>
          {!!error && <Empty description={error.message} />}
          {!error && (
            <InfiniteSearch
              dataLength={links.length}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              hasSearch={false}
            >
              {links.map(link => (
                <ListItem key={link['@id']}>
                  <ResourceLinkItem link={link} onInternalClick={onClick} />
                </ListItem>
              ))}
            </InfiniteSearch>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceLinks;
