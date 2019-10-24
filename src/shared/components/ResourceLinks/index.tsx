import * as React from 'react';
import { Spin, Empty } from 'antd';
import * as InfiniteScroll from 'react-infinite-scroller';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { ResourceLink } from '@bbp/nexus-sdk';

import ListItem from '../List/Item';
import ResourceLinkItem from './ResourceLinkItem';

const ResourceLinks: React.FunctionComponent<{
  busy: boolean;
  error: Error | null;
  links: ResourceLink[];
  total: number;
  onLoadMore: (from: number) => void;
  onClick?: (link: ResourceLink) => void;
}> = props => {
  const { busy, error, links, total, onLoadMore, onClick } = props;
  const scrollParent = React.useRef<HTMLDivElement>(null);
  const hasMore = links.length < total;
  return (
    <div className="resource-links" ref={scrollParent}>
      <Spin spinning={busy}>
        {!!error && <Empty description={error.message} />}
        {!error && (
          <InfiniteScroll
            pageStart={0}
            hasMore={hasMore}
            loadMore={() => {
              // TODO: resolve loadMore infinite loop
              // For now a work around is passing empty function
              // then manually load stuff with the load more button
            }}
            loader={
              <ListItem
                key={'Load More'}
                onClick={() => onLoadMore(links.length)}
              >
                <a>Load More</a>
              </ListItem>
            }
          >
            {links.map(link => (
              <ListItem key={link['@id']}>
                <ResourceLinkItem link={link} onInternalClick={onClick} />
              </ListItem>
            ))}
          </InfiniteScroll>
        )}
      </Spin>
    </div>
  );
};

export default ResourceLinks;
