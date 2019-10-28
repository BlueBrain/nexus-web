import * as React from 'react';
import { Spin, Empty } from 'antd';
import { ResourceLink } from '@bbp/nexus-sdk';

import ListItem from '../List/Item';
import ResourceLinkItem from './ResourceLinkItem';
import InfiniteSearch from '../List/InfiniteSearch';

const ResourceLinks: React.FunctionComponent<{
  busy: boolean;
  error: Error | null;
  links: ResourceLink[];
  total: number;
  onLoadMore: () => void;
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
          <InfiniteSearch
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
      </Spin>
    </div>
  );
};

export default ResourceLinks;
