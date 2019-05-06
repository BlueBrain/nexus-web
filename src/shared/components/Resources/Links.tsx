import * as React from 'react';
import {
  Resource,
  PaginationSettings,
  NexusFile,
  PaginatedList,
} from '@bbp/nexus-sdk';
import { Spin, Card, Icon } from 'antd';

import AnimatedList from '../Animations/AnimatedList';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import { labelOf } from '../../utils';

import './links-container.less';
import { LinkDirection } from '../../store/actions/nexus/links';
import QueryListItem from '../Workspace/Queries/Query/QueryItem';
import { LinksState } from '../../store/reducers/links';
import InfiniteScroll from '../Animations/InfiniteScroll';
import { FetchableState } from '../../store/reducers/utils';

export interface LinksListProps extends LinksContainerProps {
  linkDirection: LinkDirection;
}

const LinksList: React.FunctionComponent<LinksListProps> = props => {
  const {
    links,
    goToResource,
    fetchLinks,
    linkDirection,
    resource,
    linksListPageSize,
    getFilePreview,
  } = props;
  const linkState = links && links[linkDirection];
  const from = (linkState && linkState.data && linkState.data.index) || 0;
  const total = (linkState && linkState.data && linkState.data.total) || 0;
  const paginationSettings = { from, total, size: linksListPageSize };
  const fetchablePaginatedList: FetchableState<PaginatedList<ResourceLink>> = {
    error: (linkState && linkState.error) || null,
    isFetching: (linkState && linkState.isFetching) || false,
    data: (linkState && linkState.data) || {
      index: 0,
      total: 0,
      results: [],
    },
  };

  React.useEffect(() => {
    fetchLinks(resource, linkDirection, paginationSettings);
  }, [resource]);

  if (typeof getFilePreview !== 'function') {
    console.warn('getFielPReview has the wrong type!', getFilePreview);
    return null;
  }

  const next = () => {
    fetchLinks(resource, linkDirection, {
      ...paginationSettings,
      from:
        ((fetchablePaginatedList.data && fetchablePaginatedList.data.index) ||
          0) +
        1 * paginationSettings.size,
    });
  };

  return (
    <div className="links">
      <h3 className="title">
        {linkDirection === LinkDirection.INCOMING ? (
          <Icon type="download" />
        ) : (
          <Icon type="upload" />
        )}{' '}
        {linkDirection} Links
      </h3>
      <InfiniteScroll
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
                  <div className="predicate">{predicate}</div>
                  <div className="label">
                    <div className="name">
                      <Icon type="export" /> {resourceLink.link as string}
                    </div>
                  </div>
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
                  getFilePreview={getFilePreview}
                  onClick={() => goToResource(resourceLink.link as Resource)}
                />
              )}
            </>
          );
        }}
      />
    </div>
  );
};

export interface LinksContainerProps {
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  fetchLinks: (
    resource: Resource,
    linkDirection: LinkDirection,
    paginationSettings: PaginationSettings
  ) => void;
  resource: Resource;
  linksListPageSize: number;
  links: LinksState | null;
}

const LinksContainer: React.FunctionComponent<LinksContainerProps> = props => {
  return (
    <div className="links-container">
      <Card>
        <LinksList linkDirection={LinkDirection.INCOMING} {...props} />
      </Card>

      <Card>
        <LinksList linkDirection={LinkDirection.OUTGOING} {...props} />
      </Card>
    </div>
  );
};

export default LinksContainer;
