import { Empty, Skeleton } from 'antd';
import * as React from 'react';

import InfiniteSearch from '../List/InfiniteSearch';
import ListItem from '../List/Item';
import ResourceLinkItem, { ResourceLinkAugmented } from './ResourceLinkItem';

const ResourceLinks: React.FunctionComponent<{
  busy: boolean;
  error: Error | null;
  links: ResourceLinkAugmented[];
  total: number;
  onLoadMore: () => void;
  onClick?: (link: ResourceLinkAugmented) => void;
}> = (props) => {
  const { busy, error, links, total, onLoadMore, onClick } = props;
  const scrollParent = React.useRef<HTMLDivElement>(null);
  const hasMore = links.length < total;
  const firstLoad = busy && links.length === 0;

  return (
    <div className="resource-links" ref={scrollParent}>
      {firstLoad ? (
        <Skeleton active />
      ) : (
        <>
          {!!error && <Empty description={error.message} />}
          {!error && (
            <InfiniteSearch
              dataLength={links.length}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              hasSearch={false}
              scrollParent={scrollParent.current}
            >
              {links.map((link) => (
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
