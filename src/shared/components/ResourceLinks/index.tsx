import * as React from 'react';
import './ResourceLinks.less';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { ResourceLink } from '@bbp/nexus-sdk';
import ListItem from '../List/Item';
import InfiniteScroll = require('react-infinite-scroller');
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
      <InfiniteScroll
        pageStart={0}
        hasMore={hasMore}
        loadMore={() => {
          // We will manually load stuff with the load more button
          // Otherwise there is an infinite loop that I don't
          // understand
        }}
        loader={
          <ListItem key={'Load More'} onClick={() => onLoadMore(links.length)}>
            <a>Load More</a>
          </ListItem>
        }
      >
        {links.map(link => (
          <ListItem
            key={link['@id']}
            onClick={() => {
              onClick && onClick(link);
            }}
          >
            <ResourceLinkItem link={link} />
          </ListItem>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ResourceLinks;
