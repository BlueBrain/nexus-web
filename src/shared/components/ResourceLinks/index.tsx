import * as React from 'react';
import './ResourceLinks.less';
import * as InfiniteScroll from 'react-infinite-scroller';
import { ResourceLink } from '@bbp/nexus-sdk';
import { List } from 'antd';

const ResourceLinks: React.FunctionComponent<{
  busy: boolean;
  error: Error | null;
  links: ResourceLink[];
  total: number;
}> = props => {
  const { busy, error, links, total } = props;
  const scrollParent = React.useRef<HTMLDivElement>(null);
  const handleLoadMore = () => {
    console.log('load more plz');
  };
  console.log({ links });
  return (
    <div className="resource-links" ref={scrollParent}>
      <InfiniteScroll
        pageStart={0}
        loadMore={handleLoadMore}
        useWindow={false}
        getScrollParent={() => scrollParent && scrollParent.current}
      >
        <List
          dataSource={links}
          renderItem={link => (
            <List.Item>
              <a>{link['@id']}</a>
            </List.Item>
          )}
        ></List>
      </InfiniteScroll>

      {/* <InfiniteScroll
        fetchablePaginatedList={fetchablePaginatedList}
        loadNextPage={next}
        itemComponent={(resourceLink: ResourceLink, index: number) => {
          const predicate = labelOf(resourceLink.predicate);
          return (
            <>
              {resourceLink.isExternal ? (
                <a
                  className="clickable-container resource-item"
                  href={resourceLink.link as string}
                  target="_blank"
                >
                  <ListItem
                    id={resourceLink.link as string}
                    label={
                      <>
                        {linkDirection === LinkDirection.INCOMING ? (
                          <span className="predicate">
                            <Icon type="arrow-right" /> {predicate}
                          </span>
                        ) : (
                          <span className="predicate">
                            {predicate} <Icon type="arrow-right" />
                          </span>
                        )}
                        <Icon type="export" /> {resourceLink.link as string}
                      </>
                    }
                  />
                </a>
              ) : (
                <QueryListItem
                  predicate={
                    linkDirection === LinkDirection.INCOMING ? (
                      <>
                        <Icon type="arrow-right" /> {predicate}
                      </>
                    ) : (
                      <>
                        {predicate} <Icon type="arrow-right" />
                      </>
                    )
                  }
                  resource={resourceLink.link as Resource}
                  onClick={() => goToResource(resourceLink.link as Resource)}
                />
              )}
            </>
          );
        }}
      /> */}
    </div>
  );
};

export default ResourceLinks;
